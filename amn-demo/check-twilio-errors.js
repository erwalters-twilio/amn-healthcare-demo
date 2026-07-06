import https from 'https';

const TWILIO_ACCOUNT_SID = 'AC6e1ad75ffbbf536b3f5b32b817d83bb8';
const TWILIO_AUTH_TOKEN = '0db5aacc1e1a7d674ee141282d193628';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: path,
      method: 'GET',
      auth: `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

console.log('Fetching recent calls...\n');

const callsData = await makeRequest(`/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json?PageSize=3`);

if (callsData.calls && callsData.calls.length > 0) {
  const lastCall = callsData.calls[0];
  
  console.log('Most recent call:');
  console.log(`  SID: ${lastCall.sid}`);
  console.log(`  From: ${lastCall.from} → To: ${lastCall.to}`);
  console.log(`  Status: ${lastCall.status}`);
  console.log(`  Direction: ${lastCall.direction}`);
  console.log(`  Start: ${lastCall.start_time}`);
  console.log(`\nFetching call events/errors...\n`);
  
  // Get events for this call
  const events = await makeRequest(`/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls/${lastCall.sid}/Events.json`);
  
  if (events.events && events.events.length > 0) {
    console.log('Call Events:');
    events.events.forEach(event => {
      console.log(`  - ${event.name}: ${event.description || 'No description'}`);
    });
  } else {
    console.log('No events found for this call.');
  }
  
  // Get notifications (errors/warnings)
  console.log('\nFetching call notifications (errors)...\n');
  const notifications = await makeRequest(`/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls/${lastCall.sid}/Notifications.json`);
  
  if (notifications.notifications && notifications.notifications.length > 0) {
    console.log('Call Notifications/Errors:');
    notifications.notifications.forEach(notif => {
      console.log(`  ❌ ${notif.error_code}: ${notif.message_text}`);
      console.log(`     More info: ${notif.more_info}`);
    });
  } else {
    console.log('No notifications/errors found.');
  }
  
} else {
  console.log('No calls found.');
}
