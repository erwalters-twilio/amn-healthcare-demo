# AMN Healthcare Demo - Visual Roadmap

**Last Updated**: July 3, 2026

---

## 🗺️ Complete Journey Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CANDIDATE JOURNEY                           │
└─────────────────────────────────────────────────────────────────────┘

1. Browse Jobs           ✅ Working
   └─> View NICU RN position in Littleton, CO

2. Apply Online          ✅ Working
   └─> Fill form: Name, email, phone, profession

3. Start Documents       ✅ Working
   └─> Reach upload page, not ready to finish

4. Click "Save Later"    ✅ Working
   └─> Abandonment event sent to Segment

5. Receive RCS Message   🔴 BROKEN - Need to fix
   └─> "Hi Sarah, we saw you started applying..."

6. Reply to RCS          🟡 Code ready, not tested
   └─> "I'm interested but have questions"

7. AI Chat (optional)    ⏳ Future enhancement
   └─> Back-and-forth conversation

8. Voice Call            ⏳ Not built yet
   └─> Recruiter calls with full context

9. Continue Application  ⏳ Out of scope for demo
   └─> Complete process, get hired
```

---

## 🏗️ System Architecture

```
┌──────────────┐
│   Browser    │ Frontend React App (Vercel)
│  (Candidate) │ 
└──────┬───────┘
       │ 1. Application Abandoned Event
       ↓
┌──────────────┐
│   Segment    │ Analytics & Event Pipeline
│              │ ✅ Working
└──────┬───────┘
       │ 2. Forward to Twilio Destination
       ↓
┌──────────────┐
│   Twilio     │ RCS Messaging
│  (RCS Send)  │ 🔴 BROKEN - Not sending
└──────────────┘
       │ 3. RCS Message
       ↓
┌──────────────┐
│   Candidate  │ Receives & Replies
│    Phone     │ 
└──────┬───────┘
       │ 4. Inbound Reply
       ↓
┌──────────────┐
│   Twilio     │ Webhook Handler
│  (Webhook)   │ 🟡 Code ready, needs deploy
└──────┬───────┘
       │ 5. RCS Message Received Event
       ↓
┌──────────────┐
│   Segment    │ Receives interaction event
│              │ 🟡 Ready to receive
└──────┬───────┘
       │ 6. Trigger Voice Call (future)
       ↓
┌──────────────┐
│   Twilio     │ Outbound Voice Call
│   (Voice)    │ ⏳ Not built yet
└──────────────┘
       │ 7. Call with context
       ↓
┌──────────────┐
│  Recruiter   │ Dashboard with full timeline
│  Dashboard   │ ⏳ Not built yet (Phase 3)
└──────────────┘
```

---

## 📊 Phase Breakdown

### ✅ Phase 1A: Frontend Tracking (COMPLETE)
**Duration**: 1 day (completed earlier)  
**Status**: Deployed & working

```
[Frontend App] → [Segment] → [Events flowing]
```

**Deliverables**:
- React application with job search & apply flow
- Form with candidate data capture
- Abandonment tracking on "Save & Finish Later"
- Segment integration with proper event schema

---

### 🔴 Phase 1B: RCS Messaging (BLOCKED)
**Duration**: 1-2 hours (pending)  
**Status**: Configured but not working  
**Blocker**: Messages not sending from Segment → Twilio

```
[Segment] -X-> [Twilio] -X-> [Candidate Phone]
           Not working
```

**What's Needed**:
- Debug Segment destination
- Verify Twilio RCS sender
- Test message delivery
- **Owner**: Pranita

---

### 🟡 Phase 1C: Webhook Integration (READY TO DEPLOY)
**Duration**: 2-3 hours (pending)  
**Status**: Code complete, needs deployment  
**Dependency**: Phase 1B must work first

```
[Candidate Reply] → [Twilio Webhook] → [Vercel Function] → [Segment]
                     🟡 Code ready      🟡 Needs config
```

**What's Needed**:
- Add Vercel environment variables
- Deploy to production
- Configure Twilio webhook URL
- Test end-to-end
- **Owner**: Eric

---

### ⏳ Phase 2: Voice Integration (NOT STARTED)
**Duration**: 1-2 days  
**Status**: Design needed  
**Dependency**: Phase 1 fully working

```
[RCS Reply in Segment] → [Journey Condition] → [Twilio Voice] → [Recruiter Call]
 ⏳ Not started           ⏳ Needs design        ⏳ Not configured
```

**What's Needed**:
- Design trigger logic (what causes call?)
- Configure Segment Journey
- Set up Twilio Voice destination
- Test voice delivery
- Pass candidate context
- **Owners**: Eric + Pranita (joint design)

---

### ⏳ Phase 3: Recruiter Dashboard (NOT STARTED)
**Duration**: 1-2 weeks  
**Status**: Design needed  
**Priority**: Medium (demo works without it)

```
[Segment Profile API] ──┐
                        ├─→ [Backend API] → [React Dashboard] → [Recruiter View]
[Segment Events API] ───┤    ⏳ Not built    ⏳ Not built        ⏳ Not built
                        │
[Twilio Conversations] ─┘ (Phase 3B - future)
```

**What to Show**:
1. Candidate profile (name, email, phone, job)
2. Application context (abandonment step, time)
3. Behavioral data (pages viewed, time on site)
4. RCS conversation timeline
5. Full message transcript (Phase 3B)
6. "Ready to call" indicator

**What's Needed**:
- Design decisions (separate app? auth?)
- Backend API for data aggregation
- React UI for dashboard
- Segment Profiles API integration
- Real-time updates (optional)
- **Owners**: Eric + Pranita

---

## 🎯 Critical Path

**To Demo Phase 1** (RCS Interaction Tracking):

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│   FIX   │ →  │ DEPLOY  │ →  │  TEST   │ →  │  DEMO   │
│   RCS   │    │ WEBHOOK │    │  FLOW   │    │ WORKING │
│ Sending │    │ Handler │    │  E2E    │    │  PHASE1 │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
   🔴             🟡             🟡              Goal
 Pranita         Eric        Both            Success!
  1-2 hrs        2-3 hrs     1 hr
```

**To Demo Phase 2** (Voice Integration):

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ DESIGN  │ →  │  BUILD  │ →  │  TEST   │ →  │  DEMO   │
│ TRIGGER │    │ JOURNEY │    │  VOICE  │    │ WORKING │
│  LOGIC  │    │ + VOICE │    │  CALL   │    │ PHASE2  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
   ⏳             ⏳             ⏳              Goal
  Both         Pranita        Both          Success!
  1 day         1 day         1 day
```

**To Demo Phase 3** (Dashboard):

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ DESIGN  │ →  │ BACKEND │ →  │FRONTEND │ →  │  DEMO   │
│  UX +   │    │  API    │    │   UI    │    │ WORKING │
│ TECH    │    │  LAYER  │    │  BUILD  │    │ PHASE3  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
   ⏳             ⏳             ⏳              Goal
  Both           Eric          Eric          Success!
 2-3 days       3-4 days      3-4 days
```

---

## 📅 Timeline Estimate

### This Week
```
Day 1 (Today)     ✅ Webhook code complete
Day 2 (Tomorrow)  🔴 Fix RCS sending (Pranita)
                  🟡 Deploy webhook (Eric)
                  🟡 Test e2e flow (Both)
Day 3             ⏳ Design voice trigger (Both)
Day 4             ⏳ Build voice integration (Pranita)
Day 5             ⏳ Test voice (Both)
```

**Milestone**: Phase 1 + 2 complete by end of week

### Next Week
```
Week 2            ⏳ Design dashboard (Both)
                  ⏳ Build backend API (Eric)
                  ⏳ Build frontend UI (Eric)
Week 3            ⏳ Polish & test dashboard
                  ⏳ Integrate all phases
```

**Milestone**: Phase 3 complete, full demo ready

---

## 🎬 Demo Script (When Complete)

**Phase 1 Demo** (RCS Interaction Tracking):
```
1. Show demo site → Candidate abandons
2. Show Segment → "Application Abandoned" event
3. Show phone → RCS message received
4. Reply to RCS → "I'm interested"
5. Show Segment → "RCS Message Received" event
6. Show events stitched by phone number
```

**Phase 2 Demo** (Voice Integration):
```
1-6. (Same as Phase 1)
7. Show Segment Journey → Condition matched
8. Phone rings → Outbound call to recruiter
9. Recruiter answers → Has candidate context
```

**Phase 3 Demo** (Dashboard):
```
1-8. (Same as Phase 1 + 2)
9. Show recruiter dashboard → Candidate card appears
10. Click candidate → Full timeline visible
11. Show: Application data, RCS messages, call ready indicator
12. Recruiter clicks "Call" → Outbound call with context
```

---

## 🚦 Status Legend

- ✅ **Complete** - Working and tested
- 🟢 **In Progress** - Actively being worked on
- 🟡 **Blocked** - Ready but waiting on dependency
- 🔴 **Critical** - Blocking other work
- ⏳ **Not Started** - Future work

---

## 📞 Quick Contact

**Pranita** - Segment & Twilio Setup
- RCS sending issue (CRITICAL)
- Segment destinations
- Twilio configuration
- Voice integration

**Eric** - Development & Deployment
- Webhook deployment
- Testing & debugging
- Dashboard development
- Backend APIs

---

## 📚 Documentation Index

**Planning** (Big Picture):
- `ROADMAP.md` - This file (visual overview)
- `PROGRESS_LOG.md` - Detailed status & next steps
- `TODO.md` - Prioritized action items
- `DEMO_NEXT_STEPS.md` - Phase 2 & 3 vision

**Implementation** (How to Build):
- `QUICK_START.md` - 5-minute overview
- `WEBHOOK_SETUP.md` - Webhook configuration guide
- `TESTING.md` - Testing procedures
- `IMPLEMENTATION_SUMMARY.md` - What was built today

**Reference** (Technical Details):
- `/api/webhooks/README.md` - Webhook handler docs
- `/.claude/plans/*.md` - Detailed implementation plans

---

**Ready to resume work? Start with `PROGRESS_LOG.md` Step 1!**
