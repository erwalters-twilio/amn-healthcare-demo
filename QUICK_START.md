# Quick Start: RCS Webhook Integration

**5-Minute Setup Guide**

## Prerequisites

- [ ] Twilio account with RCS sender
- [ ] Segment workspace
- [ ] Vercel account

## Setup Steps

### 1. Get Credentials (2 min)

**Twilio** (https://console.twilio.com):
- Copy Account SID (starts with `AC`)
- Copy Auth Token (click to reveal)

**Segment** (https://app.segment.com):
- Navigate to: Sources → [Your Source] → Settings → API Keys
- Copy **server-side** Write Key (different from client-side key)

### 2. Configure Vercel (2 min)

1. Go to your Vercel project → Settings → Environment Variables
2. Add these 3 variables (all environments):
   ```
   TWILIO_ACCOUNT_SID = ACxxxxxxxx...
   TWILIO_AUTH_TOKEN = your_token (mark sensitive)
   SEGMENT_WRITE_KEY = your_key (mark sensitive)
   ```
3. Redeploy: `git push origin main`

### 3. Configure Twilio (1 min)

1. Go to: Messaging → Services → [Your Service]
2. Inbound Settings → Webhook URL:
   ```
   https://your-app.vercel.app/api/webhooks/twilio-inbound
   ```
3. Method: `POST`
4. Save

### 4. Test (2 min)

1. Send RCS message to candidate
2. Candidate replies
3. Check Segment Debugger for "RCS Message Received" event

✅ Done!

## Files Reference

- **Setup Guide**: `WEBHOOK_SETUP.md` (detailed instructions)
- **Testing**: `TESTING.md` (verification checklist)
- **Summary**: `IMPLEMENTATION_SUMMARY.md` (what was built)
- **Code**: `api/webhooks/twilio-inbound.js` (webhook handler)

## What This Does

```
Candidate replies to RCS
    ↓
Twilio webhook → Your serverless function
    ↓
Event sent to Segment (phone as anonymousId)
    ↓
Segment Journey triggered (next step)
```

## Event Schema

**RCS Message Received**:
```json
{
  "anonymousId": "+13304027149",
  "event": "RCS Message Received",
  "properties": {
    "phone": "+13304027149",
    "body": "I'm interested!",
    "message_sid": "SMxxxxx",
    "channel": "rcs"
  }
}
```

**RCS Card Interaction** (button clicks):
```json
{
  "anonymousId": "+13304027149",
  "event": "RCS Card Interaction",
  "properties": {
    "interaction_type": "button_click",
    "button_payload": "schedule_call",
    "button_text": "Schedule a Call"
  }
}
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 403 Forbidden | Check `TWILIO_AUTH_TOKEN` in Vercel |
| No events in Segment | Use server-side write key (not client-side) |
| Wrong phone format | Should be "+13304027149" (E.164) |
| No webhook calls | Verify URL in Twilio console |

## Monitoring

**Vercel Logs**: Dashboard → Functions → View logs  
**Segment Debugger**: Real-time event stream  
**Twilio Logs**: Console → Monitor → Logs → Errors

## Next Steps

1. **Create Segment Journey**:
   - Trigger: "RCS Message Received"
   - Condition: Check message body
   - Action: Next step in orchestration

2. **Phase 2: Recruiter Dashboard**:
   - Fetch conversation via Twilio API
   - Display candidate timeline
   - Show full context before call

## Need Help?

- Detailed setup: `WEBHOOK_SETUP.md`
- Testing guide: `TESTING.md`
- Technical docs: `api/webhooks/README.md`

---

**Status**: ✅ Code complete, ready for configuration
