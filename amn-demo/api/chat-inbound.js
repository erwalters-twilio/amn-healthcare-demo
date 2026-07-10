import twilio from 'twilio';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY;
const SEGMENT_PROFILE_TOKEN = process.env.SEGMENT_PROFILE_TOKEN;
const SEGMENT_SPACE_ID = process.env.SEGMENT_SPACE_ID;

function getTwilioClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

async function fetchSegmentProfile(userIdentity) {
  if (!SEGMENT_PROFILE_TOKEN || !SEGMENT_SPACE_ID || !userIdentity) return null;
  try {
    const identifier = userIdentity.includes('@')
      ? `email:${userIdentity}`
      : `phone:${userIdentity}`;
    const url = `https://profiles.segment.com/v1/spaces/${SEGMENT_SPACE_ID}/collections/users/profiles/external_id:${identifier}/traits`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${SEGMENT_PROFILE_TOKEN}:`).toString('base64')}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.traits || null;
  } catch {
    return null;
  }
}

async function segmentIdentify(userId, traits) {
  if (!SEGMENT_WRITE_KEY || !userId) return;
  await fetch('https://api.segment.io/v1/identify', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SEGMENT_WRITE_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, traits, timestamp: new Date().toISOString() }),
  });
}

async function segmentTrack(userId, event, properties) {
  if (!SEGMENT_WRITE_KEY) return;
  await fetch('https://api.segment.io/v1/track', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SEGMENT_WRITE_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, event, properties, timestamp: new Date().toISOString() }),
  });
}

const JOB_LIST = `
Available positions at AMN Healthcare:

PHYSICIAN ROLES:
- Emergency Medicine Physician, Cleveland Clinic Main Campus — $350,000–$450,000/yr, full benefits
- Hospitalist, University Hospitals Cleveland — $300,000–$375,000/yr, flexible schedule
- Internal Medicine Physician, MetroHealth System — $280,000–$320,000/yr, sign-on bonus
- Family Medicine Physician, Cleveland Clinic Hillcrest — $260,000–$300,000/yr, outpatient
- Critical Care / ICU Physician, Akron Children's Hospital — $400,000–$500,000/yr, leadership role

NURSING ROLES:
- Travel Nurse ICU, Cleveland Clinic Main Campus — $2,400/week, 13-week assignment
- Staff RN Emergency Department, University Hospitals — $75,000–$95,000/yr
- Travel Nurse Med-Surg, MetroHealth System — $2,200/week, 8-week assignment
- PRN RN Pediatrics, Akron Children's Hospital — $52/hr, flexible schedule
- Staff RN Operating Room, Cleveland Clinic Hillcrest — $80,000–$100,000/yr + sign-on bonus
`;

function buildChatSystemPrompt(profileTraits) {
  const profile = profileTraits
    ? `Known profile:\n${Object.entries(profileTraits).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`
    : 'No existing profile — candidate is new or anonymous.';

  return `You are a helpful AMN Healthcare recruitment assistant on the website. Your job is to help candidates find the right healthcare role and collect their preferences so a recruiter can follow up effectively.

${profile}

${JOB_LIST}

Your approach:
1. Understand what the candidate is looking for (profession, specialty, location, shift type, salary)
2. Suggest matching roles from the job list naturally — don't just list everything
3. Ask clarifying questions one at a time if needed
4. Be warm, conversational, and concise (2-4 sentences per response)
5. Do not mention you are an AI

You MUST respond with valid JSON only, no other text. Format:
{
  "reply": "Your conversational response here",
  "extractedPreferences": {
    "firstName": "candidate's first name if shared",
    "lastName": "candidate's last name if shared",
    "email": "candidate's email address if shared",
    "phone": "candidate's phone number if shared",
    "profession": "Physician|Nursing|Allied Health if mentioned",
    "specialty": "value if mentioned",
    "location": "city or state if mentioned",
    "shiftType": "staff|travel|per_diem if mentioned",
    "salaryExpectation": "numeric value or range if mentioned",
    "yearsOfExperience": "numeric value if mentioned",
    "licenseState": "state abbreviation if mentioned",
    "availabilityDate": "date or timeframe if mentioned",
    "facilityType": "hospital|clinic|outpatient|other if mentioned",
    "currentRole": "their current job title if mentioned"
  }
}

Only include keys in extractedPreferences that the candidate explicitly mentioned in their latest message. Omit keys you're not confident about.`;
}

async function callOpenAI(messages) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

export default async function handler(req, res) {
  // Handle conversation creation
  if (req.method === 'POST' && req.url?.includes('action=create')) {
    try {
      const client = getTwilioClient();
      const conversation = await client.conversations.v1.conversations.create({
        friendlyName: `Web Chat — ${new Date().toISOString()}`,
        attributes: JSON.stringify({ source: 'web_chat', created_at: new Date().toISOString() }),
      });
      return res.status(200).json({ conversationSid: conversation.sid });
    } catch (err) {
      console.error('Failed to create conversation:', err);
      return res.status(500).json({ error: 'Failed to create conversation' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { conversationSid, message, userIdentity, messageHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    const client = getTwilioClient();

    // Add user message to Twilio Conversation (if sid available)
    if (conversationSid) {
      try {
        await client.conversations.v1.conversations(conversationSid).messages.create({
          body: message,
          author: userIdentity || 'candidate',
        });
      } catch (err) {
        console.warn('Could not add user message to conversation:', err.message);
      }
    }

    // Optionally fetch Segment profile for context
    const profileTraits = await fetchSegmentProfile(userIdentity);

    // Build OpenAI messages
    const systemPrompt = buildChatSystemPrompt(profileTraits);
    const openaiMessages = [{ role: 'system', content: systemPrompt }];

    // Include prior conversation history (trim to last 10 exchanges)
    const history = messageHistory.slice(-20);
    for (const msg of history) {
      openaiMessages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
    }

    // Get AI response
    const rawResponse = await callOpenAI(openaiMessages);
    let parsed;
    try {
      parsed = JSON.parse(rawResponse);
    } catch {
      parsed = { reply: rawResponse, extractedPreferences: {} };
    }

    const { reply, extractedPreferences = {} } = parsed;

    // Write extracted preferences to Segment
    if (userIdentity && Object.keys(extractedPreferences).length > 0) {
      await segmentIdentify(userIdentity, extractedPreferences);
      await segmentTrack(userIdentity, 'Chat Preference Captured', {
        channel: 'web_chat',
        conversation_sid: conversationSid,
        fields_captured: Object.keys(extractedPreferences),
        ...extractedPreferences,
      });
    }

    // Track message sent event
    await segmentTrack(userIdentity || `anon_${Date.now()}`, 'Chat Message Sent', {
      channel: 'web_chat',
      conversation_sid: conversationSid,
      message_length: message.length,
    });

    // Add AI reply to Twilio Conversation
    if (conversationSid && reply) {
      try {
        await client.conversations.v1.conversations(conversationSid).messages.create({
          body: reply,
          author: 'AMN Assistant',
        });
      } catch (err) {
        console.warn('Could not add AI reply to conversation:', err.message);
      }
    }

    return res.status(200).json({ reply, extractedPreferences, conversationSid });
  } catch (err) {
    console.error('chat-inbound error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      reply: "I'm having trouble connecting right now. Please try again in a moment.",
      extractedPreferences: {},
    });
  }
}
