# AMN Recruiter Dashboard - Demo Flow

Complete demo flow showing how the dashboard fits into the AMN Healthcare CDP + Communications demo.

## 🎯 **Complete Demo Flow**

### **Step 4: Human Handoff** → **Recruiter Dashboard**

When the AI agent transfers the call to a recruiter, the dashboard is the critical touchpoint that shows unified context.

---

## 📊 **Dashboard in the Demo**

### **Scenario**
1. **Candidate** (Jessica Chen, `+13304027149`) is on call with AI agent
2. **AI Agent** detects candidate interest in specific role
3. **Transfer happens**: `Call Transferred to Recruiter` event sent to Segment
4. **Recruiter** receives the call with full context

### **What Happens Behind the Scenes**

```
┌─────────────────────────────────────────────────────────┐
│ 1. AI Agent Transfers Call                             │
│    ↓                                                     │
│ 2. Event sent to Segment:                              │
│    - Event: "Call Transferred to Recruiter"            │
│    - anonymousId: "+13304027149"                       │
│    ↓                                                     │
│ 3. Segment Destination Function triggers               │
│    ↓                                                     │
│ 4. Webhook calls dashboard backend                     │
│    POST /webhooks/segment                               │
│    ↓                                                     │
│ 5. Backend fetches unified data:                       │
│    - Segment Profile API (traits, events)              │
│    - Twilio Conversations API (RCS/Voice/SMS)          │
│    - Recall Memory API (AI insights)                   │
│    ↓                                                     │
│ 6. Recruiter searches: "+13304027149"                  │
│    ↓                                                     │
│ 7. Dashboard displays complete context instantly       │
└─────────────────────────────────────────────────────────┘
```

---

## 🖥️ **What Recruiter Sees**

### **Dashboard URL**
https://amn-recruiter-dashboard.vercel.app

### **Search & Load Profile**
1. Recruiter types: `+13304027149` or `13304027149`
2. Dropdown shows: **Jessica Chen** - ICU Nurse
3. Click to load full profile

### **Unified Profile View**

#### **Profile Section**
- **Name**: Jessica Chen
- **Specialty**: ICU
- **Experience**: 5 years
- **Location**: Cleveland, OH
- **Contact**: test.nurse@amnhealthcare.com
- **Status**: Active

#### **AI Insights** (from Recall Memory)
Real-time observations from AI agent conversations:
- "Candidate is interested in travel nursing positions in warm climates"
- "Has 5 years ICU experience"
- "Prefers 13-week assignments"
- "Available to start within 2 weeks"
- "Currently holds licenses in OH and CA"

#### **Conversation History** (from Twilio)
Complete thread across all channels:
- **RCS Messages**: Cert upload conversation
- **Voice Call**: AI agent transcript
- **SMS**: Follow-up messages

Each message shows:
- Timestamp
- Channel
- Full content
- Participant (AI Agent vs. Candidate)

#### **Activity Timeline** (from Segment)
- Application Started
- Document Upload Completed
- Abandonment Recovery (RCS sent)
- Call Transferred to Recruiter
- All other behavioral events

#### **Application Context**
- **Job Applied**: Travel Nurse - ICU
- **Application ID**: APP-12345
- **Status**: Active

---

## ✅ **Closing the Loop: Complete Placement**

### **Action**
Recruiter clicks **"Complete Placement"** button

### **What Happens**
```javascript
// Event sent to Segment
{
  anonymousId: "+13304027149",
  event: "Complete Placement",
  properties: {
    role: "Registered Nurse",
    specialty: "ICU",
    location: "Cleveland",
    state: "OH",
    candidateName: "Jessica Chen"
  }
}
```

### **Key Requirements Met**
- ✅ Uses `anonymousId` (phone number) for consistency
- ✅ Does NOT include email or phone in properties
- ✅ Tracks role, specialty, location for funnel analytics
- ✅ Closes the journey loop in Segment

---

## 🎬 **Demo Script for Recruiter Dashboard**

### **Setup** (Before Demo)
1. Have dashboard open: https://amn-recruiter-dashboard.vercel.app
2. Know the phone number: `+13304027149`

### **Live Demo Steps**

**Recruiter receives transferred call...**

**"When a call transfers to me, I can instantly see the candidate's complete context."**

1. **Search**: Type `+13304027149` in search bar
   
2. **Show unified profile**: 
   - "Here's Jessica Chen - ICU nurse with 5 years experience"
   - "I can see her location, specialty, current status"

3. **Show AI Insights**:
   - "Our AI agent already talked to her and learned that she's interested in travel nursing in warm climates"
   - "She prefers 13-week assignments and can start in 2 weeks"
   - "All of this context is available before I even say hello"

4. **Show Conversation History**:
   - "Here's our complete conversation thread"
   - "She uploaded her certs via RCS"
   - "The AI agent had a voice conversation with her"
   - "Every touchpoint is captured in one unified thread"

5. **Show Activity Timeline**:
   - "I can see her entire journey"
   - "Started application, abandoned at cert upload"
   - "We sent her an RCS reminder, she uploaded"
   - "Then she called in and was transferred to me"

6. **Complete the placement**:
   - "Now that I've placed her, I click Complete Placement"
   - "This sends an event back to Segment"
   - "Closes the loop from first touch to hire"
   - "Gives us full funnel visibility and attribution"

---

## 📈 **Value Proposition**

### **What Dashboard Demonstrates**

1. **Unified Profile**
   - Segment CDP consolidates all behavioral data
   - Every touchpoint enriches the same profile
   - Real-time profile enrichment from anonymous → identified

2. **AI-Powered Context**
   - Recall Memory stores conversation insights
   - AI observations surface immediately
   - No need to read transcripts - key points extracted

3. **Omnichannel Thread**
   - All conversations (RCS, Voice, SMS) in one place
   - Twilio Conversations unifies channels
   - No switching between systems

4. **Journey Orchestration**
   - Events trigger automated actions
   - Abandonment detected → RCS sent → Call triggered
   - Every step tracked and measured

5. **Closed-Loop Analytics**
   - From first touch to placement
   - Complete funnel visibility
   - Attribution and conversion tracking

---

## 🔧 **Technical Integration Points**

### **APIs Used**
1. **Segment Profile API**: Get traits and events by `anonymous_id`
2. **Twilio Conversations API**: Fetch RCS/Voice/SMS threads
3. **Recall Memory API**: Get AI observations and summaries
4. **Segment HTTP Tracking API**: Send "Complete Placement" event

### **Event Flow**
```
Application Started
  ↓
Abandonment Detected
  ↓
RCS Message Sent
  ↓
Cert Uploaded
  ↓
AI Voice Call
  ↓
Call Transferred to Recruiter ← Dashboard Entry Point
  ↓
Complete Placement ← Dashboard Exit Point
```

### **Data Sources**
- **Segment**: Profile traits, behavioral events, journey state
- **Twilio Conversations**: Unified message thread across channels
- **Recall Memory**: AI-generated insights and summaries

---

## 🎯 **Demo Key Messages**

1. **"Every touchpoint has complete context"**
   - AI agent knows everything from Segment
   - Recruiter knows everything from AI agent + Segment + Twilio

2. **"No more switching between systems"**
   - One dashboard shows unified view
   - Segment + Twilio + Recall all integrated

3. **"Real-time profile enrichment"**
   - Anonymous visitor → Identified candidate
   - Every interaction adds data
   - Instant availability to next touchpoint

4. **"Journey orchestration prevents drop-off"**
   - Abandonment triggers automated recovery
   - AI handles initial qualification
   - Human takes over at right moment

5. **"Closed-loop measurement"**
   - Track entire funnel
   - Attribution from first touch to hire
   - Optimize at every stage

---

## 📋 **Quick Reference**

**Dashboard URL**: https://amn-recruiter-dashboard.vercel.app

**Test Phone**: `+13304027149` or `13304027149`

**Test Profiles**:
- **Jessica Chen** - ICU Nurse (phone trait)
- **Eric Walters** - Physician (anonymous_id)

**Segment Write Key**: `JFvPd0OsxWNOnOaTRqrNBlYBTnn6Xnyp`

**Key Events**:
- `Call Transferred to Recruiter` (triggers dashboard load)
- `Complete Placement` (closes the loop)

---

**Dashboard Status**: ✅ Production Ready

**Last Updated**: 2026-07-07
