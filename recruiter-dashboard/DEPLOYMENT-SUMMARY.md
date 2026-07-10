# Quick Deployment Summary

Deploy the AMN Recruiter Dashboard as a **separate Vercel project** in 3 simple steps.

## ⚡ Quick Start

### Step 1: Deploy to Vercel (5 minutes)

```bash
cd /Users/ericwalters/Documents/clients/amn-new/recruiter-dashboard
./deploy.sh
```

**Important prompts:**
- "Link to existing project?" → **NO** (creates separate project from amn-demo)
- "Project name?" → `amn-recruiter-dashboard`

### Step 2: Add Environment Variables (3 minutes)

```bash
vercel env add SEGMENT_PROFILE_TOKEN
vercel env add SEGMENT_SPACE_ID
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add MEMORY_STORE_ID
vercel env add MEMORY_API_KEY

# Redeploy with env vars
vercel --prod
```

### Step 3: Configure Segment (10 minutes)

1. Go to Segment: **Connections → Catalog → Functions**
2. Create new **Destination** function
3. Copy code from `segment-destination/destination-function.js`
4. Configure webhook URL: `https://your-app.vercel.app/webhooks/segment`
5. Connect to your source
6. Enable destination

**Done!** 🎉

---

## Verification

### Test the Webhook

```bash
curl -X POST https://your-vercel-url.vercel.app/webhooks/segment \
  -H "Content-Type: application/json" \
  -d '{
    "anonymousId": "+13304027149",
    "event": "Call Transferred to Recruiter",
    "properties": {"phone": "+13304027149"}
  }'
```

### Check Dashboard

Open `https://your-vercel-url.vercel.app` - you should see the candidate profile loaded!

---

## What This Creates

Two **separate** Vercel projects:

1. **amn-demo** (existing)
   - Your main demo app
   - URL: `https://amn-demo.vercel.app`
   - No changes to this project

2. **amn-recruiter-dashboard** (new)
   - Recruiter dashboard
   - URL: `https://amn-recruiter-dashboard.vercel.app`
   - Completely independent

---

## Files Overview

| File | Purpose |
|------|---------|
| `deploy.sh` | Automated deployment script |
| `vercel.json` | Vercel configuration |
| `.vercelrc` | Project name configuration |
| `DEPLOYMENT.md` | Detailed deployment guide |
| `VERCEL-SEPARATE-PROJECT.md` | Explains project separation |
| `segment-destination/destination-function.js` | Segment integration code |

---

## Need Help?

- **Deployment issues**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Project separation**: See [VERCEL-SEPARATE-PROJECT.md](./VERCEL-SEPARATE-PROJECT.md)
- **Segment setup**: See [segment-destination/README.md](./segment-destination/README.md)
- **General questions**: See [README.md](./README.md)

---

## Common Commands

```bash
# Deploy
cd recruiter-dashboard
vercel --prod

# Check deployment
vercel ls

# View logs
vercel logs

# Add environment variable
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls
```

---

**Next**: After deployment, set up the Segment Destination Function to enable auto-loading of candidate profiles when calls are transferred!
