# Test Checklist - AMN Healthcare Demo

Use this checklist before presenting the demo to AMN Healthcare.

## Pre-Demo Setup

- [ ] Segment write key is added to `.env`
- [ ] Dev server is running (`npm run dev`)
- [ ] Browser is open to http://localhost:5173
- [ ] Segment Debugger is open in another tab
- [ ] Browser console is open (F12) to see debug logs

## Visual Verification

- [ ] AMN logo appears in header
- [ ] Hero image loads correctly
- [ ] Navigation bar is navy blue with white text
- [ ] Service tiles are visible on home page
- [ ] Job cards have green/teal badges
- [ ] Buttons are blue with white text
- [ ] Forms have proper styling

## Flow Testing

### Step 1: Home Page
- [ ] Hero section displays with title "Empowering Healthcare Careers..."
- [ ] "Search Jobs" button works (header and hero)
- [ ] Page view event fires in console: `[Segment] Page tracked: Home`

### Step 2: Job Seekers Menu
- [ ] Hover over "Job Seekers" shows dropdown
- [ ] "Nursing" category is highlighted
- [ ] Clicking "Search Jobs" in menu navigates correctly

### Step 3: Job Search
- [ ] Page displays "Found 5 jobs"
- [ ] Filter sidebar shows "Nursing" selected
- [ ] Job cards display with badges, location, pay
- [ ] Page view event fires: `[Segment] Page tracked: Job Search`
- [ ] Clicking a job card navigates to detail page

### Step 4: Job Detail
- [ ] NICU RN job displays correctly
- [ ] "Per Diem" and "Exclusive" badges visible
- [ ] Job overview sidebar shows pay: $44-$47
- [ ] Page view event fires: `[Segment] Page tracked: Job Detail`
- [ ] "Apply Now" button click fires event: `[Segment] CTA Clicked: Apply Now (job detail)`
- [ ] Navigates to apply page

### Step 5: Apply Landing
- [ ] Title: "It's Time to Take Your Career to the Next Level"
- [ ] Email input field is visible
- [ ] Decorative polaroid images display
- [ ] Page view event fires: `[Segment] Page tracked: Apply Landing`
- [ ] Entering email and clicking "Get Started" navigates to form
- [ ] CTA click event fires

### Step 6: Application Form
- [ ] Email is pre-filled from previous step
- [ ] All form fields are present:
  - [ ] Email (pre-filled)
  - [ ] Phone
  - [ ] First Name
  - [ ] Last Name
  - [ ] Profession (dropdown)
  - [ ] Discipline (dropdown)
  - [ ] Specialty (dropdown)
  - [ ] Other Specialty (dropdown)
- [ ] Consent checkbox is present
- [ ] "Apply Now!" button is disabled until consent is checked
- [ ] Page view event fires: `[Segment] Page tracked: Application Form`
- [ ] Filling all fields and submitting navigates to document upload
- [ ] CTA click event fires

### Step 7: Document Upload (Abandonment Point)

**CRITICAL - This is where the magic happens!**

- [ ] Title: "Great! Let's verify your credentials"
- [ ] Three file upload fields visible:
  - [ ] Resume/CV (required)
  - [ ] Nursing License (required)
  - [ ] Certifications (optional)
- [ ] "Continue Application" button is disabled (grayed out)
- [ ] "Save & Finish Later" button is enabled (blue outline)
- [ ] Help box with lightbulb icon displays
- [ ] Page view event fires: `[Segment] Page tracked: Document Upload`

**Click "Save & Finish Later":**
- [ ] Console shows: `[Segment] Application Abandoned event sent: app_<id>`
- [ ] Alert popup confirms: "Thanks for starting your application! We've saved your progress..."
- [ ] After closing alert, navigates back to home page
- [ ] **CHECK SEGMENT DEBUGGER**: `Application Abandoned` event appears with:
  - [ ] `abandonment_step: "document_upload"`
  - [ ] `application_id: "app_..."`
  - [ ] `email` from form
  - [ ] `phone` from form
  - [ ] `firstName` from form
  - [ ] `lastName` from form
  - [ ] `profession` from form
  - [ ] `timestamp`

## Segment Debugger Verification

In Segment Debugger tab, verify you see these events in order:

1. [ ] Page: Home
2. [ ] Track: CTA Clicked (Search Jobs)
3. [ ] Page: Job Search
4. [ ] Track: CTA Clicked (Job: NICU RN)
5. [ ] Page: Job Detail
6. [ ] Track: CTA Clicked (Apply Now)
7. [ ] Page: Apply Landing
8. [ ] Track: CTA Clicked (Get Started)
9. [ ] Page: Application Form
10. [ ] Track: CTA Clicked (Apply Now!)
11. [ ] Page: Document Upload
12. [ ] **Track: Application Abandoned** ← THE KEY EVENT
13. [ ] **Identify: [email]** ← User identification

## Abandonment Event Payload Check

Click into the "Application Abandoned" event in Segment Debugger and verify:

```json
{
  "event": "Application Abandoned",
  "properties": {
    "abandonment_step": "document_upload",
    "application_id": "app_...",
    "email": "[the email you entered]",
    "phone": "[the phone you entered]",
    "firstName": "[the name you entered]",
    "lastName": "[the last name you entered]",
    "profession": "[the profession you selected]",
    "discipline": "[the discipline you selected]",
    "specialty": "[the specialty you selected]",
    "timestamp": "[ISO timestamp]"
  }
}
```

- [ ] All form data is present
- [ ] `abandonment_step` is "document_upload"
- [ ] `application_id` is unique
- [ ] `timestamp` is current

## Multiple Runs Test

- [ ] Refresh browser → reset works
- [ ] Run through flow again → new `application_id` generated
- [ ] Each run fires separate events in Segment

## Browser Compatibility

Test in:
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge (if Windows available)

## Mobile Responsiveness

- [ ] Open in mobile view (Chrome DevTools)
- [ ] Navigation works on mobile
- [ ] Forms are usable on mobile
- [ ] Buttons are tappable

## Performance

- [ ] Page loads in < 2 seconds
- [ ] No console errors (except Segment write key warning if not configured)
- [ ] Images load correctly
- [ ] No broken links

## Demo Readiness

- [ ] Can complete full flow in under 2 minutes
- [ ] Comfortable explaining each step
- [ ] Know where to point out Segment events
- [ ] Can handle questions about:
  - [ ] Why document upload for abandonment?
  - [ ] How does Segment → Twilio work?
  - [ ] Can this be customized?
  - [ ] What other events can we track?

## Emergency Backup

If something breaks during demo:

1. **Segment not working?**
   - Show the console logs as proof events are firing
   - Explain the write key issue

2. **Styling broken?**
   - Have screenshots ready
   - Focus on the event tracking

3. **Dev server crashed?**
   - Have a backup video/recording
   - Show Segment Debugger data from previous run

## Final Checklist

- [ ] All tests above passed
- [ ] Segment Debugger shows events correctly
- [ ] Alert message is professional
- [ ] No console errors
- [ ] Ready to present!

---

## Test Run Template

Use this as your test data for consistent demos:

**Email**: demo@amnhealthcare.com  
**Phone**: (555) 123-4567  
**First Name**: Sarah  
**Last Name**: Johnson  
**Profession**: Nursing  
**Discipline**: Registered Nurse  
**Specialty**: Neonatal Intensive Care (NICU)

This creates a realistic candidate persona for the demo.

---

**Status**: Ready to demo? ✅

If all items are checked, you're ready to present to AMN Healthcare!
