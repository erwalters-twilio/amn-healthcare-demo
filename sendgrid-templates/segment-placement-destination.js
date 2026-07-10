/**
 * Segment Destination Function - Job Placement Email Trigger
 *
 * Automatically sends a congratulations email when a candidate is placed.
 * Listens for "Job Placement Confirmed" or "Candidate Placed" events and
 * sends a SendGrid email using the dynamic template.
 *
 * @param {SegmentTrackEvent} event - The Segment track event
 * @param {Object} settings - Function settings (webhookUrl, sendgridApiKey, templateId)
 */
async function onTrack(event, settings) {
  // Event names that trigger placement emails
  const PLACEMENT_EVENTS = [
    'Job Placement Confirmed',
    'Candidate Placed',
    'Placement Accepted',
    'Offer Accepted'
  ];

  // Only process placement-related events
  if (!PLACEMENT_EVENTS.includes(event.event)) {
    console.log(`Ignoring event: ${event.event}`);
    return;
  }

  const { sendgridApiKey, templateId, fromEmail, fromName } = settings;

  if (!sendgridApiKey) {
    throw new Error('SendGrid API Key is not configured in settings');
  }

  if (!templateId) {
    throw new Error('SendGrid Template ID is not configured in settings');
  }

  console.log(`Processing placement event: ${event.event}`);

  // Extract data from event
  const properties = event.properties || {};
  const traits = event.traits || {};

  // Build recipient data
  const recipient = {
    email: properties.email || traits.email || event.userId,
    firstName: properties.firstName || traits.firstName || traits.first_name || 'Valued Professional',
    lastName: properties.lastName || traits.lastName || traits.last_name || '',
  };

  if (!recipient.email || !recipient.email.includes('@')) {
    throw new Error(`Invalid or missing email address: ${recipient.email}`);
  }

  // Build dynamic template data
  const dynamicTemplateData = {
    // Personal info
    firstName: recipient.firstName,
    lastName: recipient.lastName,
    email: recipient.email,

    // Job details
    jobTitle: properties.jobTitle || properties.job_title || properties.position || 'Healthcare Position',
    specialty: properties.specialty || traits.specialty || traits.profession || 'Healthcare',
    facility: properties.facility || properties.facilityName || null,
    location: properties.location || properties.city || traits.city || null,
    startDate: properties.startDate || properties.start_date || 'To be confirmed',
    salary: properties.salary || properties.compensation || null,

    // Recruiter info
    recruiterName: properties.recruiterName || properties.recruiter_name || 'Your AMN Healthcare Recruiter',
    recruiterEmail: properties.recruiterEmail || properties.recruiter_email || 'support@amnhealthcare.com',
    recruiterPhone: properties.recruiterPhone || properties.recruiter_phone || null,

    // Portal and metadata
    portalUrl: properties.portalUrl || properties.portal_url || 'https://www.amnhealthcare.com/portal',
    year: new Date().getFullYear(),
  };

  // Build SendGrid API request
  const emailPayload = {
    personalizations: [
      {
        to: [
          {
            email: recipient.email,
            name: `${recipient.firstName} ${recipient.lastName}`.trim(),
          },
        ],
        dynamic_template_data: dynamicTemplateData,
      },
    ],
    from: {
      email: fromEmail || 'placements@amnhealthcare.com',
      name: fromName || 'AMN Healthcare',
    },
    template_id: templateId,
    categories: ['placement', 'transactional', 'congratulations'],
    custom_args: {
      event_type: event.event,
      segment_user_id: event.userId || '',
      segment_anonymous_id: event.anonymousId || '',
      job_title: dynamicTemplateData.jobTitle,
      timestamp: event.timestamp || new Date().toISOString(),
    },
    tracking_settings: {
      click_tracking: { enable: true },
      open_tracking: { enable: true },
    },
  };

  console.log(`Sending placement email to: ${recipient.email}`);
  console.log(`Position: ${dynamicTemplateData.jobTitle}`);

  // Send to SendGrid
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SendGrid API request failed: ${response.status} - ${errorText}`);
    }

    // SendGrid returns 202 Accepted for queued emails
    console.log('Placement email queued successfully');
    console.log(`Status: ${response.status}`);

    // Get message ID from response header
    const messageId = response.headers.get('x-message-id');

    return {
      success: true,
      statusCode: response.status,
      messageId: messageId,
      recipient: recipient.email,
      jobTitle: dynamicTemplateData.jobTitle,
    };
  } catch (error) {
    console.error('Error sending placement email:', error);
    throw error;
  }
}

/**
 * Optional: Handle identify events to update recipient preferences
 */
async function onIdentify(event, settings) {
  console.log('Identify event received - no action needed for placement emails');
  return;
}

/**
 * Settings configuration for the destination function
 */
const settings = {
  sendgridApiKey: {
    label: 'SendGrid API Key',
    description: 'Your SendGrid API key with Mail Send permissions',
    type: 'string',
    required: true,
  },
  templateId: {
    label: 'Dynamic Template ID',
    description: 'SendGrid dynamic template ID for placement emails (e.g., d-xxxxxxxxxxxxx)',
    type: 'string',
    required: true,
  },
  fromEmail: {
    label: 'From Email Address',
    description: 'Verified sender email address (e.g., placements@amnhealthcare.com)',
    type: 'string',
    required: true,
    default: 'placements@amnhealthcare.com',
  },
  fromName: {
    label: 'From Name',
    description: 'Sender name displayed to recipients',
    type: 'string',
    required: false,
    default: 'AMN Healthcare',
  },
};

module.exports = {
  onTrack,
  onIdentify,
  settings,
};
