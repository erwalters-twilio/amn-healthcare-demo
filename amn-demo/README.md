# AMN Healthcare Demo Website

A React-based demo website showcasing the candidate application journey with Segment event tracking. Built for Twilio's presentation to AMN Healthcare.

## Features

- **7-Step Application Flow**: Home → Job Search → Job Detail → Apply Landing → Application Form → Document Upload → Abandonment
- **Segment Event Tracking**: Page views, CTA clicks, and application abandonment events
- **Pixel-Perfect Design**: Replicates AMN Healthcare's actual website design
- **Natural Abandonment**: Document upload step where users realistically abandon

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Segment

Get your Segment write key from your Segment workspace:
1. Go to https://app.segment.com
2. Navigate to your source → Settings → API Keys
3. Copy your Write Key

Add it to `.env`:

```bash
VITE_SEGMENT_WRITE_KEY=your_actual_segment_write_key_here
```

### 3. Run the Development Server

```bash
npm run dev
```

Visit http://localhost:5173

## Demo Flow

### User Journey (Steps 1-7)

1. **Home Page** (`/`)
   - Hero section with AMN branding
   - Service tiles with CTAs
   
2. **Job Search** (`/search`)
   - Filter sidebar (Profession: Nursing selected)
   - 5 nursing job listings with badges
   
3. **Job Detail** (`/job/167335`)
   - NICU RN position details
   - Job overview sidebar with pay range
   - "Apply Now" button
   
4. **Apply Landing** (`/apply`)
   - Email capture form
   - Aspirational travel imagery
   
5. **Application Form** (`/application`)
   - Contact information fields
   - Profession/discipline/specialty dropdowns
   - Consent checkbox
   
6. **Document Upload** (`/documents`)
   - Resume/CV upload (required)
   - Nursing License upload (required)
   - Certifications upload (optional)
   - **"Save & Finish Later" button** → **FIRES ABANDONMENT EVENT**

### Abandonment Event

When the user clicks **"Save & Finish Later"** on the Document Upload page:

1. Fires `Application Abandoned` event to Segment
2. Shows confirmation alert
3. Returns to home page

**Event Payload:**
```json
{
  "event": "Application Abandoned",
  "properties": {
    "abandonment_step": "document_upload",
    "application_id": "app_<timestamp>_<random>",
    "email": "user@example.com",
    "phone": "(555) 123-4567",
    "firstName": "John",
    "lastName": "Doe",
    "profession": "Nursing",
    "discipline": "Registered Nurse",
    "specialty": "NICU",
    "timestamp": "2026-07-03T10:30:00Z"
  },
  "userId": "user@example.com"
}
```

## Segment Events Tracked

### 1. Page Viewed
Fired on every route change.

**Properties:**
- `page_name`: "Home", "Job Search", "Job Detail", etc.
- `page_path`: Current URL path
- `timestamp`: ISO 8601 timestamp

### 2. CTA Clicked
Fired when user clicks buttons or links.

**Properties:**
- `button_text`: Text of the clicked button
- `destination`: Target URL/route
- `source_page`: Current page path
- `timestamp`: ISO 8601 timestamp

### 3. Application Abandoned
Fired when user clicks "Save & Finish Later" on document upload.

**Properties:**
- `abandonment_step`: "document_upload"
- `application_id`: Unique application ID
- Form data (email, phone, name, profession, etc.)
- `timestamp`: ISO 8601 timestamp

## Segment Configuration (Your End)

After receiving the "Application Abandoned" event in Segment:

1. **Create a Destination** in Segment for Twilio SMS
2. **Map the event** to trigger SMS:
   - Event: `Application Abandoned`
   - Destination: Twilio SMS
   - Message template: "Hi {firstName}, we noticed you started an application. Let us help you finish! Click here: [link]"
   - Recipient: `properties.phone`

## Testing the Demo

### End-to-End Test:

1. Start at http://localhost:5173
2. Click "Search Jobs" (hero or header)
3. Click the first job card (NICU RN)
4. Click "Apply Now"
5. Enter email → Click "Get Started"
6. Fill out application form (all required fields)
7. Check consent checkbox → Click "Apply Now!"
8. On Document Upload page → Click "Save & Finish Later"
9. **Verify** the abandonment event in:
   - Browser console (debug log)
   - Segment Debugger UI

### Verify Events in Segment:

1. Go to https://app.segment.com
2. Navigate to your source
3. Click "Debugger" in the left sidebar
4. Run through the demo flow
5. Watch events appear in real-time

## Running Multiple Demos

The demo is **stateless** - just refresh the browser to reset. You can run the demo as many times as needed without any cleanup.

Each run generates a unique `application_id` so you can track individual demo instances in Segment.

## Design System

### Colors
- Primary Blue: `#0074A1`
- Navy Blue: `#003B5C`
- Success Green: `#00A651`
- White: `#FFFFFF`
- Light Gray: `#F5F5F5`

### Typography
System fonts: `-apple-system, BlinkMacSystemFont, 'Segoe UI'`

### Button Variants
- `primary`: Solid blue, white text
- `secondary`: White outline on colored backgrounds
- `outline`: Blue outline, transparent background

## Project Structure

```
/src
  /components
    - Header.jsx          Navigation with AMN logo
    - Hero.jsx            Homepage hero section
    - JobCard.jsx         Job listing cards
    - Button.jsx          Reusable button component
  /pages
    - HomePage.jsx        Step 1: Home
    - JobSearchPage.jsx   Step 3: Search results
    - JobDetailPage.jsx   Step 4: Job detail
    - ApplyLandingPage.jsx  Step 5: Email capture
    - ApplicationFormPage.jsx  Step 6: Full form
    - DocumentUploadPage.jsx   Step 7: Abandonment point
  /utils
    - analytics.js        Segment tracking helpers
  - App.jsx               Routing
  - main.jsx              Entry point + Segment init
```

## Troubleshooting

### No events showing in Segment?
- Check that `VITE_SEGMENT_WRITE_KEY` is set in `.env`
- Verify the write key is correct
- Check browser console for errors
- Look for `[Segment]` debug logs in console

### Styling issues?
- Clear browser cache
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- Check that image assets are in `/public` folder

### Dev server won't start?
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Build for Production

```bash
npm run build
```

Output will be in `/dist` directory. Deploy to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## License

Demo project for Twilio x AMN Healthcare presentation.
