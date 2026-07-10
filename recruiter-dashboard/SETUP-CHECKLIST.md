# Setup Checklist - AMN Recruiter Dashboard

Use this checklist to deploy the dashboard to production.

## ☑️ Pre-Deployment

- [ ] Gather all API credentials:
  - [ ] Segment Profile API token (`SEGMENT_PROFILE_TOKEN`)
  - [ ] Segment Space ID (`SEGMENT_SPACE_ID`)
  - [ ] Twilio Account SID (`TWILIO_ACCOUNT_SID`)
  - [ ] Twilio Auth Token (`TWILIO_AUTH_TOKEN`)
  - [ ] Recall Memory Store ID (`MEMORY_STORE_ID`)
  - [ ] Recall Memory API Key (`MEMORY_API_KEY`)

- [ ] Test locally first:
  - [ ] Backend runs on http://localhost:3001
  - [ ] Frontend runs on http://localhost:5173
  - [ ] Can search for candidates
  - [ ] Webhook endpoint works with cURL test

## ☑️ Vercel Deployment

> **Important**: This deploys as a NEW, SEPARATE Vercel project (not linked to `amn-demo`)

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Navigate to recruiter-dashboard: `cd recruiter-dashboard`
- [ ] Run deploy script: `./deploy.sh` (or `vercel --prod`)
- [ ] When prompted "Link to existing project?" → Answer **NO**
- [ ] When prompted for project name → Use `amn-recruiter-dashboard`
- [ ] Add all environment variables:
  ```bash
  vercel env add SEGMENT_PROFILE_TOKEN
  vercel env add SEGMENT_SPACE_ID
  vercel env add TWILIO_ACCOUNT_SID
  vercel env add TWILIO_AUTH_TOKEN
  vercel env add MEMORY_STORE_ID
  vercel env add MEMORY_API_KEY
  ```
- [ ] Note deployment URL: ________________

## ☑️ Segment Destination Function

- [ ] Navigate to: Segment → Connections → Catalog → Functions
- [ ] Create new Destination function named "AMN Recruiter Dashboard Webhook"
- [ ] Copy code from `segment-destination/destination-function.js`
- [ ] Configure webhook URL setting with your Vercel URL + `/webhooks/segment`
- [ ] Connect to your source (e.g., "AMN Phone")
- [ ] Enable the destination

## ☑️ Testing

- [ ] Test webhook endpoint directly:
  ```bash
  curl -X POST https://YOUR-VERCEL-URL.vercel.app/webhooks/segment \
    -H "Content-Type: application/json" \
    -d '{"anonymousId":"+13304027149","event":"Call Transferred to Recruiter","properties":{"phone":"+13304027149"}}'
  ```

- [ ] Send test event from Segment Debugger
- [ ] Verify dashboard loads automatically: https://YOUR-VERCEL-URL.vercel.app
- [ ] Test search functionality
- [ ] Verify "Complete Placement" button sends Segment event

## ☑️ Monitoring

- [ ] Bookmark Vercel dashboard: https://vercel.com/YOUR-PROJECT
- [ ] Bookmark Segment Event Delivery logs
- [ ] Set up alerts for webhook failures (optional)
- [ ] Document deployment URL for team

## ☑️ Training

- [ ] Brief recruiters on new workflow
- [ ] Show dashboard features:
  - [ ] Auto-loading profiles
  - [ ] Search functionality
  - [ ] Complete Placement button
  - [ ] AI insights section
- [ ] Provide support contact information

---

## URLs to Document

Once deployed, record these URLs for your team:

| Item | URL |
|------|-----|
| **Dashboard** | https://________________.vercel.app |
| **API Health Check** | https://________________.vercel.app/health |
| **Webhook Endpoint** | https://________________.vercel.app/webhooks/segment |
| **Vercel Dashboard** | https://vercel.com/________________ |
| **Segment Function** | https://app.segment.com/________________/functions |

---

## Need Help?

- **Deployment Issues**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Segment Setup**: See [segment-destination/README.md](./segment-destination/README.md)
- **General Questions**: See [README.md](./README.md)
- **Vercel Logs**: Run `vercel logs` or check Vercel dashboard

---

**Status**: ☐ Not Started | ⏳ In Progress | ✅ Complete
