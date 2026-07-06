# Twilio Webhook Handlers

This directory contains Vercel serverless functions that handle webhooks from Twilio.

## Overview

When candidates reply to RCS messages, Twilio sends a POST webhook to our endpoint. We capture these interactions and forward them to Segment for analytics and journey orchestration.

## Files

### `twilio-inbound.js`

Main webhook handler for inbound RCS messages and rich card interactions.

**Endpoint**: `https://your-app.vercel.app/api/webhooks/twilio-inbound`

**What it does**:
1. Validates Twilio signature (security)
2. Parses inbound message data
3. Detects interaction type (text reply vs. rich card interaction)
4. Sends event to Segment with phone number as `anonymousId`
5. Returns empty TwiML response (no auto-reply)

**Events Sent to Segment**:

1. **RCS Message Received** - When candidate sends a text reply
   ```javascript
   {
     anonymousId: "+13304027149",
     event: "RCS Message Received",
     properties: {
       message_sid: "SMxxxxx",
       from: "+13304027149",
       to: "+15559876543",
       body: "I'm interested!",
       phone: "+13304027149",
       num_media: 0,
       channel: "rcs",
       timestamp: "2026-07-03T14:35:12.000Z",
       date: "2026-07-03",
       time: "14:35:12",
       unix: 1720013712
     }
   }
   ```

2. **RCS Card Interaction** - When candidate clicks button, selects list item, or shares location
   ```javascript
   {
     anonymousId: "+13304027149",
     event: "RCS Card Interaction",
     properties: {
       message_sid: "SMxxxxx",
       from: "+13304027149",
       phone: "+13304027149",
       interaction_type: "button_click",
       button_payload: "schedule_call",
       button_text: "Schedule a Call",
       channel: "rcs",
       timestamp: "2026-07-03T14:36:45.000Z",
       ...
     }
   }
   ```

## Configuration

### 1. Environment Variables

Add these to `.env` (see `.env.example`):

```bash
# Twilio credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here

# Segment server-side write key (different from client-side key)
SEGMENT_WRITE_KEY=your_segment_server_side_write_key_here
```

### 2. Twilio Console Setup

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to **Messaging** → **Services** → [Your Messaging Service]
3. Configure **Inbound Settings**:
   - **Webhook URL**: `https://your-app.vercel.app/api/webhooks/twilio-inbound`
   - **HTTP Method**: POST
   - **Message Status**: Enable status callbacks (optional)

### 3. Vercel Deployment

Add environment variables in Vercel dashboard:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `SEGMENT_WRITE_KEY`
4. Set scope to: Production, Preview, Development
5. Mark `TWILIO_AUTH_TOKEN` and `SEGMENT_WRITE_KEY` as sensitive

## Local Development

### Using ngrok

```bash
# Start Vercel dev server
npm run dev

# In another terminal, expose with ngrok
ngrok http 5173

# Copy ngrok URL (e.g., https://xxxx.ngrok.io)
# Update Twilio webhook to: https://xxxx.ngrok.io/api/webhooks/twilio-inbound
```

### Testing

1. Send RCS message to your Twilio number from your phone
2. Check terminal logs for webhook activity
3. Verify events appear in [Segment Debugger](https://app.segment.com)
4. Check ngrok inspector at http://127.0.0.1:4040

## Debugging

### Check Logs

**Vercel**:
- Dashboard → Functions → Logs
- Look for "Twilio webhook received" and "Segment event sent"

**Segment**:
- Source Debugger (real-time event stream)
- Verify `anonymousId` matches phone format: "+13304027149"

**Twilio**:
- Console → Monitor → Logs → Errors
- Check for 403 (signature validation) or timeout errors

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| 403 Forbidden | Signature validation failed | Check `TWILIO_AUTH_TOKEN` is correct |
| Events not in Segment | Wrong write key | Use server-side key, not client-side |
| Duplicate events | Webhook timeout | Keep handler fast, check logs |
| No webhook calls | Wrong URL | Verify URL in Twilio console |

## Security

- **Signature Validation**: Every webhook validates `X-Twilio-Signature` header
- **HTTPS Only**: Twilio requires HTTPS for webhooks
- **Environment Variables**: Credentials stored securely, never in code
- **Server-Side Only**: API functions not exposed to client-side code

## Identity Resolution

Events use phone number as `anonymousId` (not `userId`) because:
- Webhook only provides phone number, not email/user ID
- Segment merges events by matching phone across "Application Abandoned" and "RCS Message Received"
- Phone format: E.164 (e.g., "+13304027149")

## Next Steps

Once events flow to Segment:
1. Create Segment Journey triggered by "RCS Message Received"
2. Add conditions (check message body or button payload)
3. Trigger downstream action (Voice AI call, email, etc.)
4. View unified candidate journey in Segment

## Reference

- [Twilio Webhooks Docs](https://www.twilio.com/docs/usage/webhooks)
- [Segment Server-Side SDK](https://segment.com/docs/connections/sources/catalog/libraries/server/node/)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
