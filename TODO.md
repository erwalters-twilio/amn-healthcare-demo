# AMN Healthcare Demo - TODO List

**Updated**: July 6, 2026

---

## 🟡 HIGH PRIORITY (This Week)

### 1. Configure Voice Call Trigger in Segment Journey
**Owner**: **Pranita**  
**Priority**: HIGH - Simple voice call integration
**Guide**: See `SIMPLE_VOICE_SETUP.md`

**Action**:
- [ ] Create Segment Journey: "RCS Message Received" → Voice Call
- [ ] Trigger: ANY RCS reply (no keyword filtering)
- [ ] Action: Webhook to Twilio Voice API OR Segment Function
- [ ] Map phone number to voice call destination

### 2. Create TwiML Endpoint for AI Agent
**Owner**: **Eric**  
**Priority**: HIGH - Required for voice call routing

**Action**:
- [ ] Create `/api/voice/twiml.js` endpoint in Vercel
- [ ] Endpoint accepts phone number parameter
- [ ] Returns TwiML connecting to AI agent
- [ ] Deploy and test endpoint

### 3. Configure AI Agent with Segment Profile Access
**Owner**: **Pranita**  
**Priority**: HIGH - AI needs context for personalization

**Action**:
- [ ] Get Segment Profile API token (read access)
- [ ] Configure AI agent to fetch profile by phone number
- [ ] Update AI agent system prompt with profile data:
  - Candidate name
  - Job applied for
  - Application ID
  - Abandonment step
- [ ] Test: AI can fetch and use profile data

### 4. Test Voice Call Flow End-to-End
**Owner**: **Both**

**Action**:
- [ ] Reply to RCS message (any text)
- [ ] Voice call initiated within 10 seconds
- [ ] AI agent greets candidate by name
- [ ] AI references specific job they applied for
- [ ] Call feels personalized, not cold start
- [ ] Verify in logs: Segment Journey → Twilio Call → AI Agent

---

## ⏳ LATER (After Basic Voice Call Working)

### 5. Add Twilio Conversations for RCS History
**Owner**: **Pranita**  
**Priority**: Medium - Enhanced context for AI agent

**Why**: Currently AI only sees Segment profile. Adding Conversations gives AI access to RCS message history during the call.

**Action**:
- [ ] Enable Twilio Conversations API
- [ ] Configure Segment to use Conversations (not just Messaging)
- [ ] Store conversation attributes (application_id, etc.)
- [ ] Update AI agent to fetch RCS message history
- [ ] Test: AI references RCS conversation during voice call

### 6. Link Application ID to RCS Interactions
**Owner**: **Both**  
**Priority**: Low - Nice to have for demo

**Action**:
- [ ] Decide on approach (Conversation attributes vs database)
- [ ] Implement chosen approach
- [ ] Update webhook to include application_id in Segment events

---

## 📅 LATER (Phase 3)

### 7. Build Recruiter Dashboard
**Owner**: **Eric + Pranita**  
**Timeline**: 1-2 weeks  
**Priority**: Medium (demo works without it)

**What to Build**:
- [ ] Candidate list view
- [ ] Candidate detail page with timeline
- [ ] Backend API to fetch Segment data
- [ ] Display RCS conversation history
- [ ] Show application context
- [ ] Real-time updates (optional)

**Design Decisions Needed**:
- Separate app or add to existing?
- Authentication approach?
- Data sources (Segment only? Twilio Conversations API?)

---

## ✅ DONE

- [x] Frontend demo app (abandonment tracking)
- [x] Segment event pipeline configured
- [x] RCS messages sending (Segment → Twilio destination working)
- [x] Webhook handler code written & deployed
- [x] Webhook handler configured in Twilio
- [x] RCS interactions tracked in Segment ("RCS Message Received" events)
- [x] Documentation created (WEBHOOK_SETUP.md, TESTING.md)

---

## 📋 Quick Reference

**Key Documents**:
- `PROGRESS_LOG.md` - Full status, detailed next steps
- `QUICK_START.md` - 5-minute setup overview
- `WEBHOOK_SETUP.md` - Step-by-step webhook config
- `TESTING.md` - How to test everything

**URLs**:
- Vercel: https://vercel.com/dashboard
- Twilio: https://console.twilio.com
- Segment: https://app.segment.com

**Contacts**:
- Pranita: Segment destinations, Twilio config, RCS issues
- Eric: Webhook deployment, testing, dashboard dev

---

## 🎯 This Week's Goal

Get complete flow working:
```
Abandon App → RCS Sent → Candidate Replies → Segment Event → Voice Call Triggered
```

**Current Status**: Step 4 of 5 (RCS interactions tracking ✅, now setting up voice calls with AI agent context)
