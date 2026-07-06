# AMN Healthcare Demo - Quick Setup Guide

## What We Built

A complete 7-step application flow that tracks user behavior via Segment and fires an "Application Abandoned" event when users click "Save & Finish Later" on the document upload page.

## Next Steps

### 1. Add Your Segment Write Key

Edit `/amn-demo/.env`:

```bash
VITE_SEGMENT_WRITE_KEY=your_actual_segment_write_key
```

Get your write key from:
- https://app.segment.com
- Navigate to your source → Settings → API Keys
- Copy the "Write Key"

### 2. Test the Flow

The dev server is already running at: **http://localhost:5173**

**Complete Journey:**
1. Home → Click "Search Jobs"
2. Job Search → Click first job (NICU RN)
3. Job Detail → Click "Apply Now"
4. Apply Landing → Enter email → Click "Get Started"
5. Application Form → Fill all required fields → Check consent → Click "Apply Now!"
6. Document Upload → Click "Save & Finish Later" ← **FIRES ABANDONMENT EVENT**

### 3. Verify Events in Segment

Open two browser tabs:
- **Tab 1**: http://localhost:5173 (your demo)
- **Tab 2**: https://app.segment.com (Segment Debugger)

In Segment:
1. Go to your source
2. Click "Debugger" in the left sidebar
3. Run through the demo flow in Tab 1
4. Watch events appear in real-time in Tab 2

**Events you'll see:**
- `Page Viewed` (on each navigation)
- `CTA Clicked` (on button clicks)
- `Application Abandoned` (when clicking "Save & Finish Later")

### 4. Connect to Twilio SMS

In Segment:
1. Go to **Connections** → **Add Destination**
2. Search for "Twilio"
3. Configure the destination:
   - **Event**: `Application Abandoned`
   - **Message**: "Hi {{properties.firstName}}, we noticed you started an application with AMN Healthcare. Let us help you finish! [link]"
   - **To**: `{{properties.phone}}`
   - **From**: Your Twilio number

## Demo Script

**For presenting to AMN Healthcare:**

> "Let me show you how we track candidate behavior and re-engage them when they abandon their application.
> 
> Here's a nursing candidate browsing jobs on your website... [navigate through steps 1-3]
> 
> They find a NICU position that interests them and click Apply Now... [steps 4-5]
> 
> They start filling out the application form with their contact information... [step 6]
> 
> But when they get to the document upload screen, they realize they don't have their resume or license handy. This is where most candidates drop off. They click 'Save & Finish Later'... [step 7]
> 
> At this exact moment, Segment captures the abandonment event with all the candidate's information. That event flows into Twilio, which immediately sends them a personalized SMS reminder.
> 
> Within minutes, the candidate receives a text saying 'Hi [Name], we noticed you started an application. Let us help you finish!' with a link to resume where they left off.
> 
> This is how we recapture candidates who would otherwise be lost in the funnel."

## Key Features

✅ **Natural Abandonment**: Document upload is a realistic stopping point
✅ **Repeatable**: Refresh the page to reset - run demo as many times as needed
✅ **Complete Data**: Abandonment event includes email, phone, name, profession, etc.
✅ **Visual Match**: Design replicates AMN's actual website
✅ **Production-Ready**: Can be deployed immediately to show live Segment events

## File Locations

- **Project**: `/Users/ericwalters/Documents/clients/amn-new/amn-demo/`
- **README**: `/Users/ericwalters/Documents/clients/amn-new/amn-demo/README.md`
- **Env Config**: `/Users/ericwalters/Documents/clients/amn-new/amn-demo/.env`

## Troubleshooting

**No events in Segment?**
- Make sure `VITE_SEGMENT_WRITE_KEY` is set in `.env`
- Restart the dev server: `npm run dev`
- Check browser console for `[Segment]` logs

**Styling looks off?**
- Hard refresh the browser (Cmd+Shift+R)
- Check that images are in `/amn-demo/public/`

**Need to restart dev server?**
```bash
cd /Users/ericwalters/Documents/clients/amn-new/amn-demo
npm run dev
```

## Support

If you run into any issues during the demo:
1. Check the browser console for errors
2. Verify Segment Debugger shows events
3. Test the SMS trigger manually in Segment's Functions or Twilio Console

Good luck with the presentation! 🚀
