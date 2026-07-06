#!/usr/bin/env node
import WebSocket from 'ws';

console.log('Testing Railway WebSocket connection...');
console.log('URL: wss://amn-healthcare-demo-production.up.railway.app');

const ws = new WebSocket('wss://amn-healthcare-demo-production.up.railway.app', {
  headers: {
    'x-twilio-call-sid': 'TEST123',
  },
});

ws.on('open', () => {
  console.log('✅ WebSocket connected successfully!');
  console.log('Sending test message...');

  // Send a Twilio-style start message
  const testMessage = {
    event: 'start',
    streamSid: 'TEST_STREAM',
    start: {
      customParameters: {
        phone: '+13304027149',
      },
    },
  };

  ws.send(JSON.stringify(testMessage));

  setTimeout(() => {
    console.log('Closing connection...');
    ws.close();
  }, 2000);
});

ws.on('message', (data) => {
  console.log('📨 Received message:', data.toString());
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  console.error('Full error:', error);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`Connection closed: ${code} ${reason || ''}`);
  process.exit(code === 1000 ? 0 : 1);
});

setTimeout(() => {
  console.log('⏱️  Connection timeout - Railway not responding');
  process.exit(1);
}, 10000);
