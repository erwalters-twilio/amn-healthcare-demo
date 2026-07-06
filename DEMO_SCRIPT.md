# AMN Healthcare Demo Script

**Live Site**: https://amn-demo.vercel.app  
**Segment Debugger**: https://app.segment.com (open in split-screen)  
**Project Path**: `/Users/ericwalters/Documents/clients/amn-new/amn-demo`

---

## Running the App

### Start Local Dev Server
```bash
cd /Users/ericwalters/Documents/clients/amn-new/amn-demo
npm run dev
```
**URL**: http://localhost:5173  
**Stop**: `Ctrl + C`

### Deploy to Vercel (Production)
```bash
cd /Users/ericwalters/Documents/clients/amn-new/amn-demo
vercel --prod
```
**Result**: Updates https://amn-demo.vercel.app

### Quick Commands
```bash
# Start dev server
npm run dev

# Build locally (test)
npm run build

# Deploy to production
vercel --prod

# View deployment logs
vercel logs
```

---

## Demo Flow

### Step 1: Home Page
**Action**: Land on homepage  
**Segment**: `Page` - Home  
**Show**: Hero section, AMN branding

### Step 2: Browse Jobs
**Action**: Click "Search Jobs" button  
**Segment**: 
- `Track` - CTA Clicked (Search Jobs)
- `Page` - Job Search  

**Show**: 5 nursing jobs, filters, badges (Per Diem, Exclusive)

### Step 3: View Job Detail
**Action**: Click NICU RN job card  
**Segment**:
- `Track` - CTA Clicked (Job: NICU RN)
- `Page` - Job Detail  

**Show**: Job details, $44-$47 pay range, job overview sidebar

### Step 4: Start Application
**Action**: Click "Apply Now" button  
**Segment**:
- `Track` - CTA Clicked (Apply Now)
- `Page` - Apply Landing  

**Show**: Email capture form with aspirational imagery

### Step 5: Enter Email
**Action**: Enter email → Click "Get Started"  
**Test Data**: `sarah.johnson@example.com`  
**Segment**:
- `Track` - CTA Clicked (Get Started)
- `Page` - Application Form  

### Step 6: Fill Application Form
**Action**: Complete all required fields  
**Test Data**:
```
Email: sarah.johnson@example.com (pre-filled)
Phone: (555) 123-4567
First Name: Sarah
Last Name: Johnson
Profession: Nursing
Discipline: Registered Nurse
Specialty: Neonatal Intensive Care (NICU)
☑ Consent checkbox
```
**Action**: Click "Apply Now!"  
**Segment**:
- `Track` - CTA Clicked (Apply Now!)
- `Page` - Document Upload

### Step 7: Abandon Application
**Action**: Click "Save & Finish Later" button  
**Segment**:
- `Track` - **Application Abandoned** ← KEY EVENT
- `Identify` - sarah.johnson@example.com

**Event Payload**:
```json
{
  "event": "Application Abandoned",
  "properties": {
    "application_id": "app_1719999025123_a7x9k2_1",
    "abandonment_step": "document_upload",
    "email": "sarah.johnson@example.com",
    "phone": "+15551234567",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "profession": "Nursing",
    "discipline": "Registered Nurse",
    "specialty": "Neonatal Intensive Care (NICU)",
    "date": "2026-07-03",
    "time": "14:30:25",
    "unix": 1719999025
  },
  "userId": "sarah.johnson@example.com"
}
```

**Show in Segment**: 
- `application_id` - **UNIQUE every time** (even same user abandoning multiple times)
- Phone format: +15551234567 (E.164 for SMS)
- Clean date/time fields for filtering
- All form data captured

---

## Identity Resolution

**Anonymous → Identified**:
1. User browses as anonymous (`anonymousId`: auto-generated)
2. Events tracked: Page views, CTA clicks (all anonymous)
3. User enters email in Step 5 → still anonymous
4. User abandons in Step 7 → `identify()` call fires
5. Segment merges: all previous anonymous events → `sarah.johnson@example.com`

**Result**: Complete journey tied to one identity

---

## Twilio Integration (External)

After "Application Abandoned" event:
1. Segment forwards event to Twilio SMS destination
2. Twilio sends: "Hi Sarah, we noticed you started an application. Let us help you finish! [link]"
3. Uses: `properties.phone` (+15551234567), `properties.firstName` (Sarah)

**Segment Journey Setup**:
- **Trigger**: Event = "Application Abandoned"
- **Filter**: None needed - `application_id` is unique per abandonment
- **Action**: Send to Twilio SMS
- **Result**: Every abandonment triggers SMS, even if same user abandons 10 times

---

## Reset Demo

**Action**: Click "Reset Demo" button (bottom-right)  
**Result**: Clears Segment anonymous ID, reloads page  
**Use**: Between demos to track new "candidates"

---

## Key Talking Points

1. **Natural Abandonment**: Document upload is where real candidates drop off
2. **Complete Data Capture**: Email, phone, name, profession all captured before abandon
3. **E.164 Phone Format**: Normalized to +1XXXXXXXXXX for reliable SMS delivery
4. **Clean Timestamps**: Separate date/time fields for easy filtering
5. **Identity Stitching**: Anonymous browsing → identified user in one journey
6. **Immediate Action**: SMS triggered within seconds of abandonment

---

## Technical Details

**Events Tracked**:
- `Page` - Every route change (7 total)
- `Track: CTA Clicked` - Every button/link (6 total)
- `Track: Application Abandoned` - Final event (1 total)
- `Identify` - User identification (1 total)

**Data Flow**:
Frontend → Segment → Twilio SMS → Candidate's phone

**Performance**:
- Page load: <2s
- Event delivery: <1s
- SMS delivery: <10s

---

## Quick Start

1. Open: https://amn-demo.vercel.app
2. Open: Segment Debugger (split-screen)
3. Follow steps 1-7 above
4. Watch events appear in real-time
5. Click "Reset Demo" before next run
