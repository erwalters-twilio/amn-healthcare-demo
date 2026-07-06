# AMN Healthcare Demo - Progress Log

**Last Updated**: July 6, 2026  
**Status**: Phase 1 Implementation In Progress

---

## 🎯 Project Overview

Building a multi-channel recruitment flow that demonstrates:
1. Web application abandonment tracking
2. RCS re-engagement messaging
3. AI-powered conversation
4. Voice call with full candidate context
5. Recruiter dashboard showing unified timeline

---

## ✅ What's Been Built (Complete)

### Phase 1A: Frontend Demo Application ✅
**Status**: Deployed & Working

**What It Does**:
- Candidate browses jobs, fills out application form
- "Save & Finish Later" button triggers abandonment event
- Sends "Application Abandoned" event to Segment with:
  - Email, phone, name, profession
  - Application ID, abandonment step, timestamp
  - Form data (discipline, specialty)

**Files**:
- `/amn-demo/src/pages/DocumentUploadPage.jsx` - Abandonment trigger
- `/amn-demo/src/utils/analytics.js` - Segment tracking
- Full React + Vite application

**URL**: (Deployed on Vercel)

**✅ Verified Working**:
- Form submission works
- Abandonment event appears in Segment Debugger
- Phone numbers normalized to E.164 format

---

### Phase 1B: Segment Event Pipeline ✅
**Status**: Configured & Receiving Events

**What It Does**:
- Receives "Application Abandoned" from frontend
- Stores event with user profile (email + phone)
- Forwards to Twilio destination for RCS messaging

**✅ Verified Working**:
- Events appear in Segment Debugger
- User profile created with contact info
- Journey configured and RCS messages sending successfully

---

### Phase 1C: RCS Webhook Handler ✅
**Status**: Deployed & Working

**What It Does**:
- Vercel serverless function at `/api/webhooks/twilio-inbound`
- Receives webhooks from Twilio when candidate replies to RCS
- Validates Twilio signature for security
- Detects interaction type:
  - Text replies
  - Button clicks
  - List selections
- Sends events to Segment:
  - "RCS Message Received" (text replies)
  - "RCS Card Interaction" (button clicks)
- Uses phone number as `anonymousId` for identity stitching

**Files**:
- `/amn-demo/api/webhooks/twilio-inbound.js` - Webhook handler (254 lines)
- `/amn-demo/WEBHOOK_SETUP.md` - Setup instructions
- `/amn-demo/TESTING.md` - Testing guide

**Code Status**: ✅ Written, ✅ Committed, ✅ Pushed to GitHub

**Deployment Status**: ✅ Deployed to Vercel

**Testing Status**: ✅ Verified working - events appearing in Segment

---

## 🚧 What Needs to Be Built Next

### 🟡 HIGH PRIORITY: AI Voice Call Integration
**Status**: Ready to Start

**What's Needed**:
Phase 2 implementation to trigger AI voice calls when candidates respond to RCS messages.

**Requirements**:
1. **Twilio Conversations Setup**:
   - Enable Conversations API for RCS messages
   - Store conversation history for AI agent access
   - Configure Segment to use Conversations API

2. **Segment Journey for Voice Trigger**:
   - Detect "RCS Message Received" events
   - Filter for trigger conditions (keywords, buttons, etc.)
   - Initiate Twilio Voice call with context

3. **AI Agent Context Integration**:
   - Pass Segment Profile data to AI agent
   - Pass Twilio Conversation SID for message history
   - Configure agent to reference conversation context

**Owner**: **Pranita + Eric**

**Next Steps**: See "Step 1" below for detailed instructions

---

## 📋 What Still Needs to Be Built

### Phase 2: Voice Call Integration
**Status**: Not Started

**What Needs to Happen**:
When candidate replies to RCS with interest, trigger outbound voice call

**Requirements**:
1. **Segment Journey Configuration**:
   - Trigger: "RCS Message Received" event
   - Condition: Check message body for keywords ("interested", "call me", etc.) OR button click
   - Action: Send to Twilio Voice destination

2. **Twilio Voice Configuration**:
   - Set up Voice API integration
   - Configure outbound call destination
   - Pass candidate phone number
   - Optionally pass conversation context to AI agent

3. **AI Agent Integration** (if not already configured):
   - Twilio AI Agent or custom Voice integration
   - Agent has access to candidate context
   - Agent can reference RCS conversation

**Owner**: TBD (Eric + Pranita)

**Dependencies**: 
- ✅ Segment receiving "RCS Message Received" events (will be true after blockers fixed)
- Need to design voice call trigger logic
- Need Twilio Voice API credentials

---

### Phase 3: Recruiter Dashboard
**Status**: Not Started

**What It Should Show**:
Recruiter sees complete candidate context before/during call:

1. **Candidate Profile** (from Segment):
   - Name: Sarah Johnson
   - Email: sarah.johnson@example.com
   - Phone: +13304027149
   - Profession: Nursing - Neonatal Intensive Care (NICU)
   - Application status: Abandoned at document upload
   - Abandonment time: 2 hours ago

2. **Behavioral Context** (from Segment):
   - Jobs viewed: NICU RN - Littleton, CO
   - Time on site: 4 minutes
   - Pages visited: Home → Search → Job Detail → Apply → Documents
   - Abandonment step: Document upload page

3. **Conversation Timeline** (from Segment events):
   - ✉️ RCS sent: "Hi Sarah, we noticed you started..." (2:30 PM)
   - 💬 Sarah replied: "I don't have my license handy" (2:35 PM)
   - 💬 AI Agent: "No problem! What questions do you have?" (2:35 PM)
   - 💬 Sarah: "Is the position still available?" (2:36 PM)
   - 💬 AI Agent: "Yes! Would you like to schedule a call?" (2:36 PM)
   - 📞 Call triggered: Ready for recruiter (2:37 PM)

4. **Full Transcript** (future - Phase 3B):
   - Complete RCS message history with timestamps
   - Message delivery status (delivered, read)
   - Voice call transcript (if AI agent used)
   - All channels unified in one view

**Tech Stack**:
- Frontend: React + Vite (reuse existing setup)
- Backend API: Vercel serverless functions or separate Node.js API
- Data Sources:
  - Segment Profiles API (candidate data + events)
  - Twilio Conversations API (message transcript - Phase 3B)
  - Twilio Conversation Memory API (AI observations - Phase 3B)

**Owner**: TBD (Eric + Pranita)

**Dependencies**: 
- Segment events flowing (Application Abandoned, RCS Message Received)
- APIs for data fetching (Segment Profiles API, Twilio Conversations API)

---

## 🎯 Next Steps (Prioritized)

### Step 1: Set Up Twilio Conversations for RCS
**Owner**: **Pranita**  
**Estimated Time**: 1-2 hours  
**Status**: 🟡 READY TO START

**Why This Matters**:
For the AI agent to have context during voice calls, we need to store RCS conversation history in Twilio Conversations (not just send standalone messages). This allows the AI agent to reference what was discussed in RCS when the voice call happens.

**Action Items**:

#### 1A. Enable Conversations API in Twilio

1. Go to [Twilio Console → Conversations](https://console.twilio.com/us1/develop/conversations)
2. If not enabled, click **"Enable Conversations"**
3. Note: Conversations API may have different pricing than Messaging API

#### 1B. Configure Segment to Use Conversations API

Currently, Segment is probably using the **Messaging API** (standalone messages). We need to switch to **Conversations API** so messages are part of a persistent conversation.

**Option A: Use Twilio Conversations Destination (if available in Segment)**
1. Go to Segment → Connections → Destinations
2. Check if "Twilio Conversations" destination exists (different from "Twilio" destination)
3. If yes, configure it:
   - Add destination credentials
   - Map event to "Create Conversation" and "Send Message"
   - Include conversation attributes (application_id, name, etc.)

**Option B: Update Existing Twilio Destination Mapping**
If Conversations destination doesn't exist, update the current Twilio destination to use Conversations API endpoints:

In your Segment Journey action or Twilio destination mapping, look for an option to:
- Create/use a Conversation
- Set conversation attributes
- Send message within conversation

**Option C: Use Segment Functions (if needed)**
If the UI doesn't support Conversations API, we can create a Segment Function that:
1. Receives "Application Abandoned" event
2. Calls Twilio Conversations API to create/update conversation
3. Sends RCS message within that conversation
4. Stores attributes (application_id, name, etc.)

Let me know which option applies and I can provide specific instructions.

#### 1C. Test Conversation Creation

1. Abandon an application on the demo site
2. Check Twilio Console → Conversations
3. Verify a conversation was created
4. Check conversation attributes include application_id, name, etc.
5. Verify RCS message was sent within that conversation

#### 1D. Verify Webhook Receives ConversationSid

1. Reply to the RCS message
2. Check Vercel logs: `vercel logs amn-demo.vercel.app --since 5m`
3. Look for log: `"Twilio webhook received: { ... ConversationSid: ... }"`
4. Verify ConversationSid is not null

**Success Criteria**:
- [x] Conversations API enabled in Twilio
- [ ] Segment sends RCS messages via Conversations API (not Messaging API)
- [ ] Each candidate has a persistent Conversation object
- [ ] Conversation attributes include application_id and candidate data
- [ ] Webhook receives ConversationSid when candidate replies
- [ ] Conversation history is accessible via Twilio API

---

### Step 2: Configure Voice Call Trigger in Segment
**Owner**: **Eric**  
**Estimated Time**: 30 minutes  
**Status**: 🟡 READY TO START (RCS sending is now working)

**Action Items**:
- [ ] Configure Vercel environment variables
- [ ] Verify automatic deployment completed
- [ ] Get production webhook URL
- [ ] Configure Twilio webhook URL
- [ ] Test webhook receives calls

**Detailed Instructions**:

#### 2A. Configure Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: `amn-healthcare-demo`
3. Go to: Settings → Environment Variables
4. Add these 3 variables (for all environments: Production, Preview, Development):

   ```
   TWILIO_ACCOUNT_SID = YOUR_TWILIO_ACCOUNT_SID
   TWILIO_AUTH_TOKEN = YOUR_TWILIO_AUTH_TOKEN (mark as Sensitive)
   SEGMENT_WRITE_KEY = VB0zy4MuVUb84Z32g1fw3YZ7FLViZr3J (mark as Sensitive)
   ```

5. Save variables

#### 2B. Verify Deployment

Vercel should have automatically deployed after the `git push`. Check:

1. Go to: Vercel Dashboard → Deployments tab
2. Look for deployment from commit `edf0465` ("Add RCS webhook integration")
3. Verify status: ✅ Ready
4. Copy production URL (e.g., `https://amn-healthcare-demo.vercel.app`)

If deployment hasn't started:
```bash
cd /Users/ericwalters/Documents/clients/amn-new/amn-demo
vercel --prod
```

#### 2C. Get Webhook URL

Your webhook URL will be:
```
https://[your-vercel-app].vercel.app/api/webhooks/twilio-inbound
```

Copy this URL - you'll need it for Twilio configuration.

#### 2D. Configure Twilio Webhook

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to: **Messaging** → **Services** → [Your Messaging Service]
3. Scroll to: **Inbound Settings**
4. Set:
   - **Webhook URL**: `https://[your-app].vercel.app/api/webhooks/twilio-inbound`
   - **HTTP Method**: `POST`
   - **Fallback URL**: (optional) same URL for redundancy
5. Click **Save**

#### 2E. Test Webhook

**Method 1: Send Test Message**

1. Reply to RCS message from your phone
2. Check Vercel function logs:
   - Go to: Vercel Dashboard → Functions → `/api/webhooks/twilio-inbound`
   - Look for log: "Twilio webhook received"
3. Check Segment Debugger:
   - Go to: Segment → Sources → [Your Source] → Debugger
   - Look for event: "RCS Message Received"
   - Verify `anonymousId` is phone in format: "+13304027149"

**Method 2: Local Testing with ngrok** (if Method 1 fails)

```bash
# Terminal 1: Start dev server
cd /Users/ericwalters/Documents/clients/amn-new/amn-demo
npm run dev

# Terminal 2: Start ngrok
ngrok http 5173

# Copy ngrok URL (e.g., https://xxxx.ngrok.io)
# Update Twilio webhook to: https://xxxx.ngrok.io/api/webhooks/twilio-inbound
# Send test message and watch terminal logs
```

**Success Criteria**:
- [ ] Webhook receives POST request from Twilio
- [ ] Signature validation passes (no 403 errors)
- [ ] "RCS Message Received" event appears in Segment Debugger
- [ ] Event `anonymousId` matches phone number format
- [ ] Twilio webhook returns 200 OK

**Troubleshooting**:
- If 403 Forbidden: Check `TWILIO_AUTH_TOKEN` matches console exactly
- If no events in Segment: Verify `SEGMENT_WRITE_KEY` is server-side key
- If no webhook calls: Verify URL in Twilio console is correct
- See `/amn-demo/TESTING.md` for detailed troubleshooting

---

### Step 2: Verify End-to-End Flow
**Owner**: **Eric + Pranita**  
**Estimated Time**: 30 minutes  
**Status**: ⏳ Waiting for Step 1

**Action Items**:
- [ ] Test complete flow from abandonment → RCS → reply → Segment
- [ ] Verify events are stitched correctly by phone number
- [ ] Document any issues found

**Test Procedure**:

1. **Abandon Application**:
   - Go to demo site
   - Fill out form with test phone number
   - Click "Save & Finish Later"
   - Check Segment: "Application Abandoned" event appears

2. **Receive RCS**:
   - Check phone for RCS message
   - Verify personalization (name, job info)
   - Note timestamp

3. **Reply to RCS**:
   - Send text reply (e.g., "I'm interested!")
   - OR click button on rich card (if applicable)

4. **Verify Webhook**:
   - Check Vercel logs: "Twilio webhook received"
   - Check Segment: "RCS Message Received" event appears
   - Verify `anonymousId` matches phone from abandonment event

5. **Verify Identity Stitching**:
   - In Segment Debugger, filter by phone number
   - Should see both events:
     - "Application Abandoned" (has email + phone)
     - "RCS Message Received" (has phone only)
   - Events should be linked to same user profile

**Success Criteria**:
- Complete flow works end-to-end
- Events appear in correct order with correct data
- Phone number format consistent across events
- No errors in Vercel or Twilio logs

---

### Step 3: Configure Voice Call Trigger
**Owner**: **Eric + Pranita**  
**Estimated Time**: 2-3 hours  
**Status**: ⏳ Waiting for Step 2

**Action Items**:
- [ ] Design trigger logic (what RCS replies trigger calls?)
- [ ] Configure Segment Journey step for Voice
- [ ] Set up Twilio Voice destination in Segment
- [ ] Test voice call delivery
- [ ] Pass candidate context to AI agent (if applicable)

**Design Decisions Needed**:

1. **What triggers a call?**
   - Option A: Any RCS reply (immediate engagement)
   - Option B: Specific keywords ("interested", "call me", "yes")
   - Option C: Button click on rich card ("Schedule a Call")
   - Option D: After X messages back-and-forth

2. **When to call?**
   - Immediately after trigger?
   - Delay (e.g., 5 minutes after last message)?
   - Business hours only?

3. **What context to pass?**
   - Phone number (required)
   - Candidate name
   - Job applied for
   - RCS conversation summary
   - Application abandonment reason

**Implementation Options**:

**Option 1: Segment Journey (Simpler)**
```
Trigger: "RCS Message Received"
Condition: properties.body contains "interested" 
           OR properties.button_payload = "schedule_call"
Action: Send to Twilio Voice destination
  - To: properties.phone
  - Custom data: name, job_id, conversation_summary
```

**Option 2: Segment Function (More Control)**
```javascript
// Custom JavaScript in Segment Functions
async function onTrack(event) {
  if (event.event !== 'RCS Message Received') return;
  
  // Check if message indicates interest
  const body = event.properties.body?.toLowerCase();
  const keywords = ['interested', 'call me', 'yes', 'schedule'];
  const isInterested = keywords.some(k => body.includes(k));
  
  if (isInterested || event.properties.button_payload === 'schedule_call') {
    // Fetch full candidate context from Segment Profiles API
    const profile = await fetchProfile(event.anonymousId);
    
    // Trigger Twilio Voice API call
    await twilioVoiceCall({
      to: event.properties.phone,
      context: {
        name: profile.traits.name,
        job: profile.traits.job_applied,
        rcs_messages: profile.events.filter(e => e.event === 'RCS Message Received')
      }
    });
  }
}
```

**Owner**: Discuss and decide together

---

### Step 4: Build Recruiter Dashboard (Phase 3)
**Owner**: **Eric + Pranita**  
**Estimated Time**: 1-2 weeks  
**Status**: ⏳ Waiting for Steps 1-3  
**Priority**: Lower (demo can work without this initially)

**What to Build**:

1. **New React App or Section**:
   - Separate dashboard at `/recruiter` route
   - Or standalone app
   - Lists active candidates with recent activity

2. **Candidate Detail View**:
   - Click candidate → Full context page
   - Shows all data listed in "Phase 3" section above

3. **Backend API**:
   - Fetch data from Segment Profiles API
   - Fetch events from Segment
   - Optionally: Fetch Twilio Conversations transcript (Phase 3B)
   - Aggregate into unified timeline

4. **Real-Time Updates** (optional):
   - WebSocket or polling to show live RCS replies
   - Update dashboard when new events come in

**Tech Decisions Needed**:
- Separate app or add to existing demo?
- Authentication (how do recruiters log in)?
- What APIs to use for data fetching?
- Real-time vs. polling vs. manual refresh?

**Owner**: Discuss and decide together

---

## 📊 Progress Summary

### Phase 1: RCS Interaction Tracking
| Component | Status | Owner | Notes |
|-----------|--------|-------|-------|
| Frontend demo | ✅ Complete | Eric | Deployed & working |
| Segment events | ✅ Complete | Eric | Events flowing |
| RCS sending | ✅ Complete | Pranita | Messages delivering successfully |
| Webhook handler code | ✅ Complete | Eric | Written, tested locally |
| Webhook deployed | 🟡 IN PROGRESS | **Eric** | Ready to deploy |
| Webhook tested | 🟡 Pending | **Eric** | After deployment |
| Identity stitching | 🟡 Pending | **Eric** | Verify after webhook live |

### Phase 2: Voice Call Integration
| Component | Status | Owner | Notes |
|-----------|--------|-------|-------|
| Trigger logic design | ⏳ Not Started | Both | Needs discussion |
| Segment Journey config | ⏳ Not Started | Pranita | After trigger defined |
| Twilio Voice setup | ⏳ Not Started | Pranita | API credentials + config |
| Test voice delivery | ⏳ Not Started | Both | End-to-end test |

### Phase 3: Recruiter Dashboard
| Component | Status | Owner | Notes |
|-----------|--------|-------|-------|
| Design decisions | ⏳ Not Started | Both | What to show, how to build |
| Backend API | ⏳ Not Started | Eric | Data aggregation layer |
| Frontend UI | ⏳ Not Started | Eric | React dashboard |
| Segment API integration | ⏳ Not Started | Both | Fetch profiles + events |
| Twilio Conversations API | ⏳ Not Started | Both | Full transcript (Phase 3B) |

---

## 🎯 Critical Path to Demo

**To have a working demo, we need**:

1. ✅ Frontend abandonment tracking (DONE)
2. ✅ Segment event pipeline (DONE)
3. ✅ RCS messages sending (DONE)
4. 🟡 Webhook handler deployed (IN PROGRESS - Eric)
5. 🟡 Webhook receiving RCS replies (Pending - Eric)
6. 🟡 Events in Segment (Pending - Eric)
7. ⏳ Voice call trigger (Not Started - Both)

**We can demo without**:
- Recruiter dashboard (Phase 3) - can show Segment debugger instead
- Full conversation transcript - can show event list
- AI agent integration - can use simple voice call

---

## 📁 Key Files Reference

### Code
- `/amn-demo/api/webhooks/twilio-inbound.js` - Webhook handler
- `/amn-demo/src/pages/DocumentUploadPage.jsx` - Abandonment trigger
- `/amn-demo/src/utils/analytics.js` - Segment tracking

### Configuration
- `/amn-demo/.env` - Local environment variables (DO NOT COMMIT)
- `/amn-demo/.env.example` - Template for environment variables
- `/amn-demo/package.json` - Dependencies

### Documentation
- `/QUICK_START.md` - 5-minute setup guide
- `/amn-demo/WEBHOOK_SETUP.md` - Webhook configuration steps
- `/amn-demo/TESTING.md` - Testing procedures
- `/IMPLEMENTATION_SUMMARY.md` - What was built today
- `/PROGRESS_LOG.md` - THIS FILE

### Planning
- `/DEMO_NEXT_STEPS.md` - Phase 2 & 3 vision
- `/.claude/plans/okay-i-think-the-sprightly-peach.md` - Implementation plan

---

## 📞 Who to Talk To

**Pranita**:
- Segment destination configuration
- Twilio RCS sender setup
- RCS message not sending issue
- Twilio Voice API integration (Phase 2)
- Segment Journeys configuration

**Eric**:
- Webhook handler deployment
- Vercel configuration
- Testing and debugging
- Recruiter dashboard development (Phase 3)
- Backend API development

---

## 🗓️ Current Sprint (Week of July 6)

### Immediate Priority
1. **Eric**: Deploy webhook handler (READY TO START)
   - Add Vercel env vars
   - Configure Twilio webhook URL
   - Test end-to-end

2. **Both**: Verify complete flow
   - Test abandonment → RCS → reply → Segment
   - Check identity stitching
   - Document any issues

### This Week
3. **Both**: Plan voice call trigger
   - Decide on trigger logic
   - Design Segment Journey
   - Plan implementation

4. **Pranita**: Implement voice call integration
   - Configure Segment Journey
   - Set up Twilio Voice destination
   - Test delivery

---

## ✅ Definition of Done (Phase 1)

Phase 1 is complete when:
- [x] Candidate abandons application → "Application Abandoned" in Segment
- [x] RCS message sent to candidate
- [ ] Candidate replies to RCS → Webhook called
- [ ] Webhook validated signature → Event sent to Segment
- [ ] "RCS Message Received" appears in Segment Debugger
- [ ] Events stitched by phone number in Segment
- [ ] No errors in Vercel logs
- [ ] No errors in Twilio logs

**Current Progress**: 2/8 complete (25%) - Ready to deploy webhook handler

---

**Last Updated**: July 6, 2026  
**Next Update**: After webhook deployment and testing
