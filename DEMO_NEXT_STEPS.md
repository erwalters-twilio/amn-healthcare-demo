# Demo Next Steps - Recruiter Context Dashboard

## Current State (Phase 1) ✅

**Flow**: Web abandonment → Segment → RCS message  
**What Works**: Application Abandoned event triggers RCS to candidate

---

## Phase 2: Multi-Channel Conversation Tracking

### Objective
Build recruiter dashboard showing complete candidate context across all channels using Twilio Conversations APIs.

### Data Sources to Integrate

1. **Segment Customer Data**
   - Application form data (name, email, phone, profession)
   - Behavioral events (pages viewed, CTAs clicked)
   - Abandonment context (what step, when)

2. **Twilio Conversation Memory**
   - Observations from AI agent interactions
   - Summaries of conversation threads
   - Key insights extracted across channels

3. **Twilio Conversations Object**
   - Full transcript across channels (RCS → SMS → Voice)
   - Message history with timestamps
   - Channel transition points

### Channel Flow

```
Web Abandonment → RCS Message → Candidate Replies → AI Agent Chat → Outbound Call
                                                                         ↓
                                                            Recruiter sees full context
```

---

## What to Build

### 1. Conversation Memory Integration
**API**: Twilio Conversations - Conversation Memory  
**Pull**:
- Observations (candidate preferences, concerns, questions)
- Summaries (conversation topic summaries per channel)
- Memory state (what AI agent knows about candidate)

### 2. Cross-Channel Transcript View
**API**: Twilio Conversations - Messages API  
**Display**:
- Complete message history (RCS + SMS + Voice transcripts)
- Channel indicators (which message came from where)
- Timestamps and user/agent labels
- Read receipts and delivery status

### 3. Recruiter Context Dashboard (UI)
**Purpose**: Show recruiter everything before they call

**Sections**:
- **Candidate Profile** (from Segment)
  - Name, email, phone
  - Profession: Nursing - NICU
  - Application status: Abandoned at document upload
  - When: 2 hours ago

- **Behavioral Context** (from Segment)
  - Jobs viewed: NICU RN - Littleton, CO
  - Time on site: 4 minutes
  - Pages visited: Home → Search → Job Detail → Apply

- **Conversation Summary** (from Conversation Memory)
  - AI Agent observations
  - Key topics discussed
  - Candidate concerns/questions
  - Readiness score

- **Full Transcript** (from Conversations API)
  - RCS: "Hi Sarah, we noticed you started..."
  - Sarah: "I don't have my license handy"
  - AI Agent: "No problem! What questions do you have?"
  - [Entire back-and-forth visible]

- **Call Trigger**
  - When: After candidate provides enough info via RCS
  - Why: Recruiter needed to close the deal
  - Next action: Outbound call with full context

---

## Technical Requirements

### APIs to Research

1. **Twilio Conversations API**
   - `GET /Conversations/{Sid}/Messages` - Full transcript
   - `GET /Conversations/{Sid}/Participants` - Who's in conversation
   - `GET /Conversations/{Sid}` - Conversation metadata

2. **Twilio Conversation Memory API** (NEW)
   - Memory storage format
   - How to query observations
   - How to retrieve summaries
   - Cross-channel memory persistence

3. **Segment Profiles API**
   - `GET /profiles/{user_id}` - Pull user traits
   - `GET /events?userId={id}` - Query user events

### Integration Points

```
┌─────────────────┐
│   Segment       │ → User profile + events
└─────────────────┘
         ↓
┌─────────────────┐
│ Recruiter UI    │ ← Displays unified context
└─────────────────┘
         ↑
┌─────────────────┐
│ Twilio Conv API │ → Transcript + Memory
└─────────────────┘
```

---

## Implementation Steps

### Step 1: Understand Twilio Conversations
- [ ] Read Conversations API docs
- [ ] Understand Conversation Memory model
- [ ] Test creating conversation with memory
- [ ] Test cross-channel message flow (RCS → SMS → Voice)

### Step 2: Build Data Aggregation Layer
- [ ] Fetch Segment profile data via API
- [ ] Fetch Segment behavioral events
- [ ] Fetch Twilio conversation transcript
- [ ] Fetch Twilio conversation memory (observations/summaries)
- [ ] Combine into single candidate context object

### Step 3: Build Recruiter Dashboard UI
- [ ] Design layout (candidate profile + timeline + transcript)
- [ ] Display Segment data (application + behavior)
- [ ] Display Conversation Memory (observations + summaries)
- [ ] Display full transcript with channel labels
- [ ] Add "Ready to Call" indicator

### Step 4: Orchestrate Call Trigger
- [ ] Define "enough information" criteria
- [ ] Trigger outbound call from Segment/Twilio
- [ ] Pass conversation context to recruiter screen
- [ ] Display context BEFORE call connects

---

## Demo Story

**Recruiter View**:

1. **Dashboard shows**: Sarah Johnson - Application Abandoned 2hrs ago
2. **Click candidate**: Full context loads
   - Applied for: NICU RN - $44-47/hr
   - Viewed job for 2 minutes
   - Abandoned at: Document upload
   - RCS sent: "Hi Sarah, we noticed..."
   - Sarah replied: "I don't have license handy"
   - AI Agent: [3 message exchange showing she's interested but needs help]
3. **System triggers**: "Ready to Call" - Sarah provided enough info
4. **Recruiter clicks "Call"**: Outbound call initiated
5. **Recruiter sees**: Full context on screen during call
6. **Recruiter speaks**: "Hi Sarah, I see you're interested in the NICU position in Littleton and had a question about the license upload..."

**Result**: Recruiter has complete context, conversation feels personal and informed

---

## Questions to Answer

1. How is Conversation Memory structured in Twilio?
2. How do we query observations vs summaries?
3. Does memory persist across channel changes (RCS → Voice)?
4. Can we inject Segment data into Conversation Memory?
5. What triggers "ready for call" - AI agent decision or business logic?
6. How do we display live transcript during active call?

---

## Tech Stack Options

**Backend**:
- Node.js API (Express)
- Twilio SDK for Conversations
- Segment SDK for profile/events
- Store aggregated context in memory/Redis

**Frontend** (Recruiter Dashboard):
- React + Vite (reuse AMN demo setup)
- Real-time updates (WebSockets or polling)
- Timeline UI component for transcript
- Profile card component for candidate data

**Deployment**:
- Backend: Vercel Serverless Functions or Heroku
- Frontend: Vercel (same as current demo)

---

## Success Metrics

- ✅ Recruiter sees complete candidate context in <2 seconds
- ✅ Transcript shows all channels (RCS, SMS, Voice) unified
- ✅ Conversation Memory displays observations and summaries
- ✅ Call trigger happens automatically when candidate is "ready"
- ✅ Demo tells complete story: Web → RCS → AI Chat → Recruiter Call

---

## File Structure

```
/amn-demo-phase2
  /backend
    - server.js (API aggregation layer)
    - segment.js (fetch profile + events)
    - twilio.js (fetch conversation + memory)
  /frontend
    - RecruiterDashboard.jsx
    - CandidateProfile.jsx
    - ConversationTimeline.jsx
    - TranscriptView.jsx
  /docs
    - TWILIO_CONVERSATIONS_API.md
    - CONVERSATION_MEMORY_GUIDE.md
```

---

## Next Immediate Actions

1. **Research**: Deep dive into Twilio Conversations API + Memory
2. **Prototype**: Build simple API that fetches conversation transcript
3. **Mock Data**: Create sample conversation with observations/summaries
4. **UI Mockup**: Design recruiter dashboard layout
5. **Demo Script**: Update with Phase 2 flow

---

## Timeline Estimate

- **Week 1**: Research Twilio APIs, prototype data fetching
- **Week 2**: Build aggregation layer (Segment + Twilio)
- **Week 3**: Build recruiter dashboard UI
- **Week 4**: Integration testing, demo refinement

---

## Current Demo → Phase 2 Demo

**Current**: "Candidate abandons → Gets RCS"  
**Phase 2**: "Candidate abandons → Gets RCS → Chats with AI → Recruiter calls with full context displayed"

**New Value Prop**: Recruiter walks into every call with complete candidate journey visible on screen
