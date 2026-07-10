import twilio from 'twilio';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.error('❌ Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in .env');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function findFlexWorkspace() {
  const workspaces = await client.taskrouter.v1.workspaces.list({ limit: 20 });

  if (workspaces.length === 0) {
    console.error('❌ No TaskRouter workspaces found. Make sure Flex is activated on this account.');
    process.exit(1);
  }

  console.log(`Found ${workspaces.length} workspace(s):`);
  workspaces.forEach(ws => console.log(`  - "${ws.friendlyName}" (${ws.sid})`));

  // Try common Flex workspace names, then fall back to the first workspace
  const flex =
    workspaces.find(ws => ws.friendlyName === 'Flex Task Assignment') ||
    workspaces.find(ws => ws.friendlyName.toLowerCase().includes('flex')) ||
    workspaces[0];

  console.log(`✅ Using workspace: "${flex.friendlyName}" (${flex.sid})`);
  return flex;
}

async function ensureTaskQueue(workspaceSid) {
  const queues = await client.taskrouter.v1
    .workspaces(workspaceSid)
    .taskQueues
    .list({ limit: 50 });

  const existing = queues.find(q => q.friendlyName === 'AMN Recruiters');
  if (existing) {
    console.log(`✅ TaskQueue already exists: ${existing.sid}`);
    return existing;
  }

  const queue = await client.taskrouter.v1
    .workspaces(workspaceSid)
    .taskQueues
    .create({
      friendlyName: 'AMN Recruiters',
      targetWorkers: '1=1',
      maxReservedWorkers: 5,
    });

  console.log(`✅ Created TaskQueue "AMN Recruiters": ${queue.sid}`);
  return queue;
}

async function ensureWorkflow(workspaceSid, queueSid) {
  const workflows = await client.taskrouter.v1
    .workspaces(workspaceSid)
    .workflows
    .list({ limit: 50 });

  const existing = workflows.find(w => w.friendlyName === 'AMN Transfer to Recruiter');
  if (existing) {
    console.log(`✅ Workflow already exists: ${existing.sid}`);
    return existing;
  }

  const configuration = JSON.stringify({
    task_routing: {
      filters: [
        {
          filter_friendly_name: 'Recruiter Transfer',
          expression: 'type == "recruiter_transfer"',
          targets: [{ queue: queueSid, timeout: 120 }],
        },
      ],
      default_filter: {
        queue: queueSid,
      },
    },
  });

  const workflow = await client.taskrouter.v1
    .workspaces(workspaceSid)
    .workflows
    .create({
      friendlyName: 'AMN Transfer to Recruiter',
      configuration,
    });

  console.log(`✅ Created Workflow "AMN Transfer to Recruiter": ${workflow.sid}`);
  return workflow;
}

async function main() {
  console.log('\n🏥 AMN Healthcare — Flex TaskRouter Setup\n');

  const workspace = await findFlexWorkspace();
  const queue = await ensureTaskQueue(workspace.sid);
  const workflow = await ensureWorkflow(workspace.sid, queue.sid);

  console.log('\n✅ Setup complete! Add these to your amn-demo Vercel environment:\n');
  console.log(`FLEX_WORKFLOW_SID=${workflow.sid}`);
  console.log(`FLEX_WORKSPACE_SID=${workspace.sid}`);
  console.log(`FLEX_QUEUE_SID=${queue.sid}`);
  console.log('\nAlso copy FLEX_WORKFLOW_SID into amn-demo/.env.local for local testing.\n');
}

main().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
