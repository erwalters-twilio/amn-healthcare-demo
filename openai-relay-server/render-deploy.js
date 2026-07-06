import https from 'https';
import { config } from 'dotenv';

config();

const RENDER_API_KEY = process.env.RENDER_API_KEY;

if (!RENDER_API_KEY) {
  console.error('Error: RENDER_API_KEY environment variable not set');
  console.log('\nTo get your API key:');
  console.log('1. Go to https://dashboard.render.com/account');
  console.log('2. Scroll to "API Keys"');
  console.log('3. Create a new API key');
  console.log('4. Set it: export RENDER_API_KEY=your_key_here');
  process.exit(1);
}

function getServiceConfig(ownerId) {
  return {
    type: 'web_service',
    name: 'openai-realtime-relay',
    ownerId: ownerId,
    repo: 'https://github.com/erwalters-twilio/amn-healthcare-demo',
    autoDeploy: 'yes',
    branch: 'main',
    rootDir: 'openai-relay-server',
    serviceDetails: {
      env: 'node',
      buildCommand: 'npm install',
      startCommand: 'node index.js',
      plan: 'free',
      region: 'oregon',
      healthCheckPath: '/health',
      envVars: [
        { key: 'NODE_ENV', value: 'production' },
        { key: 'PORT', value: '10000' },
        { key: 'LOG_LEVEL', value: 'info' },
        { key: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY || '' },
        { key: 'SEGMENT_PROFILE_TOKEN', value: process.env.SEGMENT_PROFILE_TOKEN || '' },
        { key: 'SEGMENT_SPACE_ID', value: process.env.SEGMENT_SPACE_ID || '' },
      ],
    },
  };
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.render.com',
      port: 443,
      path: `/v1${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(response)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function deploy() {
  try {
    console.log('Fetching account information...\n');

    // Get owner ID first
    const owners = await makeRequest('GET', '/owners');
    if (!owners || owners.length === 0) {
      throw new Error('No Render accounts found. Please create an account at https://dashboard.render.com');
    }

    const owner = owners[0].owner;
    console.log(`Using account: ${owner.name || owner.email} (${owner.id})\n`);

    console.log('Creating service on Render...\n');

    const serviceConfig = getServiceConfig(owner.id);
    const service = await makeRequest('POST', '/services', serviceConfig);
    
    console.log('✅ Service created successfully!');
    console.log(`   Service ID: ${service.service.id}`);
    console.log(`   Name: ${service.service.name}`);
    console.log(`   URL: https://${service.service.slug}.onrender.com`);
    console.log(`\n⏳ Deployment in progress...`);
    console.log(`   View status: https://dashboard.render.com/web/${service.service.id}`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Wait for deployment to complete (~2-3 minutes)`);
    console.log(`   2. Update Vercel env: AI_WEBSOCKET_URL=wss://${service.service.slug}.onrender.com`);
    console.log(`   3. Redeploy Vercel: cd ../amn-demo && vercel --prod`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Your API key may be invalid. Please check it.');
    } else if (error.message.includes('already exists')) {
      console.log('\n💡 Service already exists. Checking existing services...');
      try {
        const services = await makeRequest('GET', '/services?limit=20');
        const existing = services.find(s => s.service.name === 'openai-realtime-relay');
        if (existing) {
          console.log(`\n   Found: https://${existing.service.slug}.onrender.com`);
        }
      } catch (e) {
        console.error('Could not list services:', e.message);
      }
    }
    
    process.exit(1);
  }
}

deploy();
