# OpenAI Realtime + Twilio Conversation Relay Server

WebSocket relay server that bridges Twilio voice calls with OpenAI's Realtime API, enriched with Segment customer profile data.

## What It Does

1. **Receives call from Twilio** via Conversation Relay WebSocket
2. **Fetches Segment Profile** for the caller using their phone number
3. **Connects to OpenAI Realtime API** with personalized system instructions
4. **Bridges bidirectional audio** between Twilio ↔ OpenAI
5. **Logs conversation** for debugging

## Quick Start

### 1. Install Dependencies

```bash
cd openai-relay-server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

Required credentials:
- `OPENAI_API_KEY` - From [OpenAI Platform](https://platform.openai.com/api-keys)
- `SEGMENT_PROFILE_TOKEN` - From Segment → Settings → Access Management → Tokens
- `SEGMENT_SPACE_ID` - From Segment → Settings → Workspace Settings → General (looks like `spa_xxxxx`)

### 3. Run Locally (for testing)

```bash
npm start
```

Server will run on `http://localhost:8080`

### 4. Test Locally with ngrok

```bash
# Terminal 1: Run server
npm start

# Terminal 2: Expose via ngrok
ngrok http 8080

# Copy the ngrok WebSocket URL (wss://xxxx.ngrok.io)
# Use this in your Vercel env: AI_WEBSOCKET_URL
```

### 5. Deploy to Production

#### Option A: Railway (Easiest)

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select this repository
4. Set environment variables in Railway dashboard
5. Railway will give you a URL: `wss://your-app.up.railway.app`

#### Option B: Render

1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Set:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables
6. Deploy
7. Get WebSocket URL: `wss://your-app.onrender.com`

#### Option C: Fly.io

```bash
# Install Fly CLI
brew install flyctl

# Login
flyctl auth login

# Launch app
flyctl launch

# Set secrets
flyctl secrets set OPENAI_API_KEY=sk-proj-...
flyctl secrets set SEGMENT_PROFILE_TOKEN=sgp_...
flyctl secrets set SEGMENT_SPACE_ID=spa_xxxxx

# Deploy
flyctl deploy
```

### 6. Update Vercel Environment

```bash
vercel env add AI_WEBSOCKET_URL production
# Paste your production WebSocket URL (wss://...)
```

### 7. Redeploy Vercel

```bash
cd ../amn-demo
vercel deploy --prod
```

## Testing

### Test Locally

1. Start server: `npm start`
2. Start ngrok: `ngrok http 8080`
3. Update `AI_WEBSOCKET_URL` to ngrok URL
4. Reply to RCS message
5. Phone should ring with AI agent

### Test Production

1. Reply to RCS message
2. Check logs in Railway/Render/Fly dashboard
3. Should see:
   - "New Twilio connection"
   - "Call started"
   - "Segment profile fetched"
   - "Connected to OpenAI"
   - Conversation transcripts

## Logs

The server logs important events:

- `[INFO] New Twilio connection` - Call started
- `[INFO] Segment profile fetched` - Profile data retrieved
- `[INFO] Connected to OpenAI` - AI ready
- `[INFO] User said: <transcript>` - What candidate said
- `[INFO] AI said: <transcript>` - What AI responded

Set `LOG_LEVEL=debug` for more detailed logs.

## Cost Estimate

**Per minute of call**:
- OpenAI Realtime API: ~$0.06/min
- Twilio Voice: ~$0.013/min
- Railway/Render hosting: ~$5-10/month unlimited calls

**Total**: ~$0.073/min or ~$4.38/hour of calls

## Architecture

```
Candidate Phone
    ↓
Twilio Voice Call (initiated by Segment)
    ↓
TwiML Endpoint (Vercel)
    ↓
<ConversationRelay> opens WebSocket
    ↓
This Relay Server
    ↓
├─→ Segment Profile API (fetch context)
└─→ OpenAI Realtime API (AI conversation)
```

## Troubleshooting

### "OpenAI connection failed"
- Check `OPENAI_API_KEY` is valid
- Ensure API key has Realtime API access

### "Segment profile not found"
- Check `SEGMENT_PROFILE_TOKEN` has read permission
- Verify phone number is in Segment (check Segment Debugger)
- Check `SEGMENT_SPACE_ID` is correct (should start with `spa_`)

### "No audio from AI"
- Check server logs for OpenAI messages
- Verify audio format: `g711_ulaw` (Twilio's format)
- Check OpenAI account has credits

### "Call connects but hangs up immediately"
- Check server is reachable at WebSocket URL
- Verify Railway/Render app is running (check dashboard)
- Test WebSocket connection with wscat:
  ```bash
  npm install -g wscat
  wscat -c wss://your-app.up.railway.app
  ```

## Development

### Run with auto-reload

```bash
npm run dev
```

### Debug mode

```bash
LOG_LEVEL=debug npm start
```

## Next Steps

After basic voice calls work:

1. **Add conversation memory** - Store call transcripts in Twilio Conversations
2. **Add RCS context** - Fetch RCS message history and reference it during call
3. **Add function calling** - Let AI schedule callbacks, update application status
4. **Add call recording** - Record calls for compliance/training

## Support

Issues? Check:
- Server logs in Railway/Render/Fly dashboard
- Vercel function logs for TwiML endpoint
- Segment event debugger for "RCS Message Received"
- Twilio Voice logs for call status
