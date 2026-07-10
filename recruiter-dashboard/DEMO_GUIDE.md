# AMN Recruiter Dashboard - Demo Guide

## ✅ System Status

- **Backend API**: ✅ Running on http://localhost:3001
- **Frontend Dashboard**: ✅ Running on http://localhost:5174
- **Segment Integration**: ✅ Pulling real profile data
- **Twilio Integration**: ✅ Configured and ready
- **Webhook Endpoint**: ✅ Ready to receive events

## 🎨 Polished UI Features

### Brand-New Professional Design
- ✅ AMN Healthcare gradient header (navy blue → bright blue)
- ✅ Clean white cards with subtle shadows
- ✅ Professional color scheme matching AMN brand
- ✅ Responsive layout optimized for recruiters
- ✅ Large, easy-to-read search bar
- ✅ Clear visual hierarchy with icons and badges

### Key Visual Improvements
1. **Header**: Gradient background with AMN logo area, current candidate badge
2. **Search Bar**: Large, prominent with white background and AMN green focus ring
3. **Profile Cards**: White cards with gradient backgrounds, organized info sections
4. **Timeline**: Event cards with colored left borders, hover effects
5. **Conversations**: Chat bubble UI with AMN blue for agent messages
6. **Icons**: Color-coded sections (blue for contact, green for professional, purple for AI)

## 🧪 Testing the Dashboard

### Method 1: Webhook Simulation (Automatic Loading)

Run the test script:
```bash
cd recruiter-dashboard
./test-webhook.sh
```

This simulates a "Call Transferred to Recruiter" event from Segment. Then:
1. Open http://localhost:5174
2. The dashboard will auto-load Jessica Chen's profile
3. View complete candidate context

### Method 2: Manual Search

1. Open http://localhost:5174
2. Type in the search bar: `+13304027149`
3. Click the search result
4. View the candidate profile

### Method 3: Search by Email

1. Open http://localhost:5174
2. Type: `test.nurse@amnhealthcare.com` or `erwalters@twilio.com`
3. Select the candidate from dropdown
4. Profile displays automatically

**Note**: If multiple profiles match an email (due to Segment having both `user_id:email` and `email:email` identifiers), all matches will be shown. Select the correct profile based on name/phone.

## 📊 What's Displayed

### Real Data from Segment Profile API

**Candidate**: Jessica Chen
- **Email**: test.nurse@amnhealthcare.com
- **Phone**: +13304027149
- **Profession**: Registered Nurse (shows as stored in Segment)
- **Specialty**: ICU
- **State**: California
- **Years Experience**: 5
- **Application Status**: incomplete

### Dashboard Sections

1. **Profile Section**
   - Large avatar with initials
   - Contact information (email, phone, city, zip)
   - Professional profile (specialty, discipline, state, experience)

2. **Activity Timeline**
   - Segment events in chronological order
   - Color-coded by type (amber for abandoned, blue for messages, green for calls)
   - Relative timestamps ("2 hours ago")

3. **Conversations** (Right column)
   - Multi-channel message history
   - Channel badges (Web, RCS, SMS, Voice)
   - Chat bubble UI

4. **AI Insights** (Right column)
   - Twilio Memory observations
   - AI-generated summaries
   - *Note: Requires Memory Store ID configuration*

5. **Application Context** (Right column)
   - Job applied for
   - Application ID
   - Abandonment details (if applicable)

## 🔌 Integration Points

### Segment Profile API
- ✅ **Working**: Pulling real profile data
- ✅ **Endpoint**: `https://profiles.segment.com/v1/spaces/{SPACE_ID}/...`
- ✅ **Auth**: Profile API token configured
- ✅ **Data**: Traits + Events

### Twilio Conversations API
- ✅ **Configured**: Credentials in place
- 🔄 **Ready**: Will show messages when conversations exist
- 📝 **Note**: Test data may not have active conversations yet

### Twilio Memory API
- ⚠️ **Needs**: Memory Store ID configuration
- 📝 **Setup**: Create Memory Store in Twilio Console
- 🔄 **Ready**: Code is in place, just needs Store ID

## 🚀 Production Integration

### Step 1: Configure Segment Webhook

In your Segment workspace:
1. Go to **Connections** → **Destinations**
2. Add **Webhook** destination
3. Set URL to: `https://your-backend.com/webhooks/segment`
4. Filter events: **"Call Transferred to Recruiter"**
5. Enable the destination

### Step 2: Test Webhook Flow

When `openai-relay-server` transfers a call:
1. Event sent to Segment: "Call Transferred to Recruiter"
2. Segment forwards to dashboard webhook
3. Dashboard fetches all candidate data
4. Recruiter sees complete profile automatically

### Step 3: Deploy to Production

**Backend** (Railway recommended):
```bash
cd recruiter-dashboard/server
# Connect to Railway
railway link
# Set environment variables
railway variables set SEGMENT_PROFILE_TOKEN=...
railway variables set TWILIO_ACCOUNT_SID=...
# Deploy
railway up
```

**Frontend** (Vercel):
```bash
cd recruiter-dashboard/dashboard
vercel deploy
# Set environment variable
vercel env add VITE_API_URL
# Enter: https://your-backend.railway.app
```

## 🎯 Demo Flow

### Full Demo Scenario

1. **Setup**: Both servers running (backend + frontend)

2. **Trigger Event**: Run `./test-webhook.sh` to simulate call transfer

3. **Show Dashboard**: Open http://localhost:5174
   - Auto-loads candidate profile
   - Shows complete context

4. **Highlight Features**:
   - ✅ Real-time data from Segment
   - ✅ Professional recruiter-ready UI
   - ✅ All candidate info in one place
   - ✅ Cross-channel conversation history
   - ✅ AI-powered insights (when Memory configured)

5. **Manual Search Demo**:
   - Clear the current candidate (refresh page)
   - Type `+13304027149` in search
   - Show instant results
   - Click to load profile

## 📝 API Endpoints

### Quick Reference

```bash
# Get candidate by phone
curl http://localhost:3001/api/candidates/phone:+13304027149

# Search candidates
curl "http://localhost:3001/api/search?q=+13304027149"

# Get current (most recent) candidate
curl http://localhost:3001/api/candidates/current

# Simulate webhook
curl -X POST http://localhost:3001/webhooks/segment \
  -H "Content-Type: application/json" \
  -d '{"event": "Call Transferred to Recruiter", "properties": {"phone": "+13304027149"}}'

# Health check
curl http://localhost:3001/health
```

## 🎨 Design Highlights

### AMN Healthcare Branding

**Colors**:
- Primary Blue: `#0074A1`
- Navy: `#003B5C`
- Success Green: `#00A651`
- Professional grays and whites

**Typography**:
- Bold headers for hierarchy
- Clear section labels
- Easy-to-read body text

**Layout**:
- 60/40 split (profile/timeline vs. conversations/insights)
- Card-based design for clear organization
- Responsive grid system

## 🔧 Troubleshooting

### Dashboard shows "No candidate selected"
- Run `./test-webhook.sh` to load a candidate
- Or search manually: `+13304027149`

### Search returns no results
- Verify phone format: `+13304027149` (with +)
- Try email: `test.nurse@amnhealthcare.com`
- Check backend logs: `tail -f /tmp/recruiter-backend.log`

### Backend not responding
```bash
# Check if running
curl http://localhost:3001/health

# Restart if needed
cd recruiter-dashboard/server
npm run dev
```

### Frontend styling broken
```bash
# Rebuild Tailwind
cd recruiter-dashboard/dashboard
npm run dev
```

## 🎉 Success Criteria

✅ Dashboard loads and displays professional UI
✅ Search functionality works with phone and email
✅ Webhook triggers automatic candidate loading
✅ Real Segment data displayed in profile
✅ AMN Healthcare branding throughout
✅ Responsive layout for desktop use
✅ All sections render correctly
✅ Error states handled gracefully

## 📚 Additional Resources

- `README.md` - Complete setup documentation
- `QUICK_START.md` - Quick testing guide
- `test-webhook.sh` - Webhook simulation script
- `/server/src/` - Backend source code
- `/dashboard/src/` - Frontend source code

## 🚀 Next Steps

1. ✅ **Test the demo flow** using this guide
2. 🔄 **Configure Memory Store ID** for AI insights
3. 🔄 **Set up Segment webhook** in production
4. 🔄 **Deploy to production** (Railway + Vercel)
5. 🎉 **Share with AMN Healthcare team**!
