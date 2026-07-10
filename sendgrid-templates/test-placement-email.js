/**
 * Test Script for SendGrid Placement Email
 *
 * Run this script to test the placement congratulations email setup.
 *
 * Usage:
 *   node test-placement-email.js [--sandbox] [--email=your@email.com]
 *
 * Options:
 *   --sandbox    Validate without actually sending (returns 200 instead of 202)
 *   --email      Override recipient email (default: test email from .env)
 */

import sgMail from '@sendgrid/mail';
import { config } from 'dotenv';

config();

// Parse command line arguments
const args = process.argv.slice(2);
const useSandbox = args.includes('--sandbox');
const customEmail = args.find(arg => arg.startsWith('--email='))?.split('=')[1];

// Configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const TEMPLATE_ID = process.env.SENDGRID_PLACEMENT_TEMPLATE_ID;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'placements@amnhealthcare.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'AMN Healthcare';
const TEST_EMAIL = customEmail || process.env.TEST_EMAIL || 'test@example.com';

// Validate configuration
if (!SENDGRID_API_KEY) {
  console.error('❌ Error: SENDGRID_API_KEY not found in environment variables');
  console.error('   Add it to your .env file');
  process.exit(1);
}

if (!TEMPLATE_ID) {
  console.error('❌ Error: SENDGRID_PLACEMENT_TEMPLATE_ID not found in environment variables');
  console.error('   Add it to your .env file (e.g., d-xxxxxxxxxxxxx)');
  process.exit(1);
}

sgMail.setApiKey(SENDGRID_API_KEY);

// Test data
const testPlacementData = {
  // Personal info
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: TEST_EMAIL,

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
  portalUrl: 'https://portal.amnhealthcare.com/placement/test-12345',

  // Auto-generated
  year: new Date().getFullYear(),
};

// Build SendGrid message
const message = {
  to: TEST_EMAIL,
  from: {
    email: FROM_EMAIL,
    name: FROM_NAME,
  },
  templateId: TEMPLATE_ID,
  dynamicTemplateData: testPlacementData,

  // Categories for analytics
  categories: ['placement', 'transactional', 'test'],

  // Custom args for tracking
  customArgs: {
    event_type: 'test_placement',
    test: 'true',
    timestamp: new Date().toISOString(),
  },

  // Tracking settings
  trackingSettings: {
    clickTracking: { enable: true },
    openTracking: { enable: true },
  },
};

// Add sandbox mode if requested
if (useSandbox) {
  message.mailSettings = {
    sandboxMode: { enable: true }
  };
}

// Run test
async function runTest() {
  console.log('\n🧪 SendGrid Placement Email Test\n');
  console.log('━'.repeat(50));
  console.log(`Mode:        ${useSandbox ? '🔒 SANDBOX (validate only)' : '📧 LIVE SEND'}`);
  console.log(`Recipient:   ${TEST_EMAIL}`);
  console.log(`From:        ${FROM_NAME} <${FROM_EMAIL}>`);
  console.log(`Template ID: ${TEMPLATE_ID}`);
  console.log('━'.repeat(50));
  console.log('\nTest Data:');
  console.log(`  Candidate:  ${testPlacementData.firstName} ${testPlacementData.lastName}`);
  console.log(`  Position:   ${testPlacementData.jobTitle}`);
  console.log(`  Facility:   ${testPlacementData.facility}`);
  console.log(`  Location:   ${testPlacementData.location}`);
  console.log(`  Start Date: ${testPlacementData.startDate}`);
  console.log(`  Recruiter:  ${testPlacementData.recruiterName}`);
  console.log('━'.repeat(50));

  try {
    console.log('\n⏳ Sending request to SendGrid...\n');

    const [response] = await sgMail.send(message);

    console.log('✅ SUCCESS!\n');
    console.log(`Status Code: ${response.statusCode}`);

    if (useSandbox) {
      console.log('📝 Validation passed (sandbox mode - no email sent)');
    } else {
      console.log('📬 Email queued for delivery (status 202)');
      console.log(`📧 Check ${TEST_EMAIL} for the email`);
    }

    if (response.headers['x-message-id']) {
      console.log(`Message ID: ${response.headers['x-message-id']}`);
    }

    console.log('\n📊 Next Steps:');
    if (useSandbox) {
      console.log('  1. Run without --sandbox flag to send a real test email');
      console.log(`     node test-placement-email.js --email=${TEST_EMAIL}`);
    } else {
      console.log('  1. Check your inbox for the test email');
      console.log('  2. View delivery stats in SendGrid Console > Activity');
      console.log('  3. Search for category "test" to find this email');
    }
    console.log('  4. Deploy Segment destination function for live events');

    console.log('\n━'.repeat(50));
    console.log('✨ Test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ ERROR!\n');
    console.error('Message:', error.message);

    if (error.response) {
      console.error('\nSendGrid Response:');
      console.error('Status:', error.response.statusCode);
      console.error('Body:', JSON.stringify(error.response.body, null, 2));

      // Common error help
      if (error.response.statusCode === 400) {
        console.error('\n💡 Common fixes for 400 errors:');
        console.error('  - Verify template ID is correct (starts with d-)');
        console.error('  - Check all required template variables are provided');
        console.error('  - Ensure email addresses are valid');
      } else if (error.response.statusCode === 401) {
        console.error('\n💡 Common fixes for 401 errors:');
        console.error('  - Check SENDGRID_API_KEY is correct');
        console.error('  - Verify API key has Mail Send permissions');
        console.error('  - Regenerate API key if needed');
      } else if (error.response.statusCode === 403) {
        console.error('\n💡 Common fixes for 403 errors:');
        console.error('  - Verify sender email is authenticated in SendGrid');
        console.error('  - Check domain authentication settings');
        console.error('  - Use a verified sender identity');
      }
    }

    console.log('\n━'.repeat(50));
    console.log('❌ Test failed\n');
    process.exit(1);
  }
}

// Display help if needed
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
SendGrid Placement Email Test Script

Usage:
  node test-placement-email.js [options]

Options:
  --sandbox              Validate template without sending email
  --email=<address>      Override test recipient email
  --help, -h             Show this help message

Examples:
  # Validate in sandbox mode (no email sent)
  node test-placement-email.js --sandbox

  # Send test email to specific address
  node test-placement-email.js --email=your@email.com

  # Send using TEST_EMAIL from .env
  node test-placement-email.js

Environment Variables Required:
  SENDGRID_API_KEY                SendGrid API key
  SENDGRID_PLACEMENT_TEMPLATE_ID  Template ID (d-xxxxx)
  SENDGRID_FROM_EMAIL             Sender email (optional)
  SENDGRID_FROM_NAME              Sender name (optional)
  TEST_EMAIL                      Test recipient (optional)
  `);
  process.exit(0);
}

// Run the test
runTest();
