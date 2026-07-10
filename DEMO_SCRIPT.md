# AMN Healthcare Demo Script

**Live Site**: https://amn-demo.vercel.app  
**Segment Debugger**: https://app.segment.com (open in split-screen)  
**Recruiter Dashboard**: [URL TBD]  
**Journey Builder**: https://app.segment.com/twilio-segment-demo/protocols/tracking-plans  
**Project Path**: `/Users/ericwalters/Documents/clients/amn-new/amn-demo`

---

## DEMO AGENDA OVERVIEW (30-60 seconds)

Today we're showing how Twilio CDP and Communications Platform work together to prevent candidate drop-off and accelerate placements.

Here's the flow: An applicant starts on your web property as an anonymous visitor. As they browse jobs and begin their application, **Segment CDP** is building a unified behavioral profile in real-time. When they abandon—typically at document upload—that abandonment event immediately triggers **journey orchestration** within Segment.

Segment then coordinates engagement across **Twilio Communications channels**—starting with an RCS message to help them complete their application, escalating to an **AI-powered voice call** if they need assistance, and ultimately handing off to a human recruiter with complete context.

Throughout this journey, **Twilio Conversations** is unifying all interactions—RCS, voice, SMS—into a single conversation thread and generating intelligence summaries. When the recruiter steps in, they see the full picture: the Segment behavioral profile showing what jobs the applicant explored, plus the Twilio conversation thread with AI-generated summaries of every interaction.

The result: every touchpoint—automated or human—has complete context about where the applicant is, what they need, and what they care about. Real-time data flowing between systems with sub-second latency means we can intervene immediately and intelligently. Let me show you how this works.

---

## PART 1: WEB EXPERIENCE & REAL-TIME PROFILE BUILDING

**[Open AMN demo site + Segment Debugger split-screen]**

I'm starting as an anonymous visitor on the AMN Healthcare careers site. On the right, you can see the Segment source—this is where we'll watch behavioral data flow in real-time.

**[Click "Search Jobs"]**

As I search for physician jobs, watch the Segment debugger. Every page view, every search, every job I explore is being captured with sub-second latency. This isn't batch processing—Segment knows what I'm interested in before I even apply.

**[Browse multiple physician jobs, clicking through 2-3 different specialties]**

Notice as I explore different specialties and locations, Segment is tracking all of this behavioral intent data. This becomes critical later when we need to re-engage or recommend roles that match what they've already shown interest in.

**Value:** Real-time behavioral profile building from anonymous traffic. We're understanding intent before we even know who someone is.

---

## PART 2: APPLICATION & PROFILE ENRICHMENT

**[Click "Apply Now" on a job]**

Now I'm transitioning from anonymous visitor to identified applicant. I'll enter my email and key professional information.

**[Fill out application form while highlighting Segment profile updates on other screen]**

```
Email: dr.garcia@example.com
Phone: (555) 234-5678
First Name: Maria
Last Name: Garcia
Profession: Physician
Specialty: Emergency Medicine
Subspecialty: Pediatric Emergency Medicine
☑ Consent checkbox
```

Watch the Segment profile update in real-time as I submit this. See how the anonymous behavioral profile is now being enriched with identity and professional attributes? We've gone from knowing what jobs someone looked at to knowing exactly who they are and what they're qualified for.

**[Show resolved Segment profile with both behavioral events and identity traits]**

Look at this unified profile: all those anonymous page views and job searches are now tied to Dr. Maria Garcia, Emergency Medicine physician. Behavioral data plus identity—this is what powers intelligent orchestration downstream.

**Value:** Identity resolution in real-time. Anonymous to identified in one seamless journey, with complete history preserved.

---

## PART 3: ABANDONMENT & JOURNEY ORCHESTRATION

**[Navigate to document upload page, then click "Save & Finish Later"]**

Document uploads create the most friction in applications. I'm abandoning here—this is where most applicants drop off.

**[Show Segment debugger capturing "Application Abandoned" event]**

Segment immediately captured that abandonment event with all the context: who abandoned, where they abandoned, what they were applying for, their phone number for follow-up.

**[Switch to Journey Builder view]**

This event triggers our journey orchestration. The Journey Builder is listening for "Application Abandoned" events and within seconds—not hours, not overnight—it's executing an automated workflow to re-engage.

**[Show journey workflow configuration]**

Here's the workflow: abandonment event comes in → Segment immediately sends an RCS message via Twilio to the applicant's phone. We're using the phone number they provided, their first name for personalization, and we know exactly where they left off.

**Value:** Automated, real-time intervention. The moment someone drops off, we're intelligently bringing them back with the right message on the right channel.

---

## PART 4: RCS ENGAGEMENT & REDUCED FRICTION

**[Show phone via QuickTime with RCS message appearing]**

Here's the RCS message coming through: "Hi Maria, we noticed you started your application for Emergency Medicine. Upload your certifications to complete your application."

Notice it's personalized, it knows the specialty, and it's actionable. This isn't a generic "come back to our site" message.

**[Click upload button in RCS, upload sample documents]**

I can upload my certifications directly in this conversation thread. No need to go back to the website, remember where I was, log in. We've eliminated friction and kept the applicant moving forward.

**[Show documents uploaded confirmation in RCS]**

Done. That abandonment is now recovered, and Segment is tracking this entire interaction.

**Value:** Meeting applicants where they are, on their preferred channel, with context about exactly what they need to do next. Friction eliminated.

---

## PART 5: MULTI-CHANNEL ORCHESTRATION & AI VOICE

**[In RCS thread, click "I need help" button]**

Now the applicant needs assistance. They click "I need help" in the same RCS thread.

**[Switch to Journey Builder view showing real-time response]**

Watch the Journey Builder detect that button interaction in real-time. It's now executing an outbound voice call via Twilio. This is multi-channel orchestration—Segment is the brain coordinating RCS and Voice based on applicant behavior.

**[Answer incoming AI voice call]**

AI Agent: "Hi Maria, this is AMN Healthcare. I see you're interested in our Pediatric Emergency Medicine positions. I noticed you've been looking at roles in California. Would you like me to tell you about our current openings?"

**[Have brief back-and-forth with AI about specific roles and preferences]**

Me: "Yes, I'm specifically interested in positions in the Bay Area with flexible scheduling."

AI Agent: "Great, I have two positions that match perfectly. Let me connect you with a recruiter who specializes in Bay Area placements."

**[End call or simulate transfer]**

**Value:** The AI agent isn't starting from scratch. It pulled my entire profile from Segment—behavioral data showing which jobs I viewed, application data with my specialty and subspecialty, and the RCS interaction I just had. This is personalized engagement powered by unified data.

---

## PART 6: UNIFIED CONVERSATIONS & INTELLIGENCE LAYER

**[Show Twilio Conversations interface]**

Now let me show you what's happening behind the scenes that makes the recruiter handoff seamless.

Twilio Conversations is taking that RCS thread and the voice call and unifying them into a single conversation thread. It's not just storing transcripts—it's generating intelligence on top of them.

**[Highlight conversation summaries and observations]**

Look at these automatically generated summaries:
- "Applicant expressed interest in Pediatric Emergency Medicine, Bay Area, flexible scheduling"
- "Documents uploaded: State medical license, DEA certificate, board certifications"
- "Tone: engaged, ready to move forward"

Twilio is extracting key observations and building what we call a memory profile—understanding what this applicant cares about, what they've already shared, what concerns they've raised.

**[Show how RCS and Voice are unified in single thread]**

See how the RCS messages and voice transcript are in one continuous conversation? This is the power of Twilio Communications Platform—channel-agnostic conversation intelligence.

**Value:** This is where Segment and Twilio Communications Platform amplify each other. Segment provides the behavioral and identity profile from web activity. Twilio Conversations provides the interaction intelligence from communications. Together, they create complete applicant context—no gaps, no silos.

---

## PART 7: RECRUITER DASHBOARD & COMPLETE CONTEXT

**[Open recruiter dashboard with split view: Segment profile on left, Conversations on right]**

When this call gets transferred to a recruiter—or when any recruiter picks up this applicant in the future—here's what they see.

**Left side: Segment Profile**
- Complete behavioral history: every job viewed, every search query
- Identity and professional traits: specialty, subspecialty, location preferences
- Application status and journey history: where they've been, what triggered outreach

**Right side: Twilio Conversations**
- Unified conversation thread across RCS and Voice
- AI-generated summaries and observations
- Full transcript if they need to dig deeper

**[Navigate through dashboard features]**

The recruiter can immediately see:
- Dr. Garcia is an Emergency Medicine physician with pediatric subspecialty
- She's been looking exclusively at Bay Area roles with flexible scheduling
- She's already uploaded her certifications
- She's engaged and ready to move forward—not a cold lead

**Value:** No cold starts. No asking the applicant to repeat themselves. No digging through multiple systems. The recruiter has everything they need to have an intelligent conversation and move toward placement immediately.

This dashboard could be built directly into Flex, or any CRM, or a custom interface. The point is that every touchpoint—automated or human—has access to the same rich, unified context.

---

## PART 8: PLACEMENT & LOOP CLOSURE

**[Show recruiter clicking "Placement Completed" in dashboard]**

When the recruiter successfully places Dr. Garcia in a role, they mark it complete.

**[Switch to Segment showing "Placement Completed" event coming in]**

Segment captures that placement event in real-time. The journey that started with web browsing is now complete.

**[Show Journey Builder triggering welcome email]**

The Journey Builder detects the placement event and triggers the final step: a welcome email with next steps for onboarding—credentialing, orientation schedule, first day logistics.

**[Show email in inbox or email client]**

Personalized, timely, and contextual. The loop is closed.

**Value:** Segment orchestrated this entire journey end-to-end—from abandonment detection through RCS engagement, AI voice, recruiter handoff, and placement. One brain coordinating multiple channels and touchpoints across the Twilio ecosystem.

---

## CLOSING: THE VALUE STORY

What you just saw is how Twilio CDP and Communications Platform work together to eliminate candidate drop-off through intelligent, context-aware engagement at every step.

**Three critical capabilities:**

1. **Real-time unified profiles** - Segment builds a complete picture of every applicant from anonymous web behavior through identity and cross-channel interactions

2. **Journey orchestration across channels** - Automated workflows triggered by real-time events, engaging applicants on RCS, Voice, and Email with perfect timing and context

3. **Context everywhere** - Every touchpoint, whether AI agent or human recruiter, has complete history and intelligence to provide personalized, efficient engagement with no gaps

**The business outcome:** Fewer abandoned applications, faster time-to-placement, better applicant experience, and higher recruiter productivity. All powered by real-time data flowing seamlessly across the Twilio ecosystem—CDP and Communications Platform working as one.

---

## TECHNICAL SETUP NOTES

### Running the App
```bash
cd /Users/ericwalters/Documents/clients/amn-new/amn-demo
npm run dev
```
**URL**: http://localhost:5173

### Systems to Have Open
1. Demo website (localhost or Vercel)
2. Segment Debugger (split-screen, events view)
3. Segment Profile view (for resolved profile)
4. Journey Builder (for workflow visualization)
5. Recruiter Dashboard (custom or mock)
6. Twilio Conversations interface (for conversation thread)
7. Phone via QuickTime (for RCS and voice)

### Demo Reset
Click "Reset Demo" button between runs to clear anonymous ID and start fresh journey tracking.
