# SendGrid Job Placement Congratulations Email

This folder contains a complete SendGrid dynamic template setup for sending branded job placement congratulations emails to candidates when they are successfully placed by AMN Healthcare.

## Files

- **`job-placement-congratulations.html`** - SendGrid dynamic template HTML with AMN branding
- **`send-placement-email.js`** - Node.js module for sending placement emails programmatically
- **`segment-placement-destination.js`** - Segment destination function that triggers emails automatically
- **`README.md`** - This setup guide

## Features

✅ **AMN Healthcare Branding** - Professional email with AMN logo and brand colors  
✅ **Dynamic Personalization** - Uses Handlebars syntax for candidate-specific details  
✅ **Responsive Design** - Mobile-friendly layout that works across all devices  
✅ **Segment Integration** - Automatically triggered by placement events  
✅ **Tracking & Analytics** - Built-in open/click tracking and custom event metadata  

## Setup Instructions

### Step 1: Create SendGrid Dynamic Template

1. **Log in to SendGrid Console**
   - Go to https://app.sendgrid.com/
   - Navigate to **Email API** > **Dynamic Templates**

2. **Create New Template**
   - Click **Create a Dynamic Template**
   - Name: `Job Placement Congratulations`
   - Click **Create**

3. **Add Template Version**
   - Click **Add Version**
   - Choose **Code Editor**
   - Copy the contents of `job-placement-congratulations.html`
   - Paste into the code editor
   - Click **Save**

4. **Configure Template Settings**
   - **Subject Line**: `🎉 Congratulations on Your New Position, {{firstName}}!`
   - **Plain Text**: Enable auto-generation or add custom plain text
   - Click **Settings** to save

5. **Get Template ID**
   - Copy the Template ID (starts with `d-`)
   - You'll need this for configuration

### Step 2: Configure Environment Variables

Add these to your `.env` file:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
SENDGRID_PLACEMENT_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=placements@amnhealthcare.com
SENDGRID_FROM_NAME=AMN Healthcare
```

### Step 3A: Integrate with Segment (Recommended)

#### Deploy Segment Destination Function

1. **Create Destination Function in Segment**
   - Log in to Segment workspace
   - Go to **Connections** > **Catalog** > **Functions**
   - Click **New Function** > **Destination**
   - Name: `AMN Placement Email Sender`

2. **Configure Function**
   - Copy contents of `segment-placement-destination.js`
   - Paste into the function editor
   - Click **Configure** and add:
     - **SendGrid API Key**: Your SendGrid API key
     - **Template ID**: Your dynamic template ID (d-xxxxx)
     - **From Email**: `placements@amnhealthcare.com`
     - **From Name**: `AMN Healthcare`

3. **Connect to Source**
   - Go to your Segment source (e.g., "AMN Website" or "Recruiter System")
   - Add the destination function
   - Enable it

4. **Test the Integration**
   ```bash
   # Send a test event
   analytics.track('Job Placement Confirmed', {
     email: 'candidate@example.com',
     firstName: 'Sarah',
     lastName: 'Johnson',
     jobTitle: 'Registered Nurse - ICU',
     specialty: 'Critical Care Nursing',
     facility: 'City General Hospital',
     location: 'San Francisco, CA',
     startDate: 'August 15, 2026',
     salary: '$95,000 - $110,000 annually',
     recruiterName: 'Emily Rodriguez',
     recruiterEmail: 'emily.rodriguez@amnhealthcare.com',
     recruiterPhone: '(555) 123-4567',
     portalUrl: 'https://portal.amnhealthcare.com/placement/12345'
   });
   ```

### Step 3B: Direct Integration (Alternative)

If not using Segment, integrate directly in your Node.js application:

```javascript
import { sendPlacementEmail } from './sendgrid-templates/send-placement-email.js';

// When a placement is confirmed
const placementData = {
  email: 'candidate@example.com',
  firstName: 'Sarah',
  lastName: 'Johnson',
  jobTitle: 'Registered Nurse - ICU',
  specialty: 'Critical Care Nursing',
  facility: 'City General Hospital',
  location: 'San Francisco, CA',
  startDate: 'August 15, 2026',
  salary: '$95,000 - $110,000 annually',
  recruiterName: 'Emily Rodriguez',
  recruiterEmail: 'emily.rodriguez@amnhealthcare.com',
  recruiterPhone: '(555) 123-4567',
  portalUrl: 'https://portal.amnhealthcare.com/placement/12345'
};

try {
  const result = await sendPlacementEmail(placementData);
  console.log('Email sent:', result);
} catch (error) {
  console.error('Failed to send email:', error);
}
```

## Template Variables

The dynamic template uses these Handlebars variables:

### Required Variables
- `{{firstName}}` - Candidate first name
- `{{email}}` - Candidate email address
- `{{jobTitle}}` - Position/job title

### Optional Variables
- `{{lastName}}` - Candidate last name
- `{{specialty}}` - Medical specialty or profession
- `{{facility}}` - Facility or hospital name
- `{{location}}` - City and state
- `{{startDate}}` - Assignment start date
- `{{salary}}` - Compensation details
- `{{recruiterName}}` - Assigned recruiter name
- `{{recruiterEmail}}` - Recruiter email
- `{{recruiterPhone}}` - Recruiter phone number
- `{{portalUrl}}` - Link to placement portal
- `{{year}}` - Current year (auto-generated)

## Segment Event Structure

### Event Name
Use one of these event names to trigger the email:
- `Job Placement Confirmed`
- `Candidate Placed`
- `Placement Accepted`
- `Offer Accepted`

### Event Properties
```javascript
{
  event: 'Job Placement Confirmed',
  userId: 'user_12345',
  properties: {
    // Recipient info
    email: 'candidate@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    
    // Job details
    jobTitle: 'Registered Nurse - ICU',
    specialty: 'Critical Care Nursing',
    facility: 'City General Hospital',
    location: 'San Francisco, CA',
    startDate: 'August 15, 2026',
    salary: '$95,000 - $110,000 annually',
    
    // Recruiter info
    recruiterName: 'Emily Rodriguez',
    recruiterEmail: 'emily.rodriguez@amnhealthcare.com',
    recruiterPhone: '(555) 123-4567',
    
    // Portal link
    portalUrl: 'https://portal.amnhealthcare.com/placement/12345'
  },
  timestamp: '2026-07-07T10:30:00Z'
}
```

## Testing

### Test in Sandbox Mode

```javascript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const message = {
  to: 'test@example.com',
  from: 'placements@amnhealthcare.com',
  templateId: 'd-xxxxxxxxxxxxx',
  dynamicTemplateData: {
    firstName: 'Test',
    jobTitle: 'Test Position',
    specialty: 'Testing',
    recruiterName: 'Test Recruiter',
    recruiterEmail: 'test@amnhealthcare.com',
    portalUrl: 'https://test.amnhealthcare.com',
    year: 2026
  },
  mailSettings: {
    sandboxMode: { enable: true } // Validates without sending
  }
};

const response = await sgMail.send(message);
console.log('Sandbox test:', response.statusCode); // Should be 200
```

### Send Test Email

```bash
# Using the Node.js module
node -e "
import('./sendgrid-templates/send-placement-email.js').then(m => {
  m.sendPlacementEmail({
    email: 'your-test-email@example.com',
    firstName: 'Test',
    jobTitle: 'Test Nurse Position',
    specialty: 'Testing',
    recruiterName: 'Test Recruiter',
    recruiterEmail: 'test@amnhealthcare.com'
  });
});
"
```

## Tracking & Analytics

### SendGrid Dashboard
- View delivery stats in SendGrid Console > **Activity**
- Filter by category: `placement`
- Track opens, clicks, bounces, and spam reports

### Custom Args for Webhook Events
The email includes these custom args for webhook tracking:
- `event_type` - Segment event name
- `candidate_email` - Recipient email
- `job_title` - Position title
- `segment_user_id` - Segment user ID
- `timestamp` - Event timestamp

### Setup Event Webhook (Optional)
To track delivery events back to your system:

1. Go to SendGrid Console > **Settings** > **Mail Settings** > **Event Webhook**
2. Add your webhook URL: `https://your-domain.com/webhooks/sendgrid`
3. Select events to track: Delivered, Opened, Clicked, Bounced
4. The webhook payload will include the custom args for correlation

## Troubleshooting

### Email Not Sending
1. Check SendGrid API key has Mail Send permissions
2. Verify template ID is correct (starts with `d-`)
3. Ensure from email is verified in SendGrid
4. Check SendGrid Activity feed for error details

### Template Not Rendering
1. Verify all required variables are provided
2. Check for typos in Handlebars variable names
3. Test in SendGrid template editor with test data
4. Review SendGrid logs for template errors

### Segment Integration Issues
1. Verify destination function is enabled
2. Check function logs in Segment debugger
3. Ensure event name matches exactly
4. Confirm settings (API key, template ID) are configured

## AMN Logo

The template uses AMN Healthcare's logo. Make sure to:
1. Upload `amn-logo.jpeg` to a public CDN or use AMN's official logo URL
2. Update the `<img src>` in the template HTML
3. Current placeholder: `https://amnhealthcare.com/siteassets/amn-logo-white.png`

## Customization

### Update Brand Colors
Edit these CSS variables in `job-placement-congratulations.html`:
- Primary blue: `#003057`
- Secondary blue: `#0066cc`
- Light blue: `#e8f4f8`

### Modify Email Copy
Update the text in the HTML template sections:
- Main message
- Next steps list
- Closing message
- Footer text

### Add More Variables
1. Add new Handlebars variables to HTML template: `{{newVariable}}`
2. Update `dynamicTemplateData` in the integration code
3. Pass new properties in Segment events

## Best Practices

✅ **Always confirm recipient before sending** - Email is irreversible  
✅ **Test with sandbox mode first** - Validate before real sends  
✅ **Keep template data complete** - Provide all required variables  
✅ **Monitor delivery rates** - Check SendGrid analytics regularly  
✅ **Handle errors gracefully** - Log failures and retry if needed  
✅ **Respect suppressions** - Never send to unsubscribed addresses  

## Support

For issues or questions:
- **SendGrid Docs**: https://docs.sendgrid.com
- **Segment Docs**: https://segment.com/docs/connections/destinations/catalog/functions/
- **AMN Healthcare**: Contact your team lead or support

## License

© 2026 AMN Healthcare. Internal use only.
