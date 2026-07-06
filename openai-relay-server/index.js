import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { config } from 'dotenv';

config();

const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SEGMENT_PROFILE_TOKEN = process.env.SEGMENT_PROFILE_TOKEN;
const SEGMENT_SPACE_ID = process.env.SEGMENT_SPACE_ID;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const OPENAI_REALTIME_URL = 'wss://api.openai.com/v1/realtime?model=gpt-realtime-2';

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
    // Normalize phone to E.164 format (remove spaces, dashes)
    const normalizedPhone = phone.replace(/[^\d+]/g, '');

    const url = `https://profiles.segment.com/v1/spaces/${SEGMENT_SPACE_ID}/collections/users/profiles/phone:${encodeURIComponent(normalizedPhone)}`;

    log.debug('Fetching Segment profile:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${SEGMENT_PROFILE_TOKEN}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      log.warn(`Segment profile not found for ${normalizedPhone}: ${response.status}`);
      return null;
    }

    const profile = await response.json();
    log.info('Segment profile fetched:', {
      phone: normalizedPhone,
      name: profile.traits?.name,
      email: profile.traits?.email,
    });

    return profile;
  } catch (error) {
    log.error('Error fetching Segment profile:', error);
    return null;
  }
}

// Build AI system instructions from Segment profile
function buildSystemInstructions(profile) {
  if (!profile || !profile.traits) {
    return `You are a healthcare recruiter for AMN Healthcare.

Be warm, professional, and helpful. Ask the candidate about their nursing experience and what positions they're interested in.`;
  }

  const { name, job_applied, profession, abandonment_step } = profile.traits;

  return `You are a healthcare recruiter for AMN Healthcare calling ${name || 'the candidate'}.

Candidate Context:
- Name: ${name || 'Unknown'}
- Phone: ${profile.traits.phone || 'Unknown'}
- Position Applied: ${job_applied || 'Not specified'}
- Profession: ${profession || 'Not specified'}
- Application Status: ${abandonment_step ? `Started but abandoned at ${abandonment_step}` : 'In progress'}

Background:
The candidate started applying for a position but didn't complete it. We sent them an RCS message and they replied, showing interest. You're following up with a phone call.

Your Goal:
1. Warmly greet them by name
2. Reference the specific job they applied for
3. Ask what questions they have about the position
4. Offer to help them complete the application
5. Address any concerns they might have

Instructions:
- Be conversational and natural
- Keep responses under 30 seconds
- Listen actively to their questions
- Don't mention you're an AI unless directly asked
- If they want to speak to a human recruiter, offer to schedule a callback
- Be enthusiastic about the position and their qualifications

Remember: You're here to help them, not pressure them. Make this a positive experience.`;
}

// Handle Twilio → OpenAI relay for a single call
async function handleTwilioConnection(twilioWs, callSid) {
  log.info(`New Twilio connection: ${callSid}`);

  let openaiWs = null;
  let streamSid = null;
  let phone = null;
  let profile = null;

  // Buffer for OpenAI audio responses
  const audioBuffer = [];
  let isOpenAIReady = false;

  twilioWs.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      log.debug('Twilio message:', data.event);

      switch (data.event) {
        case 'start':
          streamSid = data.streamSid;
          phone = data.start.customParameters?.phone;

          log.info('Call started:', { streamSid, phone, callSid });

          // Fetch Segment profile
          if (phone) {
            profile = await fetchSegmentProfile(phone);
          }

          // Connect to OpenAI Realtime API
          openaiWs = new WebSocket(OPENAI_REALTIME_URL, {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'OpenAI-Beta': 'realtime=v1',
            },
          });

          openaiWs.on('open', () => {
            log.info('Connected to OpenAI Realtime API');

            // Configure session with system instructions
            const sessionConfig = {
              type: 'session.update',
              session: {
                modalities: ['text', 'audio'],
                instructions: buildSystemInstructions(profile),
                voice: 'alloy',
                input_audio_format: 'g711_ulaw',
                output_audio_format: 'g711_ulaw',
                input_audio_transcription: {
                  model: 'whisper-1',
                },
                turn_detection: {
                  type: 'server_vad',
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 500,
                },
              },
            };

            openaiWs.send(JSON.stringify(sessionConfig));
            log.debug('Session configured with profile context');

            isOpenAIReady = true;

            // Send any buffered audio
            if (audioBuffer.length > 0) {
              log.debug(`Sending ${audioBuffer.length} buffered audio chunks`);
              audioBuffer.forEach(chunk => openaiWs.send(chunk));
              audioBuffer.length = 0;
            }
          });

          openaiWs.on('message', (message) => {
            try {
              const data = JSON.parse(message);
              log.debug('OpenAI message:', data.type);

              // Send audio back to Twilio
              if (data.type === 'response.audio.delta' && data.delta) {
                const audioMessage = {
                  event: 'media',
                  streamSid: streamSid,
                  media: {
                    payload: data.delta,
                  },
                };
                twilioWs.send(JSON.stringify(audioMessage));
              }

              // Log transcriptions for debugging
              if (data.type === 'conversation.item.input_audio_transcription.completed') {
                log.info('User said:', data.transcript);
              }

              if (data.type === 'response.audio_transcript.done') {
                log.info('AI said:', data.transcript);
              }
            } catch (error) {
              log.error('Error processing OpenAI message:', error);
            }
          });

          openaiWs.on('error', (error) => {
            log.error('OpenAI WebSocket error:', error);
          });

          openaiWs.on('close', () => {
            log.info('OpenAI connection closed');
          });
          break;

        case 'media':
          // Forward audio from Twilio to OpenAI
          if (data.media && data.media.payload) {
            const audioMessage = {
              type: 'input_audio_buffer.append',
              audio: data.media.payload,
            };

            if (openaiWs && openaiWs.readyState === WebSocket.OPEN && isOpenAIReady) {
              openaiWs.send(JSON.stringify(audioMessage));
            } else {
              // Buffer audio until OpenAI is ready
              audioBuffer.push(JSON.stringify(audioMessage));
            }
          }
          break;

        case 'stop':
          log.info('Call ended:', { streamSid, callSid });
          if (openaiWs) {
            openaiWs.close();
          }
          break;

        default:
          log.debug('Unhandled Twilio event:', data.event);
      }
    } catch (error) {
      log.error('Error processing Twilio message:', error);
    }
  });

  twilioWs.on('close', () => {
    log.info('Twilio connection closed:', callSid);
    if (openaiWs) {
      openaiWs.close();
    }
  });

  twilioWs.on('error', (error) => {
    log.error('Twilio WebSocket error:', error);
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
  log.info('WebSocket connection received:', {
    callSid,
    url: req.url,
    headers: req.headers,
  });
  handleTwilioConnection(ws, callSid);
});

server.listen(PORT, () => {
  log.info(`OpenAI Realtime Relay server running on port ${PORT}`);
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
