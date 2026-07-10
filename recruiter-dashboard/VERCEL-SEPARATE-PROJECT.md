# Vercel Deployment - Separate Project

This document explains how the recruiter-dashboard deploys as a **separate, independent Vercel project** to avoid conflicts with other projects.

## Why Separate Projects?

Your directory structure has multiple projects:
```
amn-new/
├── amn-demo/              ← Already deployed to Vercel
├── openai-relay-server/   ← Separate service
└── recruiter-dashboard/   ← This project (NEW separate deployment)
```

Each should be its own Vercel project to avoid:
- ❌ Build conflicts
- ❌ Route conflicts  
- ❌ Environment variable mixing
- ❌ Deployment confusion

## How This is Configured

### 1. Project-Level Configuration

**`vercel.json`** includes:
```json
{
  "name": "amn-recruiter-dashboard",  ← Explicit project name
  ...
}
```

**`.vercelrc`** ensures:
```json
{
  "projectName": "amn-recruiter-dashboard"
}
```

### 2. Separate Git Repository (Recommended)

Best practice is to create a **separate GitHub repository**:

```bash
cd recruiter-dashboard
git init
git remote add origin https://github.com/yourorg/amn-recruiter-dashboard.git
git push -u origin main
```

Then connect **this repository** to Vercel, completely separate from `amn-demo`.

### 3. Deploy from Subdirectory

When deploying with Vercel CLI from the parent directory:

```bash
# ❌ Don't do this (deploys parent)
cd /path/to/amn-new
vercel

# ✅ Do this (deploys only dashboard)
cd /path/to/amn-new/recruiter-dashboard
vercel
```

Always run `vercel` commands from **inside** the `recruiter-dashboard` directory.

## Deployment Steps

### Option 1: Quick Deploy (Vercel CLI)

```bash
cd /Users/ericwalters/Documents/clients/amn-new/recruiter-dashboard
./deploy.sh
```

When prompted:
- **"Link to existing project?"** → **No**
- **"Project name?"** → `amn-recruiter-dashboard`

### Option 2: GitHub Integration

1. Create new repo: `amn-recruiter-dashboard`
2. Push only the recruiter-dashboard folder
3. Import to Vercel as new project

## Verifying Separation

After deployment, you should see **TWO separate projects** in your Vercel dashboard:

1. `amn-demo` (your existing project)
   - URL: `https://amn-demo-xyz.vercel.app`
   - Builds from: `amn-demo/` directory

2. `amn-recruiter-dashboard` (new project)
   - URL: `https://amn-recruiter-dashboard-abc.vercel.app`
   - Builds from: `recruiter-dashboard/dashboard/` directory

## Environment Variables

Each project has **separate environment variables**:

```bash
# Set variables for recruiter-dashboard only
cd recruiter-dashboard
vercel env add SEGMENT_PROFILE_TOKEN
vercel env add TWILIO_ACCOUNT_SID
# etc...
```

These **will not affect** your `amn-demo` project.

## URLs

After deployment, your projects will be at:

| Project | Purpose | Example URL |
|---------|---------|-------------|
| `amn-demo` | Main demo app | `https://amn-demo.vercel.app` |
| `amn-recruiter-dashboard` | Recruiter dashboard | `https://amn-recruiter-dashboard.vercel.app` |
| `openai-relay-server` | (if deployed) | `https://openai-relay.vercel.app` |

Each is completely independent!

## Common Issues

### Issue: Vercel tries to deploy parent directory

**Solution**: Always `cd` into `recruiter-dashboard` before running `vercel` commands.

### Issue: Build fails with "multiple package.json found"

**Solution**: Deploy each project separately, not from parent directory.

### Issue: Environment variables not working

**Solution**: Make sure you're setting env vars for the correct project:
```bash
cd recruiter-dashboard
vercel env ls  # Check which project you're in
```

### Issue: Wrong project is deploying

**Solution**: 
1. Check you're in the right directory: `pwd`
2. Verify project link: `cat .vercel/project.json`
3. If wrong, remove `.vercel/` and re-run `vercel`

## Summary

✅ Each project in your workspace should be:
- Deployed separately
- Have its own Git repository (recommended)
- Have its own Vercel project
- Have separate environment variables
- Have separate URLs

✅ To deploy recruiter-dashboard:
- Always `cd` into the directory first
- Use `./deploy.sh` or `vercel --prod`
- Answer "No" to linking existing projects

❌ Don't:
- Deploy from parent directory
- Link to existing `amn-demo` project
- Mix environment variables between projects

---

**Quick Command Reference:**

```bash
# Deploy dashboard (separate project)
cd recruiter-dashboard
vercel --prod

# Deploy amn-demo (different project)  
cd ../amn-demo
vercel --prod

# Each is independent!
```
