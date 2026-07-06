import twilio from 'twilio';
import { config } from 'dotenv';

config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

console.log('Fetching recent calls...\n');

const calls = await client.calls.list({ limit: 3 });

for (const call of calls) {
  console.log(`Call SID: ${call.sid}`);
  console.log(`  From: ${call.from} → To: ${call.to}`);
  console.log(`  Status: ${call.status}`);
  console.log(`  Direction: ${call.direction}`);
  console.log(`  Start: ${call.startTime}`);
  
  // Fetch detailed call info
  const details = await client.calls(call.sid).fetch();
  console.log(`  TwiML URL: ${details.uri}`);
  console.log('');
}
