# Project Structure & Deployment

Visual guide showing how the recruiter-dashboard relates to other projects and deploys separately.

## Directory Structure

```
📁 amn-new/ (parent directory)
│
├── 📁 amn-demo/                     ← Separate Vercel Project #1
│   ├── vercel.json                  
│   └── (React app for demo)
│   └── Deploys to: amn-demo.vercel.app
│
├── 📁 openai-relay-server/          ← Separate service (not Vercel)
│   └── (Express server)
│
├── 📁 recruiter-dashboard/          ← Separate Vercel Project #2
│   ├── vercel.json                  ← Independent config
│   ├── .vercelrc                    ← Project name enforcement
│   ├── deploy.sh                    ← Deployment script
│   │
│   ├── 📁 dashboard/                ← React frontend
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   └── lib/
│   │   └── dist/                    ← Build output
│   │
│   ├── 📁 server/                   ← Express backend
│   │   └── src/
│   │       ├── server.ts
│   │       ├── services/
│   │       └── routes/
│   │
│   ├── 📁 api/                      ← Vercel serverless wrapper
│   │   └── index.ts
│   │
│   ├── 📁 segment-destination/      ← Segment integration
│   │   ├── destination-function.js
│   │   └── README.md
│   │
│   └── Deploys to: amn-recruiter-dashboard.vercel.app
│
└── vercel.json (parent - for amn-demo)
```

## Deployment Isolation

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Dashboard                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔵 Project: amn-demo                                       │
│     Repository: github.com/you/amn-demo                    │
│     Build from: amn-demo/                                  │
│     URL: https://amn-demo.vercel.app                       │
│     Env Vars: [amn-demo specific vars]                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🟢 Project: amn-recruiter-dashboard                        │
│     Repository: github.com/you/amn-recruiter-dashboard     │
│     Build from: dashboard/                                 │
│     URL: https://amn-recruiter-dashboard.vercel.app        │
│     Env Vars: [dashboard specific vars]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

     ↑                              ↑
     │                              │
  Separate                      Separate
  deployment                    deployment
```

## How Separation Works

### 1. Different `vercel.json` Files

**Parent** (`amn-new/vercel.json`):
```json
{
  "buildCommand": "cd amn-demo && npm run build",
  "outputDirectory": "amn-demo/dist"
}
```

**Dashboard** (`amn-new/recruiter-dashboard/vercel.json`):
```json
{
  "name": "amn-recruiter-dashboard",
  "buildCommand": "cd dashboard && npm run build",
  "outputDirectory": "dashboard/dist"
}
```

### 2. Deploy from Subdirectory

```bash
# Deploy amn-demo
cd amn-new
vercel --prod

# Deploy recruiter-dashboard (SEPARATE!)
cd amn-new/recruiter-dashboard
vercel --prod
```

### 3. Separate Git Repositories (Recommended)

**Best Practice:**

```
GitHub Repository #1: amn-demo
└── Contains only amn-demo code
└── Connected to Vercel Project: amn-demo

GitHub Repository #2: amn-recruiter-dashboard
└── Contains only recruiter-dashboard code
└── Connected to Vercel Project: amn-recruiter-dashboard
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Segment Event                          │
│           "Call Transferred to Recruiter"                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              Segment Destination Function                   │
│         (runs in Segment's infrastructure)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│            POST /webhooks/segment                           │
│     https://amn-recruiter-dashboard.vercel.app             │
│                                                             │
│  ┌───────────────────────────────────────────────┐         │
│  │         Vercel Serverless Function            │         │
│  │              (api/index.ts)                   │         │
│  │                                                │         │
│  │  1. Fetch from Segment Profile API            │         │
│  │  2. Fetch from Twilio Conversations API       │         │
│  │  3. Fetch from Recall Memory API              │         │
│  │  4. Aggregate all data                        │         │
│  │  5. Cache as "current candidate"              │         │
│  └───────────────────────────────────────────────┘         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              Recruiter Dashboard UI                         │
│     (React app served from dashboard/dist/)                 │
│                                                             │
│  Auto-loads candidate profile when opened                   │
└─────────────────────────────────────────────────────────────┘
```

## Environment Variables

Each project has **isolated environment variables**:

### amn-demo (not shown)
- `VITE_SOME_VAR`
- `OTHER_CONFIG`

### amn-recruiter-dashboard
- `SEGMENT_PROFILE_TOKEN` ✅
- `SEGMENT_SPACE_ID` ✅
- `TWILIO_ACCOUNT_SID` ✅
- `TWILIO_AUTH_TOKEN` ✅
- `MEMORY_STORE_ID` ✅
- `MEMORY_API_KEY` ✅

**They don't interfere with each other!**

## Routes

### amn-demo routes
```
https://amn-demo.vercel.app/
https://amn-demo.vercel.app/about
https://amn-demo.vercel.app/contact
```

### amn-recruiter-dashboard routes
```
https://amn-recruiter-dashboard.vercel.app/          ← Dashboard UI
https://amn-recruiter-dashboard.vercel.app/api/...   ← API endpoints
https://amn-recruiter-dashboard.vercel.app/webhooks/segment
https://amn-recruiter-dashboard.vercel.app/health
```

**No conflicts!**

## Build Process

### When you deploy recruiter-dashboard:

```
1. Vercel checks recruiter-dashboard/vercel.json
   ↓
2. Runs: cd dashboard && npm install && npm run build
   ↓
3. Outputs to: dashboard/dist/
   ↓
4. Deploys dist/ as static site
   ↓
5. Deploys api/ as serverless functions
   ↓
6. ✅ Live at: https://amn-recruiter-dashboard.vercel.app
```

### amn-demo is NOT affected!

```
❌ Does not rebuild
❌ Does not redeploy
❌ Does not change
✅ Continues running independently
```

## Summary

✅ **Two separate Vercel projects**
- Different URLs
- Different environment variables
- Different git repositories (recommended)
- Different build configurations

✅ **No conflicts**
- Routes don't overlap
- Builds don't interfere
- Deployments are independent

✅ **Easy to manage**
- Deploy each separately
- Update each independently
- Scale each separately

---

## Quick Reference

```bash
# Check which project you're deploying
pwd
# Should output: .../recruiter-dashboard

# Deploy dashboard only
vercel --prod

# Verify it's the right project
vercel ls
# Should show: amn-recruiter-dashboard
```

---

For detailed deployment steps, see:
- [DEPLOYMENT-SUMMARY.md](./DEPLOYMENT-SUMMARY.md) - Quick start
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full guide
- [VERCEL-SEPARATE-PROJECT.md](./VERCEL-SEPARATE-PROJECT.md) - Technical details
