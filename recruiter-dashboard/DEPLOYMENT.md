# Deployment Guide - AMN Recruiter Dashboard

This guide walks you through deploying the recruiter dashboard to Vercel as a **separate, independent project** and setting up the Segment integration.

> **Important**: This dashboard deploys as its own Vercel project and will NOT conflict with other projects in your workspace (like `amn-demo`).

## Prerequisites

- GitHub account (or GitLab/Bitbucket)
- Vercel account (sign up at vercel.com)
- Segment workspace with access to create Functions
- API credentials:
  - Segment Profile API token
  - Twilio Account SID and Auth Token
  - Recall Memory API key and Store ID

---

## Part 1: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

**This will create a NEW Vercel project separate from any existing projects.**

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from the recruiter-dashboard directory**:
   ```bash
   cd /Users/ericwalters/Documents/clients/amn-new/recruiter-dashboard
   vercel
   ```

4. **Follow the prompts**:
   - "Set up and deploy?" → **Yes**
   - "Which scope?" → Select your account/team
   - "Link to existing project?" → **No** (important - create new project!)
   - "What's your project's name?" → `amn-recruiter-dashboard`
   - "In which directory is your code located?" → `./` (press Enter)
   
   > ⚠️ **Important**: Make sure to answer **No** to "Link to existing project?" to create a separate project from `amn-demo`

5. **Configure Environment Variables**:
   ```bash
   vercel env add SEGMENT_PROFILE_TOKEN
   vercel env add SEGMENT_SPACE_ID
   vercel env add TWILIO_ACCOUNT_SID
   vercel env add TWILIO_AUTH_TOKEN
   vercel env add MEMORY_STORE_ID
   vercel env add MEMORY_API_KEY
   ```

6. **Deploy to production**:
   ```bash
   vercel --prod
   ```

7. **Note your deployment URL** (e.g., `https://amn-recruiter-dashboard.vercel.app`)

### Option B: Deploy via GitHub + Vercel Dashboard

1. **Create a separate GitHub repository** (recommended to avoid conflicts):
   ```bash
   cd /Users/ericwalters/Documents/clients/amn-new/recruiter-dashboard
   git init
   git add .
   git commit -m "Initial commit: AMN Recruiter Dashboard"
   git branch -M main
   git remote add origin https://github.com/yourusername/amn-recruiter-dashboard.git
   git push -u origin main
   ```
   
   > 💡 **Tip**: Create a **new, separate repository** just for the dashboard to keep it independent from other projects.

2. **Connect to Vercel**:
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your **new** GitHub repository
   - Configure project:
     - **Project Name**: `amn-recruiter-dashboard`
     - Framework Preset: Vite
     - Root Directory: `./` (leave as root)
     - Build Command: `cd dashboard && npm install && npm run build`
     - Output Directory: `dashboard/dist`

3. **Add Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add each variable for Production, Preview, and Development:
     - `SEGMENT_PROFILE_TOKEN`
     - `SEGMENT_SPACE_ID`
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
     - `MEMORY_STORE_ID`
     - `MEMORY_API_KEY`

4. **Deploy**: Click "Deploy"

5. **Note your deployment URL** from the Vercel dashboard

---

## Part 2: Set Up Segment Destination Function

### Step 1: Create the Destination Function

1. In your Segment workspace, navigate to:
   **Connections → Catalog → Functions**

2. Click **"New Function"**

3. Select **"Destination"**

4. Name the function: **"AMN Recruiter Dashboard Webhook"**

5. Add a description:
   ```
   Forwards "Call Transferred to Recruiter" events to the recruiter dashboard
   to automatically load candidate profiles when calls are transferred.
   ```

6. **Copy and paste** the code from `segment-destination/destination-function.js`

7. Click **"Configure"** to set up the function settings

### Step 2: Configure Settings

The function needs one setting - the webhook URL:

- **Setting Key**: `webhookUrl`
- **Label**: Webhook URL
- **Description**: Your Vercel deployment URL + /webhooks/segment
- **Type**: String
- **Required**: Yes

Click **"Save"**

### Step 3: Connect to Your Source

1. After saving the function, click **"Connect Destination"**

2. Select your source (the one that sends "Call Transferred to Recruiter" events)

3. Give the destination a name: **"AMN Recruiter Dashboard"**

4. Configure the webhook URL setting:
   ```
   https://your-vercel-url.vercel.app/webhooks/segment
   ```
   Replace `your-vercel-url` with your actual Vercel deployment URL

5. Click **"Save"** and **"Enable Destination"**

---

## Part 3: Test the Integration

### Test with Segment Debugger

1. In Segment, go to **Connections → Sources → [Your Source] → Debugger**

2. Send a test event:
   ```json
   {
     "anonymousId": "+13304027149",
     "event": "Call Transferred to Recruiter",
     "properties": {
       "phone": "+13304027149",
       "from": "+13304027149",
       "callSid": "CAxxxxxxxxxxxxxxxxxxxx"
     },
     "timestamp": "2024-07-07T12:00:00Z"
   }
   ```

3. Check the Destination function logs to see if it was triggered

4. Open your dashboard URL - you should see the candidate profile loaded automatically!

### Test with Analytics.js

If you're using Segment's Analytics.js in your application:

```javascript
analytics.track('Call Transferred to Recruiter', {
  phone: '+13304027149',
  from: '+13304027149'
}, {
  anonymousId: '+13304027149'
});
```

### Test with cURL

```bash
curl -X POST https://your-vercel-url.vercel.app/webhooks/segment \
  -H "Content-Type: application/json" \
  -d '{
    "anonymousId": "+13304027149",
    "event": "Call Transferred to Recruiter",
    "properties": {
      "phone": "+13304027149"
    }
  }'
```

---

## Part 4: Verify the Flow

### Expected Behavior

1. **Event Received**: Segment receives "Call Transferred to Recruiter" event
2. **Destination Function Fires**: Function extracts phone number and calls webhook
3. **Backend Processing**: Vercel API fetches candidate data from:
   - Segment Profile API (candidate traits)
   - Twilio Conversations API (message history)
   - Recall Memory API (AI insights)
4. **Data Cached**: Complete candidate profile is cached as "current candidate"
5. **Dashboard Auto-Load**: When recruiter opens dashboard, it automatically displays the transferred candidate

### Check Logs

**Vercel Function Logs**:
```bash
vercel logs
```

Or view in Vercel Dashboard: Project → Deployments → [Latest] → Functions

**Segment Function Logs**:
Connections → Destinations → AMN Recruiter Dashboard → Event Delivery

---

## Troubleshooting

### Dashboard shows "No Candidate Selected"

**Possible causes**:
- No "Call Transferred to Recruiter" event has been sent yet
- Webhook isn't reaching the backend
- Phone number not found in Segment

**Debug steps**:
1. Check Vercel function logs for webhook requests
2. Verify environment variables are set in Vercel
3. Test webhook endpoint directly with cURL

### "Candidate not found" Error

**Possible causes**:
- Phone number doesn't exist as anonymousId in Segment
- Segment Profile API credentials incorrect

**Debug steps**:
1. Check Segment Profile API for the phone number
2. Verify `SEGMENT_PROFILE_TOKEN` and `SEGMENT_SPACE_ID` are correct
3. Test with `/api/search?q=<phone>` endpoint

### Destination Function Not Firing

**Possible causes**:
- Event name doesn't exactly match "Call Transferred to Recruiter"
- Destination not enabled
- Source not connected

**Debug steps**:
1. Check Event Delivery in Segment dashboard
2. Verify destination is enabled
3. Check event name is exact match (case-sensitive)

---

## API Endpoints

Once deployed, your application exposes these endpoints:

- `GET /` - Dashboard UI
- `GET /api/candidates/current` - Get current candidate
- `GET /api/candidates/:identifier` - Get specific candidate
- `GET /api/search?q=<query>` - Search for candidates
- `POST /webhooks/segment` - Segment webhook endpoint
- `GET /health` - Health check

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SEGMENT_PROFILE_TOKEN` | Segment Profile API token | `pk_live_xxxxx` |
| `SEGMENT_SPACE_ID` | Segment Space ID | `spa_xxxxx` |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | `ACxxxxx` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | `your_auth_token` |
| `MEMORY_STORE_ID` | Recall Memory Store ID | `store_xxxxx` |
| `MEMORY_API_KEY` | Recall API Key | `sk_xxxxx` |

---

## Next Steps

After successful deployment:

1. ✅ Test with real candidate data
2. ✅ Train recruiters on the new workflow
3. ✅ Set up monitoring/alerting for webhook failures
4. ✅ Consider adding more event types (e.g., "Application Started")
5. ✅ Customize dashboard based on recruiter feedback

---

## Support

For issues or questions:
- Check Vercel function logs
- Check Segment destination function logs
- Review this documentation
- Contact your development team
