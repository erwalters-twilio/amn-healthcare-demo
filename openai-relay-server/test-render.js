#!/usr/bin/env node
import WebSocket from 'ws';

console.log('Testing Render WebSocket connection...');
console.log('URL: wss://openai-realtime-relay.onrender.com');

const ws = new WebSocket('wss://openai-realtime-relay.onrender.com', {
  headers: {
    'x-twilio-call-sid': 'TEST123',
  },
});

ws.on('open', () => {
  console.log('✅ WebSocket connected successfully!');
  console.log('Sending test message...');

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
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`Connection closed: ${code} ${reason || ''}`);
  process.exit(code === 1000 ? 0 : 1);
});

setTimeout(() => {
  console.log('⏱️  Connection timeout');
  process.exit(1);
}, 10000);
