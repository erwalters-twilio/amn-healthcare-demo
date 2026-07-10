# AMN Healthcare Recruiter Dashboard

A production-ready recruiter dashboard that automatically displays candidate profiles when calls are transferred. Integrates with Segment, Twilio, and Recall Memory to provide comprehensive candidate intelligence.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

## Features

✨ **Auto-Loading Profiles** - Automatically loads candidate data when "Call Transferred to Recruiter" event is received
📊 **Unified View** - Combines Segment profile data, Twilio conversations, and AI insights in one dashboard
🔍 **Smart Search** - Search candidates by name, email, or phone number
💬 **Conversation History** - View complete message history from Twilio Conversations
🧠 **AI Insights** - See memory observations and conversation summaries from Recall
⚡ **Real-time Updates** - Instant updates via Segment webhooks
🎨 **Modern UI** - Polished, professional interface with smooth animations

## Architecture

```
Segment Event → Destination Function → Vercel API → Dashboard
                      ↓
              [Call Transferred]
                      ↓
        Fetch data from:
        - Segment Profile API
        - Twilio Conversations API
        - Recall Memory API
                      ↓
              Cache candidate data
                      ↓
        Dashboard auto-displays profile
```

## Project Structure

```
recruiter-dashboard/
├── dashboard/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── lib/          # API client
│   │   └── types/        # TypeScript definitions
│   └── dist/             # Built frontend (auto-generated)
│
├── server/                # Express.js backend
│   └── src/
│       ├── routes/       # API routes
│       ├── services/     # Business logic
│       └── types/        # TypeScript definitions
│
├── api/                   # Vercel serverless functions
│   └── index.ts          # API entry point
│
└── segment-destination/   # Segment integration
    ├── destination-function.js
    └── README.md
```

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+ and npm
- Segment workspace with Profile API access
- Twilio account
- Recall Memory account

### 1. Clone and Install

```bash
cd recruiter-dashboard
npm install
cd dashboard && npm install
cd ../server && npm install
cd ..
```

### 2. Configure Environment Variables

**Backend** (`server/.env`):
```env
PORT=3001
SEGMENT_PROFILE_TOKEN=your_segment_token
SEGMENT_SPACE_ID=your_space_id
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
MEMORY_STORE_ID=your_memory_store_id
MEMORY_API_KEY=your_memory_api_key
```

**Frontend** (`dashboard/.env`):
```env
VITE_API_URL=http://localhost:3001
```

### 3. Run Development Servers

**Terminal 1 - Backend**:
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd dashboard
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Test with Sample Event

Send a test event to trigger profile loading:

```bash
curl -X POST http://localhost:3001/webhooks/segment \
  -H "Content-Type: application/json" \
  -d '{
    "anonymousId": "+13304027149",
    "event": "Call Transferred to Recruiter",
    "properties": {
      "phone": "+13304027149"
    }
  }'
```

Refresh the dashboard - you should see the candidate profile!

## Production Deployment

> **Important**: This project deploys as a **separate Vercel project** and will NOT conflict with other projects like `amn-demo`. See [VERCEL-SEPARATE-PROJECT.md](./VERCEL-SEPARATE-PROJECT.md) for details.

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment instructions.

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from recruiter-dashboard directory)
cd recruiter-dashboard
./deploy.sh

# OR manually
vercel --prod

# Add environment variables
vercel env add SEGMENT_PROFILE_TOKEN
vercel env add SEGMENT_SPACE_ID
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add MEMORY_STORE_ID
vercel env add MEMORY_API_KEY
```

## Segment Integration

### Set Up Destination Function

1. Go to Segment: **Connections → Catalog → Functions**
2. Create new **Destination** function
3. Copy code from `segment-destination/destination-function.js`
4. Configure webhook URL: `https://your-app.vercel.app/webhooks/segment`
5. Connect to your source
6. Enable the destination

See **[segment-destination/README.md](./segment-destination/README.md)** for detailed instructions.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Dashboard UI |
| `/api/candidates/current` | GET | Get current (last transferred) candidate |
| `/api/candidates/:identifier` | GET | Get specific candidate by phone/email |
| `/api/search?q=<query>` | GET | Search candidates |
| `/webhooks/segment` | POST | Segment webhook endpoint |
| `/health` | GET | Health check |

## Data Flow

### When Call is Transferred

1. Twilio triggers "Call Transferred to Recruiter" event in Segment
2. Segment Destination Function receives the event
3. Function extracts phone number from `anonymousId` or `properties.phone`
4. Function calls webhook: `POST /webhooks/segment`
5. Backend fetches candidate data:
   - **Segment Profile API** - Get candidate traits (name, profession, location, etc.)
   - **Twilio Conversations API** - Get message history
   - **Recall Memory API** - Get AI insights and summaries
6. Backend aggregates all data into unified profile
7. Backend caches as "current candidate"
8. When recruiter opens dashboard, it auto-loads the current candidate

### When Recruiter Searches

1. Recruiter types in search bar
2. Frontend calls `GET /api/search?q=<query>`
3. Backend searches Segment profiles by name, email, or phone
4. Results displayed in dropdown
5. Recruiter clicks result
6. Frontend calls `GET /api/candidates/:identifier`
7. Full candidate profile displayed

## Components

### Frontend Components

- **`SearchBar`** - Autocomplete search with debouncing
- **`ProfileSection`** - Candidate info and "Complete Placement" button
- **`ApplicationContext`** - Application status and abandonment tracking
- **`EventTimeline`** - Activity history from Segment events
- **`MemoryInsights`** - AI observations and conversation summaries
- **`ConversationView`** - Twilio message history with chat bubbles

### Backend Services

- **`SegmentService`** - Interacts with Segment Profile API
- **`TwilioService`** - Fetches conversation history
- **`MemoryService`** - Retrieves AI insights from Recall
- **`CandidateAggregator`** - Combines data from all sources
- **`CacheService`** - In-memory caching for current candidate

## Development

### Build

```bash
# Build frontend
cd dashboard && npm run build

# Build backend
cd server && npm run build
```

### Type Checking

```bash
# Frontend
cd dashboard && npm run type-check

# Backend
cd server && tsc --noEmit
```

### Linting

Frontend uses TypeScript strict mode and React best practices.

## Testing

### Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# Search candidates
curl http://localhost:3001/api/search?q=John

# Get specific candidate
curl http://localhost:3001/api/candidates/+13304027149

# Test webhook
curl -X POST http://localhost:3001/webhooks/segment \
  -H "Content-Type: application/json" \
  -d '{"anonymousId":"+13304027149","event":"Call Transferred to Recruiter","properties":{"phone":"+13304027149"}}'
```

### Test Segment Integration

Use Segment's Event Tester or Analytics.js:

```javascript
analytics.track('Call Transferred to Recruiter', {
  phone: '+13304027149'
}, {
  anonymousId: '+13304027149'
});
```

## Troubleshooting

### Dashboard shows "No Candidate Selected"
- Check if webhook was triggered (Vercel logs)
- Verify phone number exists in Segment
- Test webhook endpoint directly

### "Candidate not found" Error
- Verify Segment Profile API credentials
- Check if profile exists with that phone number
- Test search endpoint: `/api/search?q=<phone>`

### Conversations not loading
- Verify Twilio credentials
- Check if conversations exist for that phone number
- Review Twilio service logs

### AI Insights missing
- Verify Recall Memory credentials
- Check if memory profile exists
- Test memory service directly

## Environment Variables

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete environment variable reference.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Deploy to preview environment on Vercel
5. Submit pull request

## License

Proprietary - AMN Healthcare

## Support

For issues or questions, contact the development team or refer to:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [segment-destination/README.md](./segment-destination/README.md) - Segment setup
- Vercel logs - `vercel logs`
- Segment Event Delivery logs

---

Built with ❤️ for AMN Healthcare recruiters
