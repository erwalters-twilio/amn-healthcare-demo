# RCS Webhook Setup Guide

This guide walks through setting up RCS interaction tracking with Twilio webhooks and Segment integration.

## What This Does

Captures when candidates reply to RCS messages or click buttons, then sends events to Segment for:
- Analytics and reporting
- Journey orchestration (triggering next steps like Voice AI calls)
- Recruiter dashboard context (Phase 2)

## Prerequisites

- [ ] Twilio account with RCS sender configured
- [ ] Segment workspace with source configured
- [ ] Vercel account for deployment
- [ ] This repo deployed to Vercel

## Step 1: Get Twilio Credentials

1. Go to [Twilio Console](https://console.twilio.com)
2. Copy your credentials:
   - **Account SID** (starts with `AC`)
   - **Auth Token** (click to reveal)
3. Save these securely - you'll need them for environment variables

## Step 2: Get Segment Server-Side Write Key

1. Go to [Segment Dashboard](https://app.segment.com)
2. Navigate to: **Sources** → [Your Source] → **Settings** → **API Keys**
3. Copy the **Write Key** (server-side key)
4. **Important**: This should be DIFFERENT from the client-side key already in `.env`

> **Why two keys?**
> - Client-side key: Used by browser (already configured)
> - Server-side key: Used by API functions (new, for webhooks)

## Step 3: Configure Environment Variables

### Local Development

1. Copy `.env.example` to `.env` (if not already done):
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```bash
   # Client-side (already configured)
   VITE_SEGMENT_WRITE_KEY=JFvPd0OsxWNOnOaTRqrNBlYBTnn6Xnyp

   # Server-side (NEW - add these)
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
   SEGMENT_WRITE_KEY=your_segment_server_side_write_key_here
   ```

3. **Never commit `.env`** - it's already in `.gitignore`

### Vercel Deployment

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add each variable:

   | Key | Value | Environments |
   |-----|-------|--------------|
   | `TWILIO_ACCOUNT_SID` | ACxxxxxxxx... | Production, Preview, Development |
   | `TWILIO_AUTH_TOKEN` | Your auth token | Production, Preview, Development |
   | `SEGMENT_WRITE_KEY` | Your server key | Production, Preview, Development |

5. Mark `TWILIO_AUTH_TOKEN` and `SEGMENT_WRITE_KEY` as **sensitive**

6. Redeploy after adding variables:
   ```bash
   git push origin main
   ```

## Step 4: Deploy to Vercel

### First-Time Deployment

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
cd amn-demo
vercel --prod
```

### Get Your Webhook URL

After deployment, your webhook URL will be:
```
https://your-project-name.vercel.app/api/webhooks/twilio-inbound
```

Copy this URL - you'll need it for Twilio configuration.

## Step 5: Configure Twilio Webhook

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to **Messaging** → **Services** → [Your Messaging Service]
3. Scroll to **Inbound Settings**
4. Configure:
   - **Webhook URL**: `https://your-project-name.vercel.app/api/webhooks/twilio-inbound`
   - **HTTP Method**: `POST`
   - **Fallback URL**: (optional) Same URL for redundancy
5. Click **Save**

### Optional: Enable Status Callbacks

For delivery tracking (queued → sent → delivered):
1. In same Messaging Service settings
2. Find **Status Callback URL**
3. Set to: `https://your-project-name.vercel.app/api/webhooks/twilio-status` (future implementation)

## Step 6: Test the Integration

### Method 1: Send Test Message

1. Send RCS message to your Twilio number from your phone
2. Reply to the message
3. Check that webhook received the reply:
   - Vercel Dashboard → Functions → Logs
   - Look for "Twilio webhook received" log

### Method 2: Check Segment

1. Go to [Segment Debugger](https://app.segment.com)
2. Navigate to your source → **Debugger**
3. Look for "RCS Message Received" event
4. Verify:
   - `anonymousId` is phone in format: "+13304027149"
   - `properties.phone` matches
   - `properties.message_sid` exists
   - Timestamp is recent

### Method 3: Local Testing with ngrok

For local development:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start ngrok
ngrok http 5173

# Copy ngrok URL (e.g., https://xxxx.ngrok.io)
```

Update Twilio webhook to ngrok URL:
```
https://xxxx.ngrok.io/api/webhooks/twilio-inbound
```

Send test message and watch terminal logs.

## Step 7: Verify End-to-End Flow

Complete flow test:
1. **Candidate abandons application** → "Application Abandoned" event sent to Segment
2. **Segment triggers Twilio destination** → RCS message sent to candidate
3. **Candidate replies to RCS** → Webhook receives reply → "RCS Message Received" sent to Segment
4. **Check Segment** → Both events visible, merged by phone number

## Troubleshooting

### Webhook Returns 403 Forbidden

**Cause**: Signature validation failed  
**Fix**:
- Verify `TWILIO_AUTH_TOKEN` matches console exactly
- Check webhook URL matches exactly (including https://)
- Redeploy after changing environment variables

### Events Not Appearing in Segment

**Cause**: Wrong write key or network issue  
**Fix**:
- Verify `SEGMENT_WRITE_KEY` is server-side key (not client-side)
- Check Vercel function logs for errors
- Test Segment key with curl:
  ```bash
  curl -X POST https://api.segment.io/v1/track \
    -H "Content-Type: application/json" \
    -u YOUR_WRITE_KEY: \
    -d '{"anonymousId":"test","event":"Test Event"}'
  ```

### Duplicate Events in Segment

**Cause**: Webhook timeout causing Twilio retries  
**Fix**:
- Webhook must respond in <15 seconds
- Check Vercel function logs for slow responses
- Handler already returns 200 immediately

### No Webhook Calls Received

**Cause**: Incorrect URL or Twilio config  
**Fix**:
- Verify URL in Twilio console matches deployment
- Check Vercel deployment is live
- Send test message and check Twilio error logs

## Monitoring

### Vercel Logs

Dashboard → Functions → Select function → View logs

Look for:
- ✅ "Twilio webhook received"
- ✅ "Segment event sent: RCS Message Received"
- ❌ "Invalid Twilio signature" (signature validation failed)
- ❌ "Failed to track RCS message" (Segment API error)

### Segment Debugger

Real-time event stream showing:
- Event name
- Properties
- `anonymousId` (phone number)
- Timestamp

### Twilio Error Logs

Console → Monitor → Logs → Errors

Shows webhook failures:
- HTTP errors (403, 500, timeout)
- Network connectivity issues
- Invalid URLs

## What's Next

Once webhooks are working:

1. **Phase 1.5: Create Segment Journey**
   - Trigger: "RCS Message Received"
   - Condition: Check message body for keywords
   - Action: Send to Twilio Voice destination

2. **Phase 2: Recruiter Dashboard**
   - Fetch conversation transcript via Twilio Conversations API
   - Display full candidate context
   - Show RCS interactions timeline

3. **Enhancements**:
   - Add status callback handler for delivery tracking
   - Implement conversation memory integration
   - Add rich card analytics

## Key Files Reference

| File | Purpose |
|------|---------|
| `/api/webhooks/twilio-inbound.js` | Main webhook handler |
| `/api/webhooks/README.md` | Technical documentation |
| `.env` | Local environment variables |
| `.env.example` | Template for environment variables |
| `WEBHOOK_SETUP.md` | This setup guide |

## Support

- [Twilio Webhooks Docs](https://www.twilio.com/docs/usage/webhooks)
- [Twilio Signature Validation](https://www.twilio.com/docs/usage/security#validating-requests)
- [Segment Server-Side Tracking](https://segment.com/docs/connections/sources/catalog/libraries/server/node/)
- [Vercel Functions](https://vercel.com/docs/functions)

## Security Checklist

- [ ] `.env` is in `.gitignore` (never committed)
- [ ] Vercel environment variables marked as sensitive
- [ ] Webhook validates Twilio signature on every request
- [ ] HTTPS only (Vercel enforces this)
- [ ] Server-side keys separate from client-side keys

---

**Setup Status**: ✅ Code implemented, ready for configuration and deployment
