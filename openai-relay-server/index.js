import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { config } from 'dotenv';

config();

const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SEGMENT_PROFILE_TOKEN = process.env.SEGMENT_PROFILE_TOKEN;
const SEGMENT_SPACE_ID = process.env.SEGMENT_SPACE_ID;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Logging helper
const log = {
  debug: (...args) => LOG_LEVEL === 'debug' && console.log('[DEBUG]', ...args),
  info: (...args) => ['debug', 'info'].includes(LOG_LEVEL) && console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

// Fetch Segment Profile by phone number
async function fetchSegmentProfile(phone) {
  try {
    // HARDCODED TEST: Use user_id for Eric
    const identifier = `user_id:erwalters@twilio.com`;
    const baseUrl = `https://profiles.segment.com/v1/spaces/${SEGMENT_SPACE_ID}/collections/users/profiles/${identifier}`;

    log.info('Fetching Segment profile for user_id: erwalters@twilio.com');
    log.info('Base URL:', baseUrl);
    log.info('Using space ID:', SEGMENT_SPACE_ID);
    log.info('Auth token present:', !!SEGMENT_PROFILE_TOKEN);

    const authHeader = {
      'Authorization': `Basic ${Buffer.from(`${SEGMENT_PROFILE_TOKEN}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    };

    // Fetch traits
    const traitsUrl = `${baseUrl}/traits`;
    log.info('Fetching traits from:', traitsUrl);
    const traitsResponse = await fetch(traitsUrl, { headers: authHeader });

    if (!traitsResponse.ok) {
      log.warn(`Segment traits not found: ${traitsResponse.status}`);
      return null;
    }

    const traitsData = await traitsResponse.json();
    log.info('Traits fetched:', JSON.stringify(traitsData, null, 2));

    // Fetch events
    const eventsUrl = `${baseUrl}/events`;
    log.info('Fetching events from:', eventsUrl);
    const eventsResponse = await fetch(eventsUrl, { headers: authHeader });

    let eventsData = null;
    if (eventsResponse.ok) {
      eventsData = await eventsResponse.json();
      log.info('Events fetched:', JSON.stringify(eventsData, null, 2));
    } else {
      log.warn(`Events not found: ${eventsResponse.status}`);
    }

    const profile = {
      traits: traitsData.traits || traitsData,
      events: eventsData?.data || []
    };

    log.info('Profile assembled successfully');

    return profile;
  } catch (error) {
    log.error('Error fetching Segment profile:', error);
    return null;
  }
}

// Build system prompt from Segment profile
function buildSystemPrompt(profile) {
  if (!profile || !profile.traits) {
    return `You are a healthcare recruiter for AMN Healthcare.

Be warm, professional, and helpful. Ask the candidate about their nursing experience and what positions they're interested in.

Keep responses conversational and under 2-3 sentences.`;
  }

  const { name, email, job_applied, profession, abandonment_step } = profile.traits;

  // Include recent events if available
  let recentActivity = '';
  if (profile.events && profile.events.length > 0) {
    const recentEvents = profile.events.slice(0, 5).map(e => `- ${e.event} at ${e.timestamp}`).join('\n');
    recentActivity = `\n\nRecent Activity:\n${recentEvents}`;
  }

  return `You are a healthcare recruiter for AMN Healthcare calling ${name || 'the candidate'}.

Candidate Context:
- Name: ${name || 'Unknown'}
- Email: ${email || 'Unknown'}
- Phone: ${profile.traits.phone || 'Unknown'}
- Position Applied: ${job_applied || 'Not specified'}
- Profession: ${profession || 'Not specified'}
- Application Status: ${abandonment_step ? `Abandoned at step: ${abandonment_step}` : 'Started application'}${recentActivity}

Background:
The candidate started applying for a position but didn't complete it. Specifically, they need to upload their credentials to proceed. We sent them an RCS message and they replied, showing interest.

Conversation Flow:
1. OPENING: Say "Hey ${name ? name.split(' ')[0] : ''}, I noticed that you needed help completing your application. Let me know when you have uploaded your credentials."

2. AFTER THEY CONFIRM UPLOAD: Say "Great. Let me take a look at your profile and I can pull up a few jobs in your area that I think you'd be a great fit for."

3. THEN: Ask them about their preferences - location, shift type, specialty, etc.

4. IF THEY HAVEN'T UPLOADED YET: Offer to help them understand what credentials are needed and how to upload them.

Instructions:
- Be conversational and natural
- Keep responses brief (1-2 sentences max)
- Stay on topic - this call is specifically about credential upload
- Don't mention you're an AI
- If they want to speak to a human recruiter, say you'll have someone call them back
- Use their first name occasionally to keep it personal

Remember: The main goal is to get them to upload their credentials so we can match them with jobs.`;
}

// Call OpenAI ChatCompletion API
async function callOpenAI(messages) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 150,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    return response.body;
  } catch (error) {
    log.error('OpenAI API error:', error);
    throw error;
  }
}

// Handle ConversationRelay WebSocket connection
async function handleConversationRelay(ws, callSid) {
  log.info(`New ConversationRelay connection: ${callSid}`);

  let conversationHistory = [];
  let systemPrompt = null;
  let phone = null;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      log.info('Received message type:', data.type);
      log.info('Full message data:', JSON.stringify(data, null, 2));

      switch (data.type) {
        case 'setup':
          log.info('ConversationRelay setup:', {
            callSid: data.callSid,
            from: data.from,
            to: data.to,
            direction: data.direction,
          });

          // Extract phone number - for outbound calls, use 'to' (the candidate being called)
          // Also check customParameters.phone as fallback
          phone = data.direction === 'outbound-api' ? data.to : data.from;

          // Or use customParameters if available
          if (data.customParameters?.phone) {
            phone = data.customParameters.phone;
          }

          log.info('Phone number extracted:', phone, 'from setup.' + (data.direction === 'outbound-api' ? 'to' : 'from'), 'Direction:', data.direction);

          // Fetch Segment profile
          if (phone) {
            log.info('Fetching Segment profile for:', phone);
            const profile = await fetchSegmentProfile(phone);
            log.info('Profile fetched:', profile ? 'SUCCESS' : 'NOT FOUND');
            systemPrompt = buildSystemPrompt(profile);
            log.info('System prompt built, adding to conversation history');
            conversationHistory.push({
              role: 'system',
              content: systemPrompt,
            });

            // Proactively greet the user
            log.info('Generating proactive greeting...');

            // Add a user message to trigger the greeting
            conversationHistory.push({
              role: 'user',
              content: 'The call just connected. Greet me now using the opening line from your instructions.',
            });

            try {
                const stream = await callOpenAI(conversationHistory);
                const reader = stream.getReader();
                const decoder = new TextDecoder();

                let fullResponse = '';
                let buffer = '';

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split('\n');
                  buffer = lines.pop();

                  for (const line of lines) {
                    if (line.startsWith('data: ')) {
                      const data = line.slice(6);
                      if (data === '[DONE]') continue;

                      try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;

                        if (content) {
                          fullResponse += content;
                          ws.send(JSON.stringify({
                            type: 'text',
                            token: content,
                            last: false,
                          }));
                        }
                      } catch (e) {
                        // Skip invalid JSON
                      }
                    }
                  }
                }

                // Send final message
                ws.send(JSON.stringify({
                  type: 'text',
                  token: '',
                  last: true,
                }));

                log.info('AI greeted with full response:', fullResponse);

                // Add to conversation history
                conversationHistory.push({
                  role: 'assistant',
                  content: fullResponse,
                });

            } catch (error) {
              log.error('Error generating greeting:', error);

              // Fallback: Send a generic greeting if personalized one fails
              const fallbackGreeting = profile?.traits?.name
                ? `Hey ${profile.traits.name.split(' ')[0]}, thanks for getting back to us about your application. How can I help you today?`
                : 'Hey there, thanks for getting back to us. How can I help you today?';

              log.warn('Using fallback greeting:', fallbackGreeting);

              ws.send(JSON.stringify({
                type: 'text',
                token: fallbackGreeting,
                last: true,
              }));

              // Add fallback to history
              conversationHistory.push({
                role: 'assistant',
                content: fallbackGreeting,
              });
            }
          }
          break;

        case 'prompt':
          // User spoke - transcript in data.voicePrompt
          const userMessage = data.voicePrompt;
          log.info('User said:', userMessage);

          // Add to conversation history
          conversationHistory.push({
            role: 'user',
            content: userMessage,
          });

          // Get response from OpenAI (streaming)
          try {
            const stream = await callOpenAI(conversationHistory);
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            let fullResponse = '';
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop(); // Keep incomplete line in buffer

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;

                    if (content) {
                      fullResponse += content;

                      // Send token to Twilio
                      ws.send(JSON.stringify({
                        type: 'text',
                        token: content,
                        last: false,
                      }));
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }

            // Send final message
            ws.send(JSON.stringify({
              type: 'text',
              token: '',
              last: true,
            }));

            log.info('AI responded:', fullResponse);

            // Add to conversation history
            conversationHistory.push({
              role: 'assistant',
              content: fullResponse,
            });

          } catch (error) {
            log.error('Error getting OpenAI response:', error);

            // Send error response
            ws.send(JSON.stringify({
              type: 'text',
              token: "I'm having trouble connecting right now. Let me transfer you to a human recruiter.",
              last: true,
            }));
          }
          break;

        case 'interrupt':
          log.info('User interrupted');
          // User interrupted - stop current TTS
          break;

        case 'dtmf':
          log.info('DTMF received:', data.digit);
          break;

        case 'error':
          log.error('ConversationRelay error:', data);
          break;

        default:
          log.debug('Unhandled message type:', data.type);
      }
    } catch (error) {
      log.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    log.info('ConversationRelay connection closed:', callSid);
  });

  ws.on('error', (error) => {
    log.error('WebSocket error:', error);
  });
}

// Create HTTP server
const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const callSid = req.headers['x-twilio-call-sid'] || 'unknown';
  log.info('='.repeat(60));
  log.info('NEW WEBSOCKET CONNECTION ESTABLISHED');
  log.info('='.repeat(60));
  log.info('WebSocket connection received:', {
    callSid,
    url: req.url,
    headers: req.headers,
  });
  handleConversationRelay(ws, callSid);
});

server.listen(PORT, () => {
  log.info(`ConversationRelay server running on port ${PORT}`);
  log.info(`WebSocket endpoint: ws://localhost:${PORT}/`);
  log.info(`Health check: http://localhost:${PORT}/health`);

  if (!OPENAI_API_KEY) {
    log.error('OPENAI_API_KEY not set!');
  }
  if (!SEGMENT_PROFILE_TOKEN) {
    log.warn('SEGMENT_PROFILE_TOKEN not set - calls will not have profile context');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM received, closing server...');
  server.close(() => {
    log.info('Server closed');
    process.exit(0);
  });
});
