# AI Voice Call Setup Guide

**Goal**: When a candidate replies to an RCS message, trigger an AI-powered voice call that has full context (candidate profile + RCS conversation history).

**Status**: Phase 1 Complete (RCS tracking ✅) → Ready for Phase 2 (Voice Calls)

---

## Architecture Overview

```
1. Candidate replies to RCS
   ↓
2. Webhook sends "RCS Message Received" to Segment
   ↓
3. Segment Journey detects event + keyword trigger
   ↓
4. Segment triggers Twilio Voice call with context:
   - ConversationSid (for RCS history)
   - Candidate name, phone, application_id
   ↓
5. AI Agent answers call with full context:
   - Fetches Segment Profile (via Profile API)
   - Fetches RCS history (via Twilio Conversations API)
   - Personalized conversation based on context
```

---

## Prerequisites

**Before starting, ensure you have**:
- ✅ RCS messages sending via Twilio
- ✅ RCS replies tracked in Segment ("RCS Message Received" events)
- ✅ Twilio Voice API enabled
- ✅ AI Agent configured (or plan to set up)

---

## Step 1: Switch from Messaging API → Conversations API

**Why**: Currently RCS messages are standalone (no conversation history). We need persistent conversations so the AI agent can reference what was discussed in RCS.

### Option A: Check if Segment supports Conversations API

1. Go to **Segment → Connections → Destinations → Twilio** (your existing destination)
2. Look for fields like:
   - "Conversation Friendly Name"
   - "Conversation Attributes"
   - "Use Conversations API"
3. If you see these options:
   - ✅ Enable "Use Conversations API"
   - Set Conversation Attributes to include:
     ```json
     {
       "application_id": "{{properties.application_id}}",
       "candidate_name": "{{traits.name}}",
       "job_applied": "{{properties.job_title}}"
     }
     ```

### Option B: Use Twilio Conversations Destination (if available)

1. Go to **Segment → Catalog → Destinations**
2. Search for **"Twilio Conversations"** (different from "Twilio")
3. If it exists:
   - Add it as a new destination
   - Configure credentials
   - Map "Application Abandoned" to create conversation + send message

### Option C: Use Segment Functions (if UI doesn't support it)

If Segment doesn't have native Conversations support, we'll create a Segment Function that:
1. Receives "Application Abandoned" event
2. Calls Twilio Conversations API directly
3. Creates conversation with attributes
4. Sends RCS message within that conversation

**Let me know which option applies and I'll provide detailed instructions.**

---

## Step 2: Configure Voice Call Trigger in Segment Journey

### 2A. Create the Journey

1. Go to **[Segment Journeys](https://app.segment.com/journeys)**
2. Click **"Create Journey"**
3. Name it: **"RCS Reply → Voice Call"**

### 2B. Configure Journey Steps

**Step 1: Entry Trigger**
```
Event Name: "RCS Message Received"
Description: When candidate replies to RCS
```

**Step 2: Condition Filter (optional but recommended)**
```
Condition: Body contains keyword
Keywords: interested, call me, yes, available, schedule, talk

This prevents calling on every reply (e.g., "no thanks" won't trigger)
```

**Step 3: Send to Twilio Voice**

This is where it gets tricky - Segment might not have a pre-built "Twilio Voice" destination. Here are your options:

#### Option A: Twilio Voice Destination (if available)
```
Destination: Twilio Voice
Action: Make Call
To: {{properties.from}}
From: [Your Twilio phone number]
Url: https://your-twiml-endpoint.com/voice
```

#### Option B: Segment Webhook Destination
```
Destination: Webhooks
URL: https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Calls.json
Method: POST
Headers:
  Authorization: Basic [base64(AccountSid:AuthToken)]
Body:
  To={{properties.from}}
  From=[Your Twilio Number]
  Url=https://your-twiml-endpoint.com/voice?conversationSid={{properties.conversation_sid}}
```

#### Option C: Segment Functions (most flexible)

Create a Segment Function that:
1. Receives "RCS Message Received" event
2. Filters for trigger keywords
3. Calls Twilio Voice API directly
4. Passes context parameters

**I can help you write this function if needed.**

---

## Step 3: Configure AI Agent to Access Context

### 3A. Set Up TwiML Webhook for Voice Call

When Twilio initiates the voice call, it needs to know what to do. You'll provide a TwiML webhook URL that tells Twilio to connect to your AI agent.

**Example TwiML Response**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-ai-agent-websocket.com/voice"
      welcomeGreeting="Hi! I'm calling about your nursing application. How can I help?"
      conversationSid="{{conversationSid}}"
      voice="Polly.Joanna"
    />
  </Connect>
</Response>
```

### 3B. Configure AI Agent to Fetch Context

Your AI agent needs to:

1. **Fetch Segment Profile**:
   ```bash
   curl https://profiles.segment.com/v1/spaces/{workspace_slug}/collections/users/profiles/phone:+15555555555 \
     -H "Authorization: Basic base64(accessToken:)"
   ```

2. **Fetch Twilio Conversation History**:
   ```bash
   curl https://conversations.twilio.com/v1/Conversations/{ConversationSid}/Messages \
     -u "AccountSid:AuthToken"
   ```

3. **Use Context in Conversation**:
   ```
   System Prompt: "You are a healthcare recruiter calling candidate {{name}} about their {{job_title}} application (ID: {{application_id}}). You previously messaged them via RCS. Here's the conversation history: {{rcs_history}}"
   ```

### 3C. Configure in Twilio AI Agent (if using Twilio's AI Agent product)

1. Go to **[Twilio Console → AI Agent](https://console.twilio.com)**
2. Configure **Knowledge Sources**:
   - Add API integration for Segment Profile API
   - Add API integration for Twilio Conversations API
3. Configure **Agent Instructions**:
   ```
   You are a healthcare recruiter for AMN Healthcare.
   The candidate you're speaking with:
   - Name: {fetch from Segment Profile}
   - Job Applied: {fetch from Segment Profile}
   - RCS Conversation: {fetch from Twilio Conversations API}
   
   Reference their previous messages and be helpful about their application.
   ```

---

## Step 4: Test End-to-End

### 4A. Trigger the Flow

1. Go to demo site: https://amn-demo.vercel.app
2. Fill out application form
3. Click "Save & Finish Later"
4. Wait for RCS message (~30 seconds)
5. Reply with: **"I'm interested in this position"**
6. Wait for voice call (~10-30 seconds)

### 4B. Verify Context During Call

When the AI agent answers:
- [ ] Agent greets you by name
- [ ] Agent references the job you applied for
- [ ] Agent knows you replied to RCS (mentions it)
- [ ] Agent can answer questions about the application

### 4C. Check Logs

**Segment Debugger**:
- "Application Abandoned" event ✅
- "RCS Message Received" event ✅
- "Voice Call Initiated" event (if tracked)

**Twilio Console → Voice Logs**:
- Call initiated successfully
- Call connected
- Call duration > 0 seconds

---

## Troubleshooting

### Problem: Voice call doesn't trigger

**Check**:
1. Segment Journey is enabled
2. "RCS Message Received" event is entering the journey (check Journey logs)
3. Keyword filter isn't blocking the event
4. Twilio Voice destination credentials are correct

### Problem: Call connects but AI agent has no context

**Check**:
1. ConversationSid is being passed in TwiML URL parameters
2. AI agent can access Segment Profile API (check API credentials)
3. AI agent can access Twilio Conversations API (check credentials)
4. Agent instructions reference the context variables correctly

### Problem: Conversations API not available

**Options**:
1. Store context in a database (keyed by phone number)
2. Use Twilio Sync for temporary context storage
3. Pass minimal context via URL parameters only (name, application_id)

---

## Next Steps After Voice Works

1. **Track Voice Call Events**:
   - Send "Voice Call Initiated", "Voice Call Answered", "Voice Call Completed" to Segment
   - Include call duration, AI agent summary, next steps

2. **Build Recruiter Dashboard**:
   - Show unified timeline: Application → RCS → Voice Call
   - Display conversation transcript
   - Show AI agent observations

3. **Add Voice Call Transcript to Segment**:
   - After call ends, send transcript as event
   - Store in Twilio Conversation Memory for future reference

---

## Decision Points

Before starting, decide:

1. **What triggers voice calls?**
   - [ ] Any RCS reply
   - [ ] Specific keywords only
   - [ ] Button clicks only
   - [ ] After X messages

2. **How is context passed?**
   - [ ] Via Conversations API (recommended)
   - [ ] Via database lookup
   - [ ] Via URL parameters only

3. **What AI agent platform?**
   - [ ] Twilio AI Agent
   - [ ] Custom AI agent (OpenAI, Anthropic, etc.)
   - [ ] Third-party (Voiceflow, etc.)

**Let me know your answers and I'll help with the specific implementation!**
