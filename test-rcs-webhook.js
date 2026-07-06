#!/usr/bin/env node

// Test RCS webhook endpoint
const testPayload = {
  MessageSid: 'MM_TEST_123',
  From: '+13304027149',
  To: '+15169087955',
  Body: 'Test message',
  NumMedia: '0',
  MessagingServiceSid: 'MG_TEST',
  ConversationSid: 'CH_TEST',
};

console.log('Testing RCS webhook endpoint...\n');
console.log('URL: https://amn-demo.vercel.app/api/webhooks/twilio-inbound');
console.log('Payload:', testPayload);
console.log('\nSending POST request...\n');

const formData = new URLSearchParams(testPayload);

fetch('https://amn-demo.vercel.app/api/webhooks/twilio-inbound', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Twilio-Signature': 'test_signature', // Will fail validation but we'll see the error
  },
  body: formData.toString(),
})
  .then(response => {
    console.log('Response status:', response.status);
    return response.text();
  })
  .then(body => {
    console.log('Response body:', body);
  })
  .catch(error => {
    console.error('Error:', error);
  });
