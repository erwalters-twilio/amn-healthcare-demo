import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { config } from 'dotenv';

config();

const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SEGMENT_PROFILE_TOKEN = process.env.SEGMENT_PROFILE_TOKEN;
const SEGMENT_SPACE_ID = process.env.SEGMENT_SPACE_ID;
const SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY;
const SEGMENT_USER_ID = process.env.SEGMENT_USER_ID;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const VERCEL_URL = process.env.VERCEL_URL || 'https://amn-demo.vercel.app';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Logging helper
const log = {
  debug: (...args) => LOG_LEVEL === 'debug' && console.log('[DEBUG]', ...args),
  info: (...args) => ['debug', 'info'].includes(LOG_LEVEL) && console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

// Write traits to Segment profile
async function segmentIdentify(userId, traits = {}) {
  if (!SEGMENT_WRITE_KEY) {
    log.warn('SEGMENT_WRITE_KEY not set, skipping identify');
    return;
  }
  try {
    const payload = {
      userId,
      traits,
      timestamp: new Date().toISOString(),
    };
    log.info('Segment identify:', userId, traits);
    const response = await fetch('https://api.segment.io/v1/identify', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${SEGMENT_WRITE_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      log.error('Segment identify failed:', response.status, await response.text());
    }
  } catch (error) {
    log.error('Error calling Segment identify:', error);
  }
}

// Send event to Segment
async function trackSegmentEvent(userId, eventName, properties = {}) {
  if (!SEGMENT_WRITE_KEY) {
    log.warn('SEGMENT_WRITE_KEY not set, skipping event tracking');
    return;
  }

  try {
    const payload = {
      userId: userId,
      event: eventName,
      properties: properties,
      timestamp: new Date().toISOString(),
    };

    log.info('Tracking Segment event:', eventName, 'for user:', userId);

    const response = await fetch('https://api.segment.io/v1/track', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${SEGMENT_WRITE_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      log.error('Failed to track Segment event:', response.status, await response.text());
    } else {
      log.info('Segment event tracked successfully');
    }
  } catch (error) {
    log.error('Error tracking Segment event:', error);
  }
}

// Redirect an in-progress Twilio call to the Flex enqueue endpoint
async function redirectCallToFlex(callSid, phone) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    log.warn('TWILIO_ACCOUNT_SID/AUTH_TOKEN not set — cannot redirect call via API');
    return false;
  }
  if (!callSid || callSid === 'unknown') {
    log.warn('callSid is unknown — cannot redirect call via API');
    return false;
  }
  try {
    const enqueueUrl = `${VERCEL_URL}/api/voice/enqueue?phone=${encodeURIComponent(phone)}`;
    log.info('Redirecting call', callSid, 'to Flex via', enqueueUrl);
    const body = new URLSearchParams({ Url: enqueueUrl, Method: 'GET' });
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    );
    if (!response.ok) {
      const text = await response.text();
      log.error('Twilio call redirect failed:', response.status, text);
      return false;
    }
    log.info('Call redirect to Flex succeeded for', callSid);
    return true;
  } catch (error) {
    log.error('Error redirecting call to Flex:', error);
    return false;
  }
}

// Fetch Segment Profile by phone number
async function fetchSegmentProfile(phone) {
  try {
    // Use phone number if provided, fall back to test user for dev
    const identifier = phone
      ? `anonymous_id:${phone}`
      : `user_id:erwalters@twilio.com`;
    const baseUrl = `https://profiles.segment.com/v1/spaces/${SEGMENT_SPACE_ID}/collections/users/profiles/${encodeURIComponent(identifier)}`;

    log.info('Fetching Segment profile for:', identifier);
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
    log.info('Profile traits:', JSON.stringify(profile.traits, null, 2));
    log.info('Profile has', profile.events.length, 'events');

    return profile;
  } catch (error) {
    log.error('Error fetching Segment profile:', error);
    return null;
  }
}

// Build system prompt from Segment profile
function buildSystemPrompt(profile) {
  const traits = profile?.traits || {};
  const { firstName, lastName, profession, specialty, discipline, city,
          dateOfBirth, licenseState, yearsOfExperience, shiftPreference, availableStartDate } = traits;
  const name = firstName && lastName ? `${firstName} ${lastName}` : (firstName || lastName || 'there');
  const firstName_ = firstName || 'there';

  log.info('Building system prompt with name:', name, 'profession:', profession, 'specialty:', specialty);

  // Determine which profile completion fields are still missing
  const allFields = [
    {
      key: 'dateOfBirth',
      label: 'date of birth',
      question: "I just need to confirm your date of birth for our records — what is it?",
      current: dateOfBirth,
    },
    {
      key: 'licenseState',
      label: 'license state',
      question: `Which state is your ${profession || 'clinical'} license currently active in?`,
      current: licenseState,
    },
    {
      key: 'yearsOfExperience',
      label: 'years of experience',
      question: `How many years of experience do you have in ${specialty || 'your specialty'}?`,
      current: yearsOfExperience,
    },
    {
      key: 'shiftPreference',
      label: 'shift preference',
      question: 'Do you prefer day shifts, night shifts, or are you open to either?',
      current: shiftPreference,
    },
    {
      key: 'availableStartDate',
      label: 'available start date',
      question: 'When would you be available to start a new position — are you able to start soon, or do you need some time?',
      current: availableStartDate,
    },
  ];

  const missingFields = allFields.filter(f => !f.current);
  const collectedFields = allFields.filter(f => f.current);

  const knownContext = [
    profession && `Profession: ${profession}`,
    specialty && `Specialty: ${specialty}`,
    discipline && `Discipline: ${discipline}`,
    city && `Current location: ${city}`,
    ...collectedFields.map(f => `${f.label}: ${f.current}`),
  ].filter(Boolean).join('\n- ');

  const missingFieldsText = missingFields.length > 0
    ? `MISSING PROFILE FIELDS — collect these one at a time in order:\n${missingFields.map((f, i) => `${i + 1}. ${f.key}: Ask: "${f.question}"`).join('\n')}`
    : 'All profile fields are collected. Proceed directly to STEP 3.';

  return `You are Jamie, a warm and professional healthcare staffing coordinator for AMN Healthcare, calling ${firstName_}.

PURPOSE OF THIS CALL:
${firstName_}'s profile is missing key information that a recruiter needs before they can be matched with an open position. Your job is to collect those missing fields, then transfer ${firstName_} to a recruiter.

WHAT WE ALREADY KNOW ABOUT ${firstName_.toUpperCase()}:
- Name: ${name}
${knownContext ? `- ${knownContext}` : '- Limited profile data on file'}

${missingFieldsText}

STRICT CONVERSATION FLOW:

STEP 1 — OPENING (1-2 sentences only)
Greet ${firstName_} warmly by first name. Say you're calling from AMN Healthcare. Explain that you want to connect them with a recruiter, but first need to quickly fill in a few missing details from their profile so their recruiter is fully prepared. Keep it natural and brief.

Example opener: "Hi ${firstName_}, this is Jamie from AMN Healthcare. I'd love to get you connected with one of our recruiters today, but before I do that, I just need to quickly fill in a few details we're missing from your profile — it'll only take a minute."

STEP 2 — COLLECT MISSING FIELDS (one at a time, in order)
Work through each missing field from the list above. Ask exactly ONE question per turn.

⚠️ CRITICAL RULE: Every single time the candidate gives you an answer to a field question, you MUST include the [FIELD:] token in that same response — no exceptions. If you confirm a value and do not include the token, the data is lost. This is the most important rule in this prompt.

Format for each response when confirming a field:
1. One sentence acknowledging their answer
2. On its own line at the end: [FIELD:fieldName=value]
3. Then ask the next question (if fields remain)

Examples of correct responses:
- Candidate says "I was born March 15, 1985" → "Perfect, thank you. [FIELD:dateOfBirth=1985-03-15] And which state is your clinical license currently active in?"
- Candidate says "I'm licensed in Ohio" → "Got it, Ohio. [FIELD:licenseState=Ohio] How many years of experience do you have in your specialty?"
- Candidate says "about 8 years" → "Great, 8 years of experience. [FIELD:yearsOfExperience=8] Do you prefer day shifts, night shifts, or are you open to either?"
- Candidate says "I prefer nights" → "Noted, nights it is. [FIELD:shiftPreference=nights] And lastly, when would you be available to start a new position?"
- Candidate says "I can start in two weeks" → "Wonderful. [FIELD:availableStartDate=2 weeks]"

STEP 3 — CONFIRM AND TRANSFER
Once ALL fields are collected (after the final [FIELD:] token), say: "Perfect, I now have everything I need. Let me go ahead and connect you with one of our specialized recruiters who can walk you through the best opportunities for you. Just a moment." Then on its own line:
[TRANSFER]

RULES:
- [FIELD:] tokens go inline in your response (not on a separate line) — include them immediately after acknowledging the answer
- [TRANSFER] goes on its own line at the very end
- Do NOT skip the [FIELD:] token for any confirmed answer — ever
- Do NOT recommend specific jobs — that is the recruiter's job
- Do NOT mention you are an AI or a bot
- Use ${firstName_}'s first name occasionally to keep it personal
- Be warm but efficient — this is a quick data collection call, not a long conversation
- If ${firstName_} asks about specific jobs or salary, say "your recruiter will have all of those details — let me just get these last few things and then get you right over to them"`;
}

// Stream a chunk to TTS, buffering across chunk boundaries to strip [TOKEN] markers
// state = { buffer: '' } — pass same object for every chunk in a response
function streamCleanToTTS(ws, chunk, state) {
  state.buffer += chunk;
  while (state.buffer.length > 0) {
    const open = state.buffer.indexOf('[');
    if (open === -1) {
      ws.send(JSON.stringify({ type: 'text', token: state.buffer, last: false }));
      state.buffer = '';
      break;
    }
    if (open > 0) {
      ws.send(JSON.stringify({ type: 'text', token: state.buffer.slice(0, open), last: false }));
    }
    const close = state.buffer.indexOf(']', open);
    if (close === -1) {
      // Token incomplete — hold from '[' and wait for more chunks
      state.buffer = state.buffer.slice(open);
      break;
    }
    // Complete token found — discard it, continue with remainder
    state.buffer = state.buffer.slice(close + 1);
  }
}

// Field collection order and targeted extraction instructions
const FIELD_COLLECTION = [
  { key: 'dateOfBirth',       instruction: 'Extract the date of birth. Return ISO format YYYY-MM-DD. Example: "March 15 1985" → "1985-03-15".' },
  { key: 'licenseState',      instruction: 'Extract the US state where their clinical license is active. Return the state name or abbreviation.' },
  { key: 'yearsOfExperience', instruction: 'Extract the number of years of clinical experience. Return a number only.' },
  { key: 'shiftPreference',   instruction: 'Extract shift preference. Return exactly one of: "days", "nights", or "either".' },
  { key: 'availableStartDate',instruction: 'Extract when they can start a new position. Return a brief plain-text description.' },
];

// Extract one specific field value from the candidate's raw response
async function extractSpecificField(fieldKey, instruction, candidateSpeech) {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `${instruction} Return JSON: {"value": "..."} or {"value": null} if the information is not present. Return only valid JSON, no other text.`,
          },
          { role: 'user', content: candidateSpeech },
        ],
        temperature: 0,
        max_tokens: 50,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const result = JSON.parse(data.choices[0].message.content);
    return result.value || null;
  } catch {
    return null;
  }
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
        max_tokens: 400,
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
async function handleConversationRelay(ws, initialCallSid) {
  log.info(`New ConversationRelay connection: ${initialCallSid}`);

  let callSid = initialCallSid; // updated from setup message
  let conversationHistory = [];
  let systemPrompt = null;
  let phone = null;
  let userProfile = null;
  const collectedFieldKeys = new Set();

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      log.info('Received message type:', data.type);
      log.info('Full message data:', JSON.stringify(data, null, 2));

      switch (data.type) {
        case 'setup':
          // Capture the real callSid from the setup payload
          if (data.callSid) callSid = data.callSid;
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
            userProfile = await fetchSegmentProfile(phone);
            log.info('Profile fetched:', userProfile ? 'SUCCESS' : 'NOT FOUND');
            systemPrompt = buildSystemPrompt(userProfile);
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
                const ttsState = { buffer: '' };

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
                          streamCleanToTTS(ws, content, ttsState);
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
            const ttsState = { buffer: '' };

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
                      streamCleanToTTS(ws, content, ttsState);
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

            // Parse [FIELD:key=value] tokens the AI emits and identify each one
            const fieldTokenRegex = /\[FIELD:(\w+)=([^\]]+)\]/g;
            let fieldMatch;
            const userId = userProfile?.traits?.email || SEGMENT_USER_ID || phone;
            while ((fieldMatch = fieldTokenRegex.exec(fullResponse)) !== null) {
              const fieldKey = fieldMatch[1];
              const fieldValue = fieldMatch[2].trim();
              if (fieldKey && fieldValue && !collectedFieldKeys.has(fieldKey)) {
                collectedFieldKeys.add(fieldKey);
                log.info('[FIELD] token captured:', fieldKey, '=', fieldValue);
                if (userId) {
                  await segmentIdentify(userId, { [fieldKey]: fieldValue });
                  await trackSegmentEvent(userId, 'Profile Field Collected', {
                    field_name: fieldKey,
                    field_value: fieldValue,
                    phone,
                    call_sid: callSid,
                    channel: 'ai_voice',
                  });
                  log.info('Segment identify + track sent:', fieldKey, '=', fieldValue);
                }
              }
            }

            // Strip all metadata tokens for the history entry
            const cleanResponse = fullResponse
              .replace(/\[TRANSFER\]/g, '')
              .replace(/\[FIELD:[^\]]+\]/g, '')
              .trim();

            // Check if response contains transfer trigger
            if (fullResponse.includes('[TRANSFER]')) {
              log.info('Transfer trigger detected, tracking event and ending call');

              conversationHistory.push({
                role: 'assistant',
                content: cleanResponse,
              });

              // Track Segment event
              const userId = userProfile?.traits?.email || SEGMENT_USER_ID || phone;
              if (userId) {
                await trackSegmentEvent(
                  userId,
                  'Call Transferred to Recruiter',
                  {
                    call_sid: callSid,
                    phone: phone,
                    profession: userProfile?.traits?.profession || 'Unknown',
                    specialty: userProfile?.traits?.specialty || 'Unknown',
                    timestamp: new Date().toISOString(),
                    source: 'ai_voice_agent',
                  }
                );
              }

              // Redirect the live call to Flex via Twilio REST API (most reliable)
              const redirected = await redirectCallToFlex(callSid, phone);
              if (!redirected) {
                // Fallback: send type:end and hope TwiML <Enqueue> executes
                log.warn('API redirect failed — falling back to type:end');
              }
              ws.send(JSON.stringify({
                type: 'end',
                reason: 'Transferring to recruiter',
              }));
              return;
            }

            // Add to conversation history
            conversationHistory.push({
              role: 'assistant',
              content: cleanResponse,
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
