# AMN Healthcare Recruiter Dashboard

A real-time dashboard for AMN Healthcare recruiters to view comprehensive candidate context when calls are transferred. Displays Segment profile data, Twilio conversation history, and AI-extracted insights from Twilio Memory API.

## Architecture

### Event-Driven Approach

1. **Call Transfer Event**: When a prospect is transferred to a recruiter, the AI agent sends a "Call Transferred to Recruiter" event to the AMN Phone source in Segment
2. **Segment Webhook**: Segment forwards this event to the dashboard backend via `POST /webhooks/segment`
3. **Data Aggregation**: Backend fetches all relevant data:
   - Segment profile traits and events
   - Twilio conversation messages across all channels
   - Twilio Memory observations and summaries
4. **Dashboard Display**: Recruiter sees complete candidate context automatically
5. **Manual Search**: Fallback search by email, phone, or name

### Tech Stack

**Backend:**
- Node.js + TypeScript + Express
- Segment Profile API
- Twilio Conversations API + Memory API
- In-memory caching (1 hour TTL)

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS (AMN Healthcare brand colors)
- Lucide React icons
- date-fns for date formatting

## Project Structure

```
recruiter-dashboard/
├── server/                 # Backend API
│   ├── src/
│   │   ├── server.ts       # Express app entry point
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API endpoints
│   │   └── types/          # TypeScript types
│   └── package.json
│
└── dashboard/              # Frontend React app
    ├── src/
    │   ├── App.tsx         # Main app component
    │   ├── components/     # UI components
    │   ├── lib/            # API client
    │   └── types/          # TypeScript types
    └── package.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Twilio account with Conversations API and Memory Store configured
- Segment workspace with Profile API access

### Backend Setup

1. Navigate to server directory:
   ```bash
   cd recruiter-dashboard/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```
   PORT=3001
   
   # Segment Profile API
   SEGMENT_PROFILE_TOKEN=sgp_your_token_here
   SEGMENT_SPACE_ID=spa_your_space_id_here
   SEGMENT_WRITE_KEY=your_write_key_here
   
   # Twilio
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   
   # Twilio Memory API
   MEMORY_STORE_ID=your_memory_store_id_here
   
   # Webhook security
   SEGMENT_WEBHOOK_SECRET=your_webhook_secret_here
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

   Backend will run at `http://localhost:3001`

### Frontend Setup

1. Navigate to dashboard directory:
   ```bash
   cd recruiter-dashboard/dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (optional - defaults to localhost:3001):
   ```bash
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

   Frontend will run at `http://localhost:5173`

## API Endpoints

### Backend REST API

- `GET /api/candidates/:identifier` - Get full candidate details
- `GET /api/candidates/current` - Get most recently transferred candidate
- `GET /api/search?q=query` - Search candidates by email/phone/name
- `POST /webhooks/segment` - Receive Segment events
- `GET /health` - Health check

## Testing the Dashboard

### Method 1: Segment Webhook (Automatic)

When a call is transferred in the `openai-relay-server`, a "Call Transferred to Recruiter" event is sent to Segment. Configure Segment to forward this event to:

```
POST http://your-server/webhooks/segment
```

The dashboard will automatically fetch and display candidate data.

### Method 2: Manual Search

1. Open dashboard: `http://localhost:5173`
2. Type email, phone, or name in search bar
3. Select candidate from dropdown
4. View complete profile with conversations and insights

### Method 3: Direct API Call

Simulate webhook for testing:

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

Then open `http://localhost:5173` - candidate should auto-load.

## Dashboard Features

### Profile Section
- Contact information (email, phone, city, zip)
- Professional details (profession, specialty, discipline)
- Visual badges and icons

### Activity Timeline
- Chronological list of recent events
- Color-coded by event type (abandoned, message, call)
- Relative timestamps ("2 hours ago")

### Conversations
- Multi-channel message history (Web, RCS, SMS, Voice)
- Channel badges for easy identification
- Chat bubble UI with candidate vs. AI agent distinction

### AI Insights
- Observations: Key insights extracted by AI
- Summaries: Condensed conversation highlights
- Timestamps for each insight

### Application Context
- Job applied for
- Application ID
- Abandonment step (if abandoned)

## Development

### Backend Development

```bash
cd server
npm run dev    # Hot reload with tsx watch
```

### Frontend Development

```bash
cd dashboard
npm run dev    # Vite dev server with HMR
```

### Building for Production

**Backend:**
```bash
cd server
npm run build  # Compile TypeScript to dist/
npm start      # Run compiled server
```

**Frontend:**
```bash
cd dashboard
npm run build  # Build to dist/
npm run preview # Preview production build
```

## Deployment

### Backend Deployment Options

1. **Vercel Serverless Functions** (simplest)
   - Add `vercel.json` configuration
   - Deploy: `vercel deploy`

2. **Railway** (recommended for persistent server)
   - Connect GitHub repo
   - Set environment variables
   - Auto-deploys on push

3. **Render**
   - Similar to Railway
   - Free tier available

### Frontend Deployment

**Vercel** (recommended):
```bash
cd dashboard
vercel deploy
```

Update `VITE_API_URL` in production `.env` to point to production backend.

## Environment Variables

### Backend Required Variables

- `SEGMENT_PROFILE_TOKEN` - Profile API token (sgp_...)
- `SEGMENT_SPACE_ID` - Segment space ID (spa_...)
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `MEMORY_STORE_ID` - Twilio Memory Store ID

### Frontend Optional Variables

- `VITE_API_URL` - Backend API URL (defaults to localhost:3001)

## Troubleshooting

### "No profile found" Error

- Verify Segment Profile API credentials
- Check that identifier format is correct (email:..., phone:+1...)
- Ensure profile exists in Segment

### "No conversations found"

- Verify Twilio credentials
- Check that phone number is normalized to E.164 format
- Ensure candidate has participated in conversations

### "No Memory profile"

- Memory Store ID must be configured
- Profile must exist in Memory Store
- Check that observations/summaries have been created

### Backend won't start

- Verify all environment variables are set
- Check port 3001 is not in use
- Run `npm install` to ensure dependencies are installed

### Frontend won't connect to backend

- Verify backend is running on port 3001
- Check Vite proxy configuration in `vite.config.ts`
- Ensure CORS is enabled on backend

## Support

For issues related to:
- **Segment**: Check Profile API documentation
- **Twilio**: Verify Conversations API and Memory Store setup
- **Dashboard**: Review browser console for errors

## License

Proprietary - AMN Healthcare
