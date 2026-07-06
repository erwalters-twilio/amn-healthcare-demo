# OpenAI Realtime API + Conversation Relay Setup

**Architecture**:
```
Twilio Call → Conversation Relay → Your WebSocket Server → OpenAI Realtime API
                                   ↓
                              Segment Profile API
                              (fetch candidate context)
```

Your WebSocket server:
1. Receives connection from Twilio with phone number
2. Fetches Segment Profile for that phone
3. Connects to OpenAI Realtime API
4. Injects profile data into system instructions
5. Bridges bidirectional audio between Twilio ↔ OpenAI

---

## Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Save it securely (starts with `sk-proj-...`)

**Cost**: ~$0.06/minute for voice calls with GPT-4o Realtime

---

## Step 2: Get Segment Profile API Token

1. Go to Segment → Settings → Access Management → Tokens
2. Click "Create Token"
3. Name: "Voice Call Profile Access"
4. Permissions: **Profile API - Read**
5. Save the token
6. Note your **Space ID**:
   - Go to Settings → Workspace Settings → General
   - Copy the Space ID (looks like `spa_xxxxxxxxxxxxx`)

---

## Step 3: Deploy WebSocket Relay Server

I've created a complete Node.js server in `/openai-relay-server/`.

### Quick Deploy Steps

#### A. Test Locally First (Recommended)

```bash
cd /Users/ericwalters/Documents/clients/amn-new/openai-relay-server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials:
# - OPENAI_API_KEY
# - SEGMENT_PROFILE_TOKEN
# - SEGMENT_SPACE_ID

# Start server
npm start
```

Server runs on `http://localhost:8080`

#### B. Expose Locally with ngrok (for testing)

```bash
# Terminal 2
ngrok http 8080

# Copy the WSS URL: wss://xxxx.ngrok.io
```

#### C. Deploy to Production (Railway - Easiest)

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub"**
4. Select your repository (or upload the `openai-relay-server` folder)
5. Set environment variables in Railway dashboard:
   - `OPENAI_API_KEY`
   - `SEGMENT_PROFILE_TOKEN`
   - `SEGMENT_SPACE_ID`
6. Railway auto-deploys and gives you a URL: `wss://your-app.up.railway.app`

**Cost**: Railway gives $5 free credit/month, then ~$5-10/month after

---

## Step 4: Configure Vercel with WebSocket URL

Add your production WebSocket URL to Vercel:

```bash
cd /Users/ericwalters/Documents/clients/amn-new/amn-demo

# Add environment variable
vercel env add AI_WEBSOCKET_URL production

# When prompted, paste your WebSocket URL:
# wss://your-app.up.railway.app

# Redeploy
vercel deploy --prod
```

---

## Step 5: Test the Complete Flow

1. **Reply to an RCS message** (any text)
2. **Your phone rings** (~10 seconds)
3. **Answer the call**
4. **AI greets you by name**: "Hi Sarah! Thanks for your interest in the NICU RN position..."
5. **Have a conversation** - AI knows your name, job applied, etc.

### Check Logs

**Railway Dashboard**:
- Go to your Railway project
- Click "View Logs"
- You should see:
  ```
  [INFO] New Twilio connection
  [INFO] Call started: { phone: "+15555555555" }
  [INFO] Segment profile fetched: { name: "Sarah Johnson" }
  [INFO] Connected to OpenAI Realtime API
  [INFO] User said: "Hi, I'm interested in the position"
  [INFO] AI said: "Hi Sarah! Great to hear from you..."
  ```

**Vercel Logs** (TwiML endpoint):
```bash
vercel logs amn-demo.vercel.app --since 5m
```

---

## What the AI Agent Will Say

Based on your Segment profile, the AI will:

**Opening**:
> "Hi Sarah! Thanks for replying to our message about the NICU RN position in Littleton, Colorado. I'm calling to see what questions you have and help you complete your application."

**Context it has**:
- Your name
- Job you applied for
- That you started but didn't finish the application
- What step you abandoned at
- That you replied to the RCS message

**What it can do**:
- Answer questions about the job
- Help complete the application
- Address concerns
- Offer to schedule a callback with a human recruiter

---

## Troubleshooting

### Phone doesn't ring
- Check Segment Journey logs - did webhook execute?
- Check Twilio Voice logs - was call initiated?
- Check TwiML endpoint logs in Vercel

### Call connects but no voice
- Check Railway logs - is server running?
- Check OpenAI API key is valid
- Check server can reach OpenAI (firewall/network)

### AI doesn't have context
- Check Railway logs - was Segment profile fetched?
- Check Segment Profile API token permissions
- Check Space ID is correct format (`spa_xxxxx`)
- Test Segment API manually:
  ```bash
  curl "https://profiles.segment.com/v1/spaces/spa_xxxxx/collections/users/profiles/phone:+15555555555" \
    -H "Authorization: Basic $(echo -n 'YOUR_TOKEN:' | base64)"
  ```

---

## Next Steps

After basic calls work:

1. **Improve system prompt** - Add more context, tone, personality
2. **Add function calling** - Let AI schedule callbacks, update applications
3. **Add conversation memory** - Store transcripts for follow-up
4. **Add RCS history** - Reference previous messages during call

---

## Files Created

- ✅ `openai-relay-server/index.js` - Main server code
- ✅ `openai-relay-server/package.json` - Dependencies
- ✅ `openai-relay-server/.env.example` - Configuration template
- ✅ `openai-relay-server/README.md` - Detailed documentation
- ✅ `amn-demo/api/voice/twiml.js` - TwiML endpoint (already deployed)

**Everything is ready to deploy!**
