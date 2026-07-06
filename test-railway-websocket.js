import WebSocket from 'ws';

console.log('Testing Railway WebSocket connection...');
console.log('URL: wss://amn-healthcare-demo-production.up.railway.app');

const ws = new WebSocket('wss://amn-healthcare-demo-production.up.railway.app');

ws.on('open', () => {
  console.log('✅ WebSocket connected successfully!');
  console.log('Railway is accepting WebSocket connections.');
  ws.close();
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket connection failed:', error.message);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`Connection closed: ${code}`);
});

setTimeout(() => {
  console.log('⏱️  Connection timeout - Railway not responding');
  process.exit(1);
}, 10000);
