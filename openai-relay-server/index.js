import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { config } from 'dotenv';

config();

const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SEGMENT_PROFILE_TOKEN = process.env.SEGMENT_PROFILE_TOKEN;
const SEGMENT_SPACE_ID = process.env.SEGMENT_SPACE_ID;
const SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY;
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

// Fetch Segment Profile by phone number
async function fetchSegmentProfile(phone) {
  try {
    // Use phone number if provided, fall back to test user for dev
    const identifier = phone
      ? `external_id:phone:${phone}`
      : `user_id:erwalters@twilio.com`;
    const baseUrl = `https://profiles.segment.com/v1/spaces/${SEGMENT_SPACE_ID}/collections/users/profiles/${identifier}`;

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
  if (!profile || !profile.traits) {
    return `You are Jamie, a healthcare recruiter for AMN Healthcare.

Be warm and professional. Before recommending any jobs, collect these fields one at a time:
1. Shift type (staff vs travel)
2. Location preference
3. Salary expectation
4. Start date availability

After each confirmed answer, output on its own line: [FIELD:fieldName=value]
After collecting all fields, recommend relevant healthcare jobs and offer a recruiter transfer.
When transferring, output on its own line: [TRANSFER]

Keep each response to 2-3 sentences. Do not mention you are an AI.`;
  }

  const { firstName, lastName, email, job_applied, profession, specialty, discipline, city,
          shiftType, locationPreference, salaryExpectation, startDate, travelWillingness } = profile.traits;
  const name = firstName && lastName ? `${firstName} ${lastName}` : (firstName || lastName || 'there');
  const firstName_ = firstName || name;

  log.info('Building system prompt with name:', name, 'profession:', profession, 'specialty:', specialty);

  const isPhysician = profession === 'Physician' || profession === 'Doctor';

  const jobList = isPhysician ? `
PHYSICIAN JOBS:
- Emergency Medicine Physician, Cleveland Clinic Main Campus, three hundred fifty thousand to four hundred fifty thousand dollars per year, full benefits
- Hospitalist, University Hospitals Cleveland, three hundred thousand to three hundred seventy five thousand dollars per year, flexible schedule
- Internal Medicine Physician, MetroHealth System, two hundred eighty thousand to three hundred twenty thousand dollars per year, sign-on bonus
- Family Medicine Physician, Cleveland Clinic Hillcrest, two hundred sixty thousand to three hundred thousand dollars per year, outpatient clinic
- Critical Care Physician, Akron Children's Hospital, four hundred thousand to five hundred thousand dollars per year, ICU leadership role` :
`NURSING JOBS:
- Travel Nurse ICU, Cleveland Clinic Main Campus, twenty four hundred dollars per week, thirteen week assignment
- Staff RN Emergency Department, University Hospitals Cleveland, seventy five thousand to ninety five thousand dollars per year
- Travel Nurse Med-Surg, MetroHealth System, twenty two hundred dollars per week, eight week assignment
- PRN RN Pediatrics, Akron Children's Hospital, fifty two dollars per hour, flexible schedule
- Staff RN Operating Room, Cleveland Clinic Hillcrest, eighty thousand to one hundred thousand dollars per year with sign-on bonus`;

  // Determine which fields still need to be collected
  const missingFields = [];
  if (!shiftType) missingFields.push({ key: 'shiftType', question: 'Are you looking for a travel assignment or a permanent staff position?' });
  if (!locationPreference && !city) missingFields.push({ key: 'locationPreference', question: 'Do you have a specific location in mind, or are you flexible on where you work?' });
  if (!salaryExpectation) missingFields.push({ key: 'salaryExpectation', question: `What's your target compensation — roughly what range are you looking for?` });
  if (!startDate) missingFields.push({ key: 'startDate', question: 'When would you be available to start a new position?' });

  const missingFieldsText = missingFields.length > 0
    ? `FIELDS TO COLLECT (ask one at a time in this order):\n${missingFields.map((f, i) => `${i + 1}. ${f.key}: "${f.question}"`).join('\n')}`
    : `All key profile fields are already collected. Skip directly to STEP 4.`;

  const knownFields = [
    profession && `Profession: ${profession}`,
    specialty && `Specialty: ${specialty}`,
    discipline && `Discipline: ${discipline}`,
    city && `City: ${city}`,
    shiftType && `Shift type: ${shiftType}`,
    locationPreference && `Location preference: ${locationPreference}`,
    salaryExpectation && `Salary expectation: ${salaryExpectation}`,
    startDate && `Start date: ${startDate}`,
    job_applied && `Job applied for: ${job_applied}`,
  ].filter(Boolean).join('\n- ');

  const systemPrompt = `You are Jamie, a warm and professional healthcare recruiter for AMN Healthcare, calling ${firstName_}.

WHAT WE KNOW ABOUT ${firstName_.toUpperCase()}:
- Name: ${name}
- ${knownFields || 'Limited profile data — proceed to collecting information'}

${missingFieldsText}

AVAILABLE JOBS (ONLY recommend jobs matching profession: ${profession || 'healthcare professional'}):
${jobList}

STRICT CONVERSATION FLOW — follow these steps in order:

STEP 1 — OPENING
Greet ${firstName_} warmly by first name. Say you're calling from AMN Healthcare to personally help match them with the right healthcare opportunity. Keep it to 1-2 sentences.

STEP 2 — TRANSITION (only if there are fields to collect)
Say something like: "I want to make sure I find you exactly the right fit. I have just a couple quick questions — it'll only take a minute."

STEP 3 — COLLECT MISSING FIELDS (one at a time)
Ask each field from the FIELDS TO COLLECT list ONE question at a time. After the candidate answers and you've confirmed it, end your response with the field token on its own line:
[FIELD:fieldName=value]

Example: If they say "I want a staff position", respond naturally and end with:
[FIELD:shiftType=staff]

Use these exact field names: shiftType, locationPreference, salaryExpectation, startDate
Values should be concise: shiftType="staff"|"travel"|"per_diem", locationPreference=city or "flexible", salaryExpectation=number, startDate="immediately"|"30 days"|specific date

STEP 4 — CONFIRM SUMMARY
Once all fields are collected (or if already known), give a brief summary: "Great — so you're a ${profession || 'healthcare professional'} looking for [shiftType] work in [location], targeting [salary], available [startDate]. Does that sound right?"

STEP 5 — RECOMMEND JOBS
After the summary is confirmed, recommend 1-2 jobs from the job list that best match their criteria. Be conversational — don't read a list. Mention the facility name and compensation naturally.

STEP 6 — TRANSFER TO RECRUITER
When they express interest in a specific role, say: "Perfect! Let me connect you with one of our specialized recruiters who has all the details. Hold on just a moment." Then on its own line:
[TRANSFER]

RULES:
- Keep each response to 2-3 sentences (plus any [FIELD:] token)
- [FIELD:] and [TRANSFER] tokens go on their own line at the END of your response, after the speech
- NEVER recommend jobs before completing Steps 3-4
- ONLY recommend ${isPhysician ? 'physician' : 'nursing'} jobs
- Speak salaries naturally: "three hundred thousand dollars" not "$300k"
- Do NOT mention you are an AI
- Use ${firstName_}'s first name occasionally to keep it personal`;

  log.info('System prompt created, missing fields to collect:', missingFields.map(f => f.key));
  return systemPrompt;
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
  let userProfile = null;

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
                          // Strip metadata tokens before sending to TTS
                          const cleanContent = content
                            .replace(/\[TRANSFER\]/g, '')
                            .replace(/\[FIELD:[^\]]*\]/g, '');
                          if (cleanContent) {
                            ws.send(JSON.stringify({
                              type: 'text',
                              token: cleanContent,
                              last: false,
                            }));
                          }
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

                      // Don't send [TRANSFER] marker to the user
                      if (!content.includes('[TRANSFER]')) {
                        // Send token to Twilio
                        ws.send(JSON.stringify({
                          type: 'text',
                          token: content,
                          last: false,
                        }));
                      }
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

            // Extract and write any collected fields to Segment
            const fieldMatches = [...fullResponse.matchAll(/\[FIELD:(\w+)=([^\]]+)\]/g)];
            for (const [, fieldName, fieldValue] of fieldMatches) {
              const userId = userProfile?.traits?.email || phone;
              if (userId) {
                await segmentIdentify(userId, { [fieldName]: fieldValue });
                await trackSegmentEvent(userId, 'Profile Field Collected', {
                  field_name: fieldName,
                  field_value: fieldValue,
                  channel: 'ai_voice',
                  call_sid: callSid,
                  phone,
                });
                log.info(`Field written to Segment: ${fieldName}=${fieldValue}`);
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
              const userId = userProfile?.traits?.email || phone;
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

              // End the call
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
