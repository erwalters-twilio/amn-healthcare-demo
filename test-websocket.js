import WebSocket from 'ws';

const ws = new WebSocket('wss://amn-healthcare-demo-production.up.railway.app');

ws.on('open', () => {
  console.log('✅ WebSocket connected!');

  // Send a test message like Twilio would
  ws.send(JSON.stringify({
    event: 'start',
    streamSid: 'MZ-test',
    callSid: 'CA-test',
    start: {
      customParameters: {
        phone: '+15555555555',
        source: 'test'
      }
    }
  }));
});

ws.on('message', (data) => {
  console.log('📨 Received:', data.toString());
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
});

ws.on('close', (code, reason) => {
  console.log(`🔌 Connection closed: ${code} - ${reason}`);
  process.exit(0);
});

setTimeout(() => {
  console.log('⏱️  Test timeout, closing...');
  ws.close();
}, 5000);
