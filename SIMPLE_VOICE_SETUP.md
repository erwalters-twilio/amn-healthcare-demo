# Simple AI Voice Call Setup

**Goal**: Any RCS reply triggers an AI voice call. The AI agent fetches the candidate's Segment profile to personalize the conversation.

**Flow**:
```
1. Candidate replies to RCS
2. "RCS Message Received" event sent to Segment (✅ Already working)
3. Segment Journey triggers Twilio Voice call
4. AI agent fetches Segment Profile by phone number
5. AI agent has context: name, job, application_id, etc.
```

---

## What You Need

1. **Segment Profile API Access Token**
   - Go to: Segment Settings → API Access → Profile API
   - Create a token with read access
   - Note your Workspace Slug

2. **Twilio Voice-enabled Phone Number**
   - The number you're sending RCS from (should already be Voice-enabled)

3. **AI Agent Platform/Endpoint**
   - Which are you using?
     - Twilio AI Assistant?
     - OpenAI Realtime API?
     - Custom solution?
     - Other?

---

## Step 1: Create Segment Journey

### 1A. Create the Journey

1. Go to **[Segment → Journeys](https://app.segment.com)**
2. Click **"New Journey"**
3. Name: **"RCS Reply → Voice Call"**

### 1B. Configure Entry Trigger

```
Trigger Type: Event Occurs
Event Name: "RCS Message Received"
Description: When candidate replies to RCS message
```

**No filters needed** - any reply triggers the call.

### 1C. Add Voice Call Action

Now we need to trigger a Twilio Voice call. Segment might not have a native "Twilio Voice" destination, so here are your options:

#### Option A: Webhooks Destination (Simplest)

1. Add action: **"Send to Webhooks"**
2. Configure webhook:

```
URL: https://api.twilio.com/2010-04-01/Accounts/YOUR_TWILIO_ACCOUNT_SID/Calls.json
Method: POST
Headers:
  Authorization: Basic [BASE64 of AccountSid:AuthToken]
  Content-Type: application/x-www-form-urlencoded
Body (x-www-form-urlencoded format):
  To={{properties.from}}
  From=+1YOUR_TWILIO_NUMBER
  Url=https://your-twiml-endpoint.com/voice?phone={{properties.from}}
```

**To create the Authorization header**:
```bash
echo -n "YOUR_TWILIO_ACCOUNT_SID:YOUR_TWILIO_AUTH_TOKEN" | base64
```

This calls the Twilio API directly to initiate an outbound call.

#### Option B: Segment Function (More Flexible)

Create a Segment Function that:
1. Receives "RCS Message Received" event
2. Calls Twilio Voice API
3. Passes phone number to TwiML endpoint

**I can write this function for you if needed.**

---

## Step 2: Create TwiML Endpoint

When Twilio initiates the call, it needs TwiML instructions telling it what to do. You need to create an endpoint that returns TwiML.

### 2A. Create the Endpoint

We'll add a new Vercel serverless function at `/api/voice/twiml.js`:

```javascript
export default async function handler(req, res) {
  const { phone } = req.query; // Phone number from Segment

  // This TwiML connects the call to your AI agent
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    Please hold while we connect you to a recruiter.
  </Say>
  <Connect>
    <Stream url="wss://your-ai-agent.com/voice">
      <Parameter name="phone" value="${phone}" />
    </Stream>
  </Connect>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml);
}
```

**OR if using Twilio AI Assistant**:

```javascript
export default async function handler(req, res) {
  const { phone } = req.query;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://ai-assistant.twilio.com/v1/your-assistant-id"
      voice="Polly.Joanna"
      parameters='{"phone": "${phone}"}'
    />
  </Connect>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml);
}
```

### 2B. Deploy the Endpoint

The URL will be: `https://amn-demo.vercel.app/api/voice/twiml`

---

## Step 3: Configure AI Agent to Fetch Segment Profile

Your AI agent needs to:
1. Receive the phone number (from TwiML parameters)
2. Fetch the Segment Profile by phone
3. Use the profile data in the conversation

### 3A. Fetch Segment Profile API

**API Endpoint**:
```
GET https://profiles.segment.com/v1/spaces/{workspace_slug}/collections/users/profiles/phone:{phone}
Authorization: Basic {base64(accessToken:)}
```

**Example**:
```bash
curl "https://profiles.segment.com/v1/spaces/YOUR_WORKSPACE_SLUG/collections/users/profiles/phone:+15555555555" \
  -H "Authorization: Basic $(echo -n 'YOUR_SEGMENT_PROFILE_TOKEN:' | base64)"
```

**Response** (example):
```json
{
  "traits": {
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "phone": "+15555555555",
    "profession": "Nursing - NICU",
    "application_id": "app_123",
    "job_applied": "NICU RN - Littleton, CO",
    "abandonment_step": "document_upload"
  },
  "events": [
    {
      "event": "Application Abandoned",
      "timestamp": "2026-07-06T10:00:00Z"
    },
    {
      "event": "RCS Message Received",
      "timestamp": "2026-07-06T10:30:00Z"
    }
  ]
}
```

### 3B. Configure AI Agent System Prompt

Use the Segment profile data to personalize the AI agent:

```
You are a healthcare recruiter for AMN Healthcare calling candidate {name}.

Candidate Context:
- Name: {traits.name}
- Phone: {traits.phone}
- Position: {traits.job_applied}
- Application ID: {traits.application_id}
- Status: Started application but abandoned at {traits.abandonment_step}
- Previous Contact: Sent RCS message, candidate replied showing interest

Your Goal:
- Warmly greet them by name
- Reference the specific job they applied for
- Ask what questions they have about the position
- Offer to help them complete the application
- Be helpful and conversational

Instructions:
- Don't mention you're an AI unless asked
- Keep responses under 30 seconds
- Listen for their questions and concerns
- Offer to schedule a call with a human recruiter if needed
```

### 3C. Implementation by AI Platform

**If using Twilio AI Assistant**:
1. Go to Twilio Console → AI Assistant
2. In "Knowledge Sources", add:
   - API integration: Segment Profile API
   - Configure to fetch by phone number
3. In "Instructions", add the system prompt above with template variables

**If using OpenAI Realtime API**:
1. Before connecting to OpenAI, fetch Segment profile
2. Set the `session.instructions` with profile data:
```javascript
const profile = await fetchSegmentProfile(phone);
const instructions = `You are a healthcare recruiter calling ${profile.traits.name} about their ${profile.traits.job_applied} application...`;

// Send to OpenAI Realtime API
websocket.send(JSON.stringify({
  type: 'session.update',
  session: {
    instructions: instructions
  }
}));
```

**If using custom solution**:
- Fetch profile when call connects
- Inject into your LLM system prompt
- Pass as context for each turn

---

## Step 4: Test End-to-End

### 4A. Test the Flow

1. **Reply to an RCS message** (any text, e.g., "Hi")
2. **Check Segment Debugger**:
   - "RCS Message Received" event should appear
3. **Check Segment Journey**:
   - Entry should show in Journey logs
   - Action should execute (voice call triggered)
4. **Phone rings** (~5-10 seconds after reply)
5. **AI agent answers** and greets you by name

### 4B. Verify AI Agent Has Context

During the call, the AI should:
- ✅ Greet you by name ("Hi Sarah")
- ✅ Reference the job you applied for ("NICU RN position")
- ✅ Know you started an application
- ✅ Offer to help complete it

### 4C. Check Logs

**Segment Journey Logs**:
- Event entered journey ✅
- Webhook/function executed ✅

**Twilio Voice Logs**:
- Go to Twilio Console → Voice → Logs
- Find the call
- Status: Completed
- Duration: > 0 seconds

**Vercel Logs** (for TwiML endpoint):
```bash
vercel logs amn-demo.vercel.app --since 5m
```
Look for TwiML endpoint calls.

---

## Quick Start Checklist

Before you can test:

- [ ] Segment Journey created
- [ ] Journey trigger: "RCS Message Received"
- [ ] Journey action: Webhook to Twilio Voice API
- [ ] TwiML endpoint created at `/api/voice/twiml`
- [ ] TwiML endpoint deployed to Vercel
- [ ] Segment Profile API token created
- [ ] AI agent configured to fetch Segment profile
- [ ] AI agent system prompt includes profile data

---

## What I Can Help You Build

Tell me which you need help with:

1. **Segment Function** to call Twilio Voice API
   - I can write the complete function code

2. **TwiML Endpoint** (`/api/voice/twiml.js`)
   - I can create this file for your Vercel project

3. **AI Agent Integration Code**
   - I can write code to fetch Segment Profile
   - Depends on which AI platform you're using

4. **Webhook Authorization Header**
   - I can generate the base64 auth string

**Just let me know which AI platform you're using and I'll write the specific code!**

---

## Decision: Which AI Platform?

Please choose:

- **A**: Twilio AI Assistant (easiest - built into Twilio)
- **B**: OpenAI Realtime API (most flexible)
- **C**: Custom solution (you have your own)
- **D**: Other (Voiceflow, ElevenLabs, etc.)

Once you tell me, I'll provide the exact code for that platform.
