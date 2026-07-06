# Using Conversation Relay for AI Voice Calls

**Yes, Conversation Relay is perfect!** It's Twilio's built-in feature for connecting voice calls to AI agents via WebSocket.

## What is Conversation Relay?

Conversation Relay streams bidirectional audio between:
- **Phone call** (candidate's voice)
- **Your AI agent** (via WebSocket)

It handles:
- ✅ Audio encoding/decoding
- ✅ Real-time streaming
- ✅ Interruptions (barge-in)
- ✅ DTMF detection
- ✅ Custom parameters (like phone number for context)

## Architecture

```
Segment Journey
    ↓
Twilio Voice API initiates call
    ↓
TwiML endpoint returns <ConversationRelay>
    ↓
Twilio opens WebSocket to your AI agent
    ↓
AI agent receives:
  - Audio stream from candidate
  - Phone number parameter
    ↓
AI agent fetches Segment Profile
    ↓
AI agent responds with personalized audio
```

---

## Step 1: Choose Your AI Agent Backend

Conversation Relay needs a WebSocket server running your AI agent. Options:

### Option A: Twilio AI Agent Augmentation (Easiest)
- Pre-built, hosted by Twilio
- Configure via Twilio Console
- No WebSocket server needed
- **URL format**: `wss://ai-assistant.twilio.com/v1/YOUR_ASSISTANT_ID`

### Option B: OpenAI Realtime API (Most Flexible)
- Direct integration with OpenAI's voice API
- You build a proxy WebSocket server
- Full control over prompts and behavior
- **URL format**: `wss://your-server.com/openai-relay`

### Option C: Custom AI Agent
- Build your own WebSocket server
- Use any LLM/TTS/STT stack
- Complete flexibility
- **URL format**: `wss://your-server.com/voice`

**Which do you want to use?** (A, B, or C)

---

## Step 2: Create TwiML Endpoint

I'll create the Vercel endpoint that returns TwiML with Conversation Relay.

**File**: `/Users/ericwalters/Documents/clients/amn-new/amn-demo/api/voice/twiml.js`

```javascript
/**
 * TwiML Endpoint for Conversation Relay
 * 
 * Called by: Twilio Voice API when call is answered
 * Returns: TwiML connecting call to AI agent via Conversation Relay
 */

export default async function handler(req, res) {
  try {
    const { phone } = req.query;

    if (!phone) {
      console.error('Missing phone parameter');
      return res.status(400).json({ error: 'Phone required' });
    }

    console.log('Generating TwiML for Conversation Relay:', { phone });

    // Your AI WebSocket URL (set via environment variable)
    const AI_WEBSOCKET_URL = process.env.AI_WEBSOCKET_URL;

    if (!AI_WEBSOCKET_URL) {
      throw new Error('AI_WEBSOCKET_URL not configured');
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay 
      url="${AI_WEBSOCKET_URL}"
      voice="Polly.Joanna"
      language="en-US"
      dtmfDetection="true">
      <Parameter name="phone" value="${phone}" />
      <Parameter name="source" value="rcs_reply" />
    </ConversationRelay>
  </Connect>
</Response>`;

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml);
  } catch (error) {
    console.error('TwiML generation error:', error);

    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    We're sorry, we're unable to connect your call. Please try again later.
  </Say>
  <Hangup/>
</Response>`;

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(errorTwiml);
  }
}
```

**Deployed URL**: `https://amn-demo.vercel.app/api/voice/twiml`

---

## Step 3: Configure Segment Journey to Call API

In your Segment Journey, configure it to call Twilio Voice API when "RCS Message Received":

### Using Webhooks Destination

**URL**: `https://api.twilio.com/2010-04-01/Accounts/YOUR_TWILIO_ACCOUNT_SID/Calls.json`

**Method**: `POST`

**Headers**:
```
Authorization: Basic QUM2ZTFhZDc1ZmZiYmY1MzZiM2Y1YjMyYjgxN2Q4M2JiODowZGI1YWFjYzFlMWE3ZDY3NGVlMTQxMjgyZDE5MzYyOA==
Content-Type: application/x-www-form-urlencoded
```

**Body** (x-www-form-urlencoded):
```
To={{properties.from}}
From=+1YOUR_TWILIO_NUMBER
Url=https://amn-demo.vercel.app/api/voice/twiml?phone={{properties.from}}
```

This tells Twilio:
- Call the candidate (`To={{properties.from}}`)
- When they answer, fetch TwiML from your endpoint
- Pass the phone number so AI can fetch their profile

---

## Step 4: Configure Your AI Agent

Your AI WebSocket server receives:

### Connection Event
```json
{
  "event": "start",
  "streamSid": "MZ...",
  "callSid": "CA...",
  "parameters": {
    "phone": "+15555555555",
    "source": "rcs_reply"
  }
}
```

### Audio Inbound (Candidate Speaking)
```json
{
  "event": "media",
  "media": {
    "payload": "base64_audio_data",
    "timestamp": 12345
  }
}
```

### Your AI Should:

1. **On `start` event**:
   - Extract phone number from parameters
   - Fetch Segment Profile:
   ```javascript
   const profile = await fetchSegmentProfile(phone);
   ```
   
2. **Build System Prompt**:
   ```javascript
   const systemPrompt = `You are a healthcare recruiter calling ${profile.traits.name} about their ${profile.traits.job_applied} application. They started the application but abandoned it at ${profile.traits.abandonment_step}. They replied to your RCS message showing interest. Be warm, helpful, and ask what questions they have.`;
   ```

3. **Stream Audio Back**:
   ```json
   {
     "event": "media",
     "media": {
       "payload": "base64_audio_response"
     }
   }
   ```

---

## Step 5: Test End-to-End

1. **Reply to RCS** (any text)
2. **Phone rings** (~10 seconds)
3. **AI answers**: "Hi Sarah! Thanks for your interest in the NICU RN position..."
4. **Have conversation** - AI knows your name, job, etc.

### Expected Flow:
```
1. You: [Reply to RCS] "Hi"
2. Segment: "RCS Message Received" event
3. Segment Journey: Triggers webhook
4. Twilio: Initiates call to your phone
5. Twilio: Fetches TwiML from your endpoint
6. Twilio: Opens WebSocket to AI agent
7. AI: Receives phone number parameter
8. AI: Fetches Segment profile
9. AI: "Hi Sarah! Thanks for replying..."
```

---

## What I'll Build for You

Tell me which option and I'll create:

### If Option A (Twilio AI Assistant):
- ✅ TwiML endpoint code
- ✅ Twilio AI Assistant configuration guide
- ✅ Instructions for adding Segment Profile API integration

### If Option B (OpenAI Realtime):
- ✅ TwiML endpoint code
- ✅ OpenAI WebSocket proxy server code
- ✅ Segment Profile fetch integration
- ✅ Deployment guide (Vercel or separate)

### If Option C (Custom):
- ✅ TwiML endpoint code
- ✅ WebSocket protocol documentation
- ✅ Segment Profile integration example
- ✅ Audio format specifications

**Which option do you want to use?**

---

## Quick Decision Matrix

| Feature | Twilio AI Assistant | OpenAI Realtime | Custom |
|---------|-------------------|-----------------|--------|
| **Setup Time** | 1 hour | 3-4 hours | 1+ days |
| **Hosting** | Twilio (free) | You host proxy | You host all |
| **Flexibility** | Medium | High | Complete |
| **Cost** | Twilio AI fees | OpenAI API fees | Your infrastructure |
| **Voice Quality** | Excellent | Excellent | Depends |
| **Segment Integration** | Built-in API connectors | You code it | You code it |

**Recommendation for demo**: Start with **Twilio AI Assistant** (Option A) - fastest to working demo, then enhance later if needed.

What do you think?
