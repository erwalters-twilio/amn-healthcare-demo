# Segment Event Examples for Placement Emails

This document provides example Segment events that will trigger the job placement congratulations email.

## Event Names

The Segment destination function listens for these event names:
- `Job Placement Confirmed`
- `Candidate Placed`
- `Placement Accepted`
- `Offer Accepted`

## Full Example Event

```javascript
analytics.track('Job Placement Confirmed', {
  // Recipient Information (Required)
  email: 'sarah.johnson@email.com',
  firstName: 'Sarah',
  lastName: 'Johnson',
  
  // Job Details (Required)
  jobTitle: 'Registered Nurse - ICU',
  
  // Job Details (Optional but Recommended)
  specialty: 'Critical Care Nursing',
  facility: 'City General Hospital',
  location: 'San Francisco, CA',
  startDate: 'August 15, 2026',
  salary: '$95,000 - $110,000 annually',
  
  // Recruiter Information (Recommended)
  recruiterName: 'Emily Rodriguez',
  recruiterEmail: 'emily.rodriguez@amnhealthcare.com',
  recruiterPhone: '(555) 123-4567',
  
  // Portal Link (Optional)
  portalUrl: 'https://portal.amnhealthcare.com/placement/12345',
  
  // Additional Metadata (Optional)
  placementId: 'PLC-2026-12345',
  applicationId: 'APP-2026-67890',
  contractLength: '13 weeks',
  shiftType: 'Night Shift (7p-7a)',
  department: 'Intensive Care Unit'
}, {
  userId: 'user_sarah_johnson_123'
});
```

## Minimal Example

This is the minimum data required to send a placement email:

```javascript
analytics.track('Job Placement Confirmed', {
  email: 'candidate@email.com',
  firstName: 'John',
  jobTitle: 'Travel Nurse'
});
```

## Using User Traits

You can also leverage user traits from Segment profiles:

```javascript
// First, identify the user with traits
analytics.identify('user_12345', {
  email: 'sarah.johnson@email.com',
  firstName: 'Sarah',
  lastName: 'Johnson',
  profession: 'Registered Nurse',
  specialty: 'Critical Care',
  city: 'Los Angeles',
  phone: '+14155551234'
});

// Then track the placement event
// The destination function will merge properties + traits
analytics.track('Job Placement Confirmed', {
  jobTitle: 'Registered Nurse - ICU',
  facility: 'City General Hospital',
  location: 'San Francisco, CA',
  startDate: 'August 15, 2026',
  salary: '$95,000 - $110,000 annually',
  recruiterName: 'Emily Rodriguez',
  recruiterEmail: 'emily.rodriguez@amnhealthcare.com'
}, {
  userId: 'user_12345'
});
```

## Real-World Integration Examples

### Example 1: After Offer Acceptance in Application Flow

```javascript
// When candidate accepts offer in your application
async function handleOfferAcceptance(candidateId, placementDetails) {
  const candidate = await db.candidates.findById(candidateId);
  const recruiter = await db.recruiters.findById(placementDetails.recruiterId);
  
  // Track in Segment
  analytics.track('Offer Accepted', {
    email: candidate.email,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    jobTitle: placementDetails.position,
    specialty: candidate.specialty,
    facility: placementDetails.facilityName,
    location: `${placementDetails.city}, ${placementDetails.state}`,
    startDate: formatDate(placementDetails.startDate),
    salary: formatSalary(placementDetails.salary),
    recruiterName: `${recruiter.firstName} ${recruiter.lastName}`,
    recruiterEmail: recruiter.email,
    recruiterPhone: recruiter.phone,
    portalUrl: `https://portal.amnhealthcare.com/placement/${placementDetails.id}`
  }, {
    userId: candidateId
  });
  
  // Email will be automatically sent by Segment destination function
}
```

### Example 2: Batch Placement Processing

```javascript
// When processing multiple placements (e.g., weekly placement confirmations)
async function processWeeklyPlacements() {
  const placements = await db.placements.findConfirmedThisWeek();
  
  for (const placement of placements) {
    const candidate = await db.candidates.findById(placement.candidateId);
    const job = await db.jobs.findById(placement.jobId);
    const recruiter = await db.recruiters.findById(placement.recruiterId);
    
    analytics.track('Job Placement Confirmed', {
      email: candidate.email,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      jobTitle: job.title,
      specialty: job.specialty,
      facility: job.facility.name,
      location: `${job.facility.city}, ${job.facility.state}`,
      startDate: placement.startDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      salary: `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()} annually`,
      recruiterName: `${recruiter.firstName} ${recruiter.lastName}`,
      recruiterEmail: recruiter.email,
      recruiterPhone: recruiter.phone,
      portalUrl: `https://portal.amnhealthcare.com/placement/${placement.id}`,
      placementId: placement.id,
      contractLength: placement.contractLength
    }, {
      userId: candidate.segmentId
    });
    
    // Rate limit to avoid SendGrid throttling
    await sleep(100);
  }
}
```

### Example 3: CRM Integration (Salesforce, HubSpot, etc.)

```javascript
// When placement status changes in CRM
async function onPlacementStatusChange(crmEvent) {
  if (crmEvent.status !== 'Placed') return;
  
  // Fetch data from CRM
  const contact = await crmClient.contacts.get(crmEvent.contactId);
  const opportunity = await crmClient.opportunities.get(crmEvent.opportunityId);
  const owner = await crmClient.users.get(opportunity.ownerId);
  
  // Map CRM fields to Segment event
  analytics.track('Candidate Placed', {
    email: contact.email,
    firstName: contact.firstName,
    lastName: contact.lastName,
    jobTitle: opportunity.jobTitle,
    specialty: contact.specialty || opportunity.specialty,
    facility: opportunity.facilityName,
    location: opportunity.location,
    startDate: opportunity.startDate,
    salary: opportunity.compensation,
    recruiterName: owner.name,
    recruiterEmail: owner.email,
    recruiterPhone: owner.phone,
    portalUrl: `https://portal.amnhealthcare.com/placement/${opportunity.id}`,
    // Additional CRM metadata
    crmContactId: contact.id,
    crmOpportunityId: opportunity.id,
    closeDate: opportunity.closeDate
  }, {
    userId: contact.segmentUserId || contact.email
  });
}
```

## Testing Events

### Test Event for Development

```javascript
// Send test event with clearly fake data
analytics.track('Job Placement Confirmed', {
  email: 'test+placement@amnhealthcare.com', // Use + addressing
  firstName: 'Test',
  lastName: 'Candidate',
  jobTitle: '[TEST] Registered Nurse - ICU',
  specialty: 'Testing',
  facility: 'Test Hospital',
  location: 'Test City, CA',
  startDate: 'TBD',
  recruiterName: 'Test Recruiter',
  recruiterEmail: 'test@amnhealthcare.com'
}, {
  userId: 'test_user_' + Date.now()
});
```

### Test Event in Segment Debugger

1. Go to Segment workspace > Connections > Sources
2. Click on your source (e.g., "Website" or "Backend")
3. Click "Debugger" tab
4. Manually send a test event:

```json
{
  "type": "track",
  "event": "Job Placement Confirmed",
  "userId": "test_user_123",
  "properties": {
    "email": "your-email@example.com",
    "firstName": "Test",
    "lastName": "User",
    "jobTitle": "Test Nurse Position",
    "specialty": "Testing",
    "recruiterName": "Test Recruiter",
    "recruiterEmail": "test@amnhealthcare.com"
  }
}
```

## Property Mapping Reference

| SendGrid Template Variable | Segment Event Property | Fallback | Required |
|---------------------------|------------------------|----------|----------|
| `{{firstName}}` | `properties.firstName` or `traits.firstName` | "Valued Professional" | ✅ |
| `{{lastName}}` | `properties.lastName` or `traits.lastName` | "" | ❌ |
| `{{email}}` | `properties.email` or `traits.email` or `userId` | - | ✅ |
| `{{jobTitle}}` | `properties.jobTitle` or `properties.job_title` | - | ✅ |
| `{{specialty}}` | `properties.specialty` or `traits.specialty` | "Healthcare" | ❌ |
| `{{facility}}` | `properties.facility` or `properties.facilityName` | null | ❌ |
| `{{location}}` | `properties.location` or `properties.city` | null | ❌ |
| `{{startDate}}` | `properties.startDate` or `properties.start_date` | "To be confirmed" | ❌ |
| `{{salary}}` | `properties.salary` or `properties.compensation` | null | ❌ |
| `{{recruiterName}}` | `properties.recruiterName` | "Your AMN Recruiter" | ❌ |
| `{{recruiterEmail}}` | `properties.recruiterEmail` | "support@amnhealthcare.com" | ❌ |
| `{{recruiterPhone}}` | `properties.recruiterPhone` | null | ❌ |
| `{{portalUrl}}` | `properties.portalUrl` | default portal URL | ❌ |

## Alternative Property Names

The destination function supports multiple naming conventions:

```javascript
// All of these work for job title
jobTitle: "Nurse"
job_title: "Nurse"
position: "Nurse"

// All of these work for recruiter name
recruiterName: "Emily"
recruiter_name: "Emily"

// All of these work for start date
startDate: "Aug 15, 2026"
start_date: "Aug 15, 2026"
```

## Custom Event Names

To add more event names that trigger emails, update the `PLACEMENT_EVENTS` array in `segment-placement-destination.js`:

```javascript
const PLACEMENT_EVENTS = [
  'Job Placement Confirmed',
  'Candidate Placed',
  'Placement Accepted',
  'Offer Accepted',
  // Add your custom event names here
  'Contract Signed',
  'Onboarding Started'
];
```

## Debugging

### Check if Event Reached Destination

1. Go to Segment > Connections > Destinations
2. Click on your "AMN Placement Email Sender" function
3. Click "Debugger" tab
4. Look for your event in the event stream
5. Check function logs for errors

### Common Issues

**Email not sending:**
- Event name doesn't match exactly (case-sensitive)
- Missing required fields (email, firstName, jobTitle)
- Invalid email address format
- SendGrid API key not configured in destination settings

**Wrong data in email:**
- Check property names match exactly
- Verify traits are available if relying on them
- Use Segment debugger to inspect raw event payload

**Destination function errors:**
- Check function logs in Segment console
- Verify SendGrid template ID is correct
- Confirm API key has Mail Send permissions

## Best Practices

✅ **Use consistent event names** - Pick one and stick with it  
✅ **Include all recommended fields** - Better email experience  
✅ **Format dates consistently** - "Month DD, YYYY" format  
✅ **Validate email addresses** - Prevent bounces  
✅ **Test with real data** - Use production-like test data  
✅ **Monitor in Segment debugger** - Watch events flow through  
✅ **Check SendGrid activity** - Verify delivery  

## Support

For issues with Segment events:
- Check Segment workspace debugger
- Review destination function logs
- Verify event schema matches examples

For SendGrid delivery issues:
- Check SendGrid Activity feed
- Review bounce/spam reports
- Verify sender authentication
