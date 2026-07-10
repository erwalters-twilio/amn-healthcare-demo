# Segment Destination Function - AMN Recruiter Dashboard

This Segment Destination Function automatically updates the recruiter dashboard when a "Call Transferred to Recruiter" event is received.

## Setup Instructions

### 1. Deploy the Dashboard to Vercel

1. Push the code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Connect your repository to Vercel
3. Configure environment variables in Vercel:
   - `SEGMENT_PROFILE_TOKEN` - Your Segment Profile API token
   - `SEGMENT_SPACE_ID` - Your Segment Space ID
   - `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
   - `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
   - `MEMORY_STORE_ID` - Your Recall memory store ID
   - `MEMORY_API_KEY` - Your Recall API key

4. Deploy and note your Vercel URL (e.g., `https://your-app.vercel.app`)

### 2. Create the Segment Destination Function

1. In your Segment workspace, go to **Connections > Catalog > Functions**
2. Click **New Function** and select **Destination**
3. Name it "AMN Recruiter Dashboard Webhook"
4. Copy the code from `destination-function.js` into the function editor
5. Click **Configure** and add your Vercel webhook URL as a setting:
   - Setting name: `webhookUrl`
   - Label: "Webhook URL"
   - Description: "Your Vercel deployment URL + /webhooks/segment"
   - Type: String
   - Required: Yes
   - Example: `https://your-app.vercel.app/webhooks/segment`

### 3. Connect the Function to Your Source

1. After saving the function, click **Connect Destination**
2. Select your source (the one sending "Call Transferred to Recruiter" events)
3. Configure the webhook URL setting with your Vercel deployment URL
4. Enable the destination

### 4. Test the Integration

Send a test "Call Transferred to Recruiter" event with the following structure:

```json
{
  "anonymousId": "+13304027149",
  "event": "Call Transferred to Recruiter",
  "properties": {
    "phone": "+13304027149",
    "from": "+13304027149"
  }
}
```

The dashboard should automatically load the candidate profile!

## Event Structure

The destination function expects events with this structure:

- **Event Name**: `Call Transferred to Recruiter` (exact match)
- **anonymousId**: The candidate's phone number (used as primary identifier)
- **properties.phone**: Candidate phone number (fallback identifier)

## How It Works

1. Segment receives "Call Transferred to Recruiter" event
2. Destination function forwards event to your Vercel API webhook
3. Backend fetches candidate data from Segment, Twilio, and Memory
4. Data is cached as "current candidate"
5. Dashboard automatically displays the profile when recruiter opens it
