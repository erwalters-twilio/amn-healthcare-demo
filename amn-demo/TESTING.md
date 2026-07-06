# Testing RCS Webhook Integration

This guide covers testing the RCS webhook handler locally and in production.

## Quick Test Checklist

Use this checklist to verify the integration works end-to-end:

- [ ] Dependencies installed (`npm install` completed)
- [ ] Environment variables configured (`.env` populated)
- [ ] Webhook deployed to Vercel
- [ ] Twilio webhook URL configured
- [ ] Test message sent and reply received
- [ ] Event appears in Segment Debugger
- [ ] Phone number format correct ("+13304027149")
- [ ] No errors in Vercel function logs

## Local Testing

### Setup

1. **Start dev server**:
   ```bash
   cd amn-demo
   npm run dev
   ```

2. **Start ngrok** (in separate terminal):
   ```bash
   ngrok http 5173
   ```

3. **Copy ngrok URL**:
   ```
   https://xxxx-xx-xx-xx-xx.ngrok-free.app
   ```

4. **Update Twilio webhook**:
   - Go to Twilio Console → Messaging → Services
   - Set webhook URL: `https://xxxx.ngrok.io/api/webhooks/twilio-inbound`
   - Method: POST

### Test 1: Basic Text Reply

1. Send RCS message from your Twilio number to your phone
2. Reply with any text (e.g., "I'm interested!")
3. Watch terminal logs for:
   ```
   Twilio webhook received: {
     MessageSid: 'SMxxxxx',
     From: '+13304027149',
     hasButtonPayload: false
   }
   Segment event sent: RCS Message Received
   ```
4. Check ngrok inspector at http://127.0.0.1:4040:
   - Request path: `/api/webhooks/twilio-inbound`
   - Status code: 200
   - Response: `<Response></Response>`

### Test 2: Button Click (Rich Card)

If your RCS message includes buttons:

1. Click button on RCS message
2. Watch terminal logs for:
   ```
   Twilio webhook received: {
     MessageSid: 'SMxxxxx',
     From: '+13304027149',
     hasButtonPayload: true
   }
   Segment event sent: RCS Card Interaction
   ```

### Test 3: Signature Validation

Test that invalid signatures are rejected:

1. Send request with wrong signature using curl:
   ```bash
   curl -X POST https://xxxx.ngrok.io/api/webhooks/twilio-inbound \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -H "X-Twilio-Signature: invalid_signature" \
     -d "MessageSid=SM123&From=%2B13304027149&Body=test"
   ```

2. Should return 403 Forbidden:
   ```
   {"error":"Invalid signature"}
   ```

## Production Testing

### Setup

1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Configure environment variables** in Vercel dashboard:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `SEGMENT_WRITE_KEY`

3. **Update Twilio webhook** to production URL:
   ```
   https://your-app-name.vercel.app/api/webhooks/twilio-inbound
   ```

### Test End-to-End Flow

**Step 1: Application Abandonment**
1. Open demo app: https://your-app.vercel.app
2. Fill out application form
3. Click "Save & Finish Later"
4. Verify "Application Abandoned" event in Segment Debugger

**Step 2: RCS Message Sent**
(Configured in Segment destination → Twilio)
1. Candidate receives RCS message on phone
2. Message includes personalized content (name, job info)

**Step 3: RCS Reply Captured**
1. Candidate replies to RCS message
2. Webhook receives POST from Twilio
3. "RCS Message Received" event sent to Segment
4. Event merged with "Application Abandoned" by phone number

**Step 4: Verify in Segment**
1. Go to Segment Debugger
2. Look for "RCS Message Received" event
3. Check `anonymousId`: "+13304027149"
4. Verify `properties.phone` matches
5. Confirm timestamp is recent

## Segment Debugger Verification

### Event 1: RCS Message Received

Expected payload:
```json
{
  "anonymousId": "+13304027149",
  "event": "RCS Message Received",
  "properties": {
    "message_sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "from": "+13304027149",
    "to": "+15559876543",
    "body": "I'm interested!",
    "phone": "+13304027149",
    "num_media": 0,
    "channel": "rcs",
    "conversation_sid": null,
    "timestamp": "2026-07-03T14:35:12.000Z",
    "date": "2026-07-03",
    "time": "14:35:12",
    "unix": 1720013712
  },
  "timestamp": "2026-07-03T14:35:12.000Z"
}
```

**Verify**:
- ✅ `anonymousId` is E.164 format with country code
- ✅ `properties.phone` matches `anonymousId`
- ✅ `message_sid` starts with "SM"
- ✅ `timestamp` is ISO 8601 format
- ✅ `channel` is "rcs"

### Event 2: RCS Card Interaction

Expected payload:
```json
{
  "anonymousId": "+13304027149",
  "event": "RCS Card Interaction",
  "properties": {
    "message_sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "from": "+13304027149",
    "phone": "+13304027149",
    "interaction_type": "button_click",
    "button_payload": "schedule_call",
    "button_text": "Schedule a Call",
    "channel": "rcs",
    "timestamp": "2026-07-03T14:36:45.000Z",
    "date": "2026-07-03",
    "time": "14:36:45",
    "unix": 1720013805
  }
}
```

**Verify**:
- ✅ `interaction_type` is one of: "button_click", "list_selection", "location_share"
- ✅ `button_payload` or `list_item_id` populated (depending on type)
- ✅ All other fields match format above

## Vercel Function Logs

### Successful Request

```
Twilio webhook received: {
  MessageSid: 'SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  From: '+13304027149',
  To: '+15559876543',
  hasButtonPayload: false,
  hasListItem: false,
  timestamp: '2026-07-03T14:35:12.000Z'
}

Segment event sent: RCS Message Received {
  anonymousId: '+13304027149',
  messageSid: 'SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
}
```

### Failed Signature Validation

```
Invalid Twilio signature { url: 'https://...' }
```

### Segment Tracking Error

```
Failed to track RCS message: Error: Invalid write key
```

## Common Issues

### Issue: 403 Forbidden

**Symptom**: Webhook returns 403, logs show "Invalid Twilio signature"

**Cause**: Signature validation failed

**Fix**:
1. Verify `TWILIO_AUTH_TOKEN` in Vercel matches console
2. Ensure webhook URL exactly matches (including https://)
3. Check for URL encoding issues
4. Redeploy after updating env vars

**Test**:
```bash
# Verify auth token is set
vercel env ls
```

### Issue: Events Not in Segment

**Symptom**: Webhook succeeds but no events in Segment Debugger

**Cause**: Wrong write key or Segment API error

**Fix**:
1. Verify `SEGMENT_WRITE_KEY` is server-side key (NOT client-side)
2. Check Vercel logs for "Failed to track RCS message"
3. Test write key manually:
   ```bash
   curl -X POST https://api.segment.io/v1/track \
     -H "Content-Type: application/json" \
     -u YOUR_WRITE_KEY: \
     -d '{
       "anonymousId": "test",
       "event": "Test Event",
       "properties": {"test": true}
     }'
   ```

### Issue: Phone Format Wrong

**Symptom**: Events in Segment but phone format inconsistent

**Cause**: Normalization logic not working

**Fix**:
1. Check webhook logs for `normalizedPhone` value
2. Should be: "+13304027149" (not "+1 (330) 402-7149")
3. Verify `normalizePhoneNumber()` function logic

**Test**:
```javascript
// In webhook handler, add log:
console.log('Phone normalization:', {
  original: From,
  normalized: normalizedPhone
});
```

### Issue: Duplicate Events

**Symptom**: Same message appears twice in Segment

**Cause**: Webhook timeout causing Twilio retry

**Fix**:
1. Webhook must respond in <15 seconds
2. Check Vercel logs for slow responses
3. Handler already returns 200 immediately (correct)
4. Use `MessageSid` to deduplicate in downstream systems

## Performance Benchmarks

Target response times:
- **Signature validation**: <50ms
- **Segment tracking**: <200ms
- **Total response time**: <500ms
- **Twilio timeout**: 15 seconds (max)

Check Vercel function logs for actual timing.

## Testing Checklist for Production Deploy

Before going live:

- [ ] Environment variables set in Vercel (Production scope)
- [ ] Webhook URL updated in Twilio console (production URL)
- [ ] Test message sent and reply received
- [ ] Event verified in Segment Debugger
- [ ] No errors in Vercel function logs
- [ ] Phone format verified (E.164: "+13304027149")
- [ ] Signature validation tested (rejected invalid signature)
- [ ] Integration tested with real abandonment flow
- [ ] Segment Journey configured (if applicable)

## Monitoring After Deploy

**Daily**:
- Check Vercel function invocation count
- Review error logs for failures
- Spot-check Segment for recent events

**Weekly**:
- Verify event volume matches message volume
- Check for any signature validation failures
- Review Twilio webhook error logs

**Monthly**:
- Audit Segment event schema consistency
- Review phone normalization edge cases
- Update dependencies if needed

## Next Steps After Testing

Once testing passes:

1. **Configure Segment Journey**:
   - Trigger: "RCS Message Received"
   - Condition: Check message content
   - Action: Next step in orchestration

2. **Add Monitoring**:
   - Set up Vercel alerts for function errors
   - Create Segment dashboard for RCS metrics

3. **Phase 2: Recruiter Dashboard**:
   - Fetch conversation data via Twilio API
   - Display full candidate timeline
   - Show RCS interaction history

---

**Testing Status**: Ready for local and production testing
