/**
 * SendGrid Job Placement Congratulations Email
 *
 * Sends a branded congratulations email when a candidate is placed in a job.
 * Integrates with Segment events and uses a dynamic template.
 *
 * Usage:
 *   const emailSender = require('./send-placement-email');
 *   await emailSender.sendPlacementEmail(segmentEvent);
 */

import sgMail from '@sendgrid/mail';
import { config } from 'dotenv';

config();

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_TEMPLATE_ID = process.env.SENDGRID_PLACEMENT_TEMPLATE_ID; // e.g., d-xxxxxxxxxxxxx
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'placements@amnhealthcare.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'AMN Healthcare';

if (!SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY environment variable is required');
}

sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Send placement congratulations email using dynamic template
 *
 * @param {Object} placementData - Placement data from Segment event
 * @param {string} placementData.email - Recipient email address
 * @param {string} placementData.firstName - Candidate first name
 * @param {string} placementData.lastName - Candidate last name
 * @param {string} placementData.jobTitle - Job title/position
 * @param {string} placementData.specialty - Specialty (from Segment traits)
 * @param {string} placementData.facility - Facility name (optional)
 * @param {string} placementData.location - Location (city, state)
 * @param {string} placementData.startDate - Start date (formatted)
 * @param {string} placementData.salary - Compensation details (optional)
 * @param {string} placementData.recruiterName - Recruiter name
 * @param {string} placementData.recruiterEmail - Recruiter email
 * @param {string} placementData.recruiterPhone - Recruiter phone (optional)
 * @param {string} placementData.portalUrl - URL to placement portal
 * @returns {Promise<Object>} SendGrid API response
 */
export async function sendPlacementEmail(placementData) {
  // Validate required fields
  const requiredFields = ['email', 'firstName', 'jobTitle'];
  for (const field of requiredFields) {
    if (!placementData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Build dynamic template data
  const dynamicTemplateData = {
    // Personal info
    firstName: placementData.firstName,
    lastName: placementData.lastName,
    email: placementData.email,

    // Job details
    jobTitle: placementData.jobTitle,
    specialty: placementData.specialty || 'Healthcare Professional',
    facility: placementData.facility || null,
    location: placementData.location || null,
    startDate: placementData.startDate || 'To be confirmed',
    salary: placementData.salary || null,

    // Recruiter info
    recruiterName: placementData.recruiterName || 'Your AMN Healthcare Recruiter',
    recruiterEmail: placementData.recruiterEmail || 'support@amnhealthcare.com',
    recruiterPhone: placementData.recruiterPhone || null,

    // Portal and metadata
    portalUrl: placementData.portalUrl || 'https://www.amnhealthcare.com/portal',
    year: new Date().getFullYear(),
  };

  // Construct email message
  const message = {
    to: placementData.email,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    templateId: SENDGRID_TEMPLATE_ID,
    dynamicTemplateData,

    // Add custom args for tracking
    customArgs: {
      event_type: 'job_placement',
      candidate_email: placementData.email,
      job_title: placementData.jobTitle,
      segment_user_id: placementData.userId || '',
      timestamp: new Date().toISOString(),
    },

    // Add categories for analytics
    categories: ['placement', 'transactional', 'congratulations'],

    // Track clicks and opens
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  try {
    console.log(`Sending placement email to ${placementData.email} for position: ${placementData.jobTitle}`);

    const [response] = await sgMail.send(message);

    console.log(`Placement email sent successfully. Status: ${response.statusCode}`);

    return {
      success: true,
      statusCode: response.statusCode,
      messageId: response.headers['x-message-id'],
      recipient: placementData.email,
    };
  } catch (error) {
    console.error('Error sending placement email:', error);

    if (error.response) {
      console.error('SendGrid Error Response:', error.response.body);
    }

    throw error;
  }
}

/**
 * Transform Segment event into placement email data
 *
 * @param {Object} segmentEvent - Segment track event
 * @returns {Object} Placement data for email
 */
export function transformSegmentEvent(segmentEvent) {
  const { properties = {}, userId, traits = {} } = segmentEvent;

  return {
    // User identification
    userId: userId || properties.userId,
    email: properties.email || traits.email,
    firstName: properties.firstName || traits.firstName || traits.first_name,
    lastName: properties.lastName || traits.lastName || traits.last_name,

    // Job details
    jobTitle: properties.jobTitle || properties.job_title || properties.position,
    specialty: properties.specialty || traits.specialty || traits.profession,
    facility: properties.facility || properties.facilityName,
    location: properties.location || properties.city || traits.city,
    startDate: properties.startDate || properties.start_date,
    salary: properties.salary || properties.compensation,

    // Recruiter info
    recruiterName: properties.recruiterName || properties.recruiter_name,
    recruiterEmail: properties.recruiterEmail || properties.recruiter_email,
    recruiterPhone: properties.recruiterPhone || properties.recruiter_phone,

    // Portal link
    portalUrl: properties.portalUrl || properties.portal_url || 'https://www.amnhealthcare.com/portal',
  };
}

/**
 * Send batch placement emails to multiple recipients
 *
 * @param {Array<Object>} placements - Array of placement data objects
 * @returns {Promise<Array>} Array of send results
 */
export async function sendBatchPlacementEmails(placements) {
  const messages = placements.map(placement => {
    const dynamicTemplateData = {
      firstName: placement.firstName,
      lastName: placement.lastName,
      email: placement.email,
      jobTitle: placement.jobTitle,
      specialty: placement.specialty || 'Healthcare Professional',
      facility: placement.facility || null,
      location: placement.location || null,
      startDate: placement.startDate || 'To be confirmed',
      salary: placement.salary || null,
      recruiterName: placement.recruiterName || 'Your AMN Healthcare Recruiter',
      recruiterEmail: placement.recruiterEmail || 'support@amnhealthcare.com',
      recruiterPhone: placement.recruiterPhone || null,
      portalUrl: placement.portalUrl || 'https://www.amnhealthcare.com/portal',
      year: new Date().getFullYear(),
    };

    return {
      to: placement.email,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      templateId: SENDGRID_TEMPLATE_ID,
      dynamicTemplateData,
      customArgs: {
        event_type: 'job_placement',
        candidate_email: placement.email,
        job_title: placement.jobTitle,
      },
      categories: ['placement', 'transactional', 'congratulations'],
    };
  });

  try {
    console.log(`Sending batch of ${messages.length} placement emails`);
    const responses = await sgMail.send(messages);
    console.log(`Batch send completed. ${responses.length} emails queued`);
    return responses;
  } catch (error) {
    console.error('Error sending batch placement emails:', error);
    throw error;
  }
}

// Export for use as a module
export default {
  sendPlacementEmail,
  transformSegmentEvent,
  sendBatchPlacementEmails,
};
