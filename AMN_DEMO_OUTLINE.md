# AMN Healthcare Demo Outline
**Goal:** Show how Twilio CDP + Communications Platform prevents candidate drop-off through intelligent, context-aware engagement across every touchpoint

## Demo Flow

### 1. Application Start (Web Property)
- Anonymous candidate begins job application
- Segment CDP collects behavioral data in real-time, builds unified profile
- Candidate enters identifying information, immediately enriches Segment profile

### 2. Abandonment Detection & Recovery
- Candidate abandons at document upload stage
- Segment detects abandonment event in real-time, triggers journey orchestration
- Automated RCS message sent via Twilio prompting cert upload

### 3. Multi-Channel Engagement
- Candidate uploads certs via RCS thread
- Candidate requests help in same RCS conversation
- Segment tracks interaction, triggers outbound AI voice call
- AI agent has full context from:
  - Segment behavioral profile
  - Twilio Conversations unified thread (RCS + Voice + SMS)

### 4. Human Handoff
- Candidate expresses interest in specific role during AI call
- Seamless transfer to recruiter with full context

### 5. Recruiter Dashboard
**Shows unified view from Twilio ecosystem:**
- All behavioral data and traits from Segment profile
- AI-generated conversation summaries across all channels
- Complete conversation thread (RCS, Voice, SMS)
- Real-time applicant journey status

### 6. Placement & Loop Closure
- Recruiter places candidate in role
- Segment captures placement event, closes journey loop
- Full funnel visibility from first touch to hire

## Key Differentiators
- Real-time profile enrichment across anonymous → identified states
- Journey orchestration triggered by behavioral events
- Unified conversation context across all channels
- Every touchpoint (AI agent, recruiter) has complete candidate history
- Closed-loop measurement from application to placement
