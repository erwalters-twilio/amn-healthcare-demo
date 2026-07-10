# AMN Recruiter Dashboard - Quick Start

## ✅ Installation Complete

The recruiter dashboard has been successfully built and is now running!

## 🌐 Access the Dashboard

**Frontend**: http://localhost:5174
**Backend API**: http://localhost:3001

## 🧪 Testing the Dashboard

### Option 1: Manual Search

1. Open http://localhost:5174 in your browser
2. Type a phone number in the search bar: `+13304027149`
3. Select the candidate from the dropdown
4. View the complete profile with conversations and insights

### Option 2: Simulate Webhook Event

Test the automatic loading feature by simulating a "Call Transferred to Recruiter" event:

```bash
curl -X POST http://localhost:3001/webhooks/segment \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "phone:+13304027149",
    "event": "Call Transferred to Recruiter",
    "properties": {
      "phone": "+13304027149",
      "call_sid": "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    }
  }'
```

Then refresh the dashboard at http://localhost:5174 - the candidate should auto-load.

### Option 3: Test API Directly

```bash
# Get candidate details
curl http://localhost:3001/api/candidates/+13304027149

# Search for candidate
curl "http://localhost:3001/api/search?q=+13304027149"

# Check health
curl http://localhost:3001/health
```

## 📊 What You'll See

### Profile Section
- Contact information (email, phone, city)
- Professional details (profession, specialty, discipline)

### Activity Timeline
- Recent Segment events (Application Abandoned, RCS Message Received, etc.)
- Color-coded by event type
- Relative timestamps

### Conversations
- Multi-channel messages (Web, RCS, SMS, Voice)
- Channel badges for easy identification
- Chat bubble UI

### AI Insights (if available)
- Observations: Key insights extracted by AI
- Summaries: Condensed conversation highlights
- From Twilio Memory API

### Application Context (if available)
- Job applied for
- Application ID
- Abandonment step

## 🔌 Integrating with openai-relay-server

The `openai-relay-server` already sends "Call Transferred to Recruiter" events to Segment. To make these events trigger the dashboard:

1. **Configure Segment Webhook**: In your Segment workspace, add a webhook destination pointing to:
   ```
   http://localhost:3001/webhooks/segment
   ```
   (Or your production URL when deployed)

2. **Filter to "Call Transferred to Recruiter" events**: Configure the webhook to only forward this specific event

3. **When a call is transferred**: The event will automatically trigger the dashboard to fetch and display candidate data

## 🚀 Deployment

### Backend Options

**Vercel Serverless** (simplest):
```bash
cd recruiter-dashboard/server
vercel deploy
```

**Railway** (recommended for persistent server):
- Connect GitHub repo
- Set environment variables from `.env`
- Auto-deploys on push

### Frontend Deployment

**Vercel**:
```bash
cd recruiter-dashboard/dashboard
vercel deploy
```

Update `.env` in production:
```
VITE_API_URL=https://your-backend-api.com
```

## 🔑 Environment Variables

Backend `.env` is already configured with:
- ✅ Segment Profile API credentials
- ✅ Twilio Conversations API credentials
- ⚠️ Twilio Memory API (needs Memory Store ID)

To configure Memory Store:
1. Go to Twilio Console → Memory Store
2. Create or find your Memory Store
3. Copy the Store ID (MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
4. Add to `.env`: `MEMORY_STORE_ID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 📝 Sample Test Data

The backend is configured to work with phone number `+13304027149` which has profile data:
- Name: Jessica Chen
- Email: test.nurse@amnhealthcare.com
- Specialty: ICU
- Years Experience: 5

## 🐛 Troubleshooting

### Backend won't start
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
# Restart
cd recruiter-dashboard/server && npm run dev
```

### Frontend won't connect
- Verify backend is running: `curl http://localhost:3001/health`
- Check Vite proxy in `vite.config.ts`
- Clear browser cache

### "No profile found" error
- Verify phone number is in E.164 format (+13304027149)
- Check Segment Profile API credentials
- Try searching by email instead

## 📚 Documentation

Full documentation available in:
- `README.md` - Complete setup guide
- `server/src/` - Backend service documentation
- `dashboard/src/` - Frontend component documentation

## 🎉 Next Steps

1. Test the dashboard with real candidate data
2. Configure Segment webhook to auto-trigger on call transfers
3. Set up Twilio Memory Store for AI insights
4. Deploy to production (Vercel + Railway)
5. Share with AMN Healthcare team!
