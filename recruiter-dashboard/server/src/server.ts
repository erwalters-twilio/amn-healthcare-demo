import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SegmentService } from './services/SegmentService.js';
import { TwilioService } from './services/TwilioService.js';
import { CacheService } from './services/CacheService.js';
import { CandidateAggregator } from './services/CandidateAggregator.js';
import { createCandidateRouter } from './routes/candidateRouter.js';
import { createSearchRouter } from './routes/searchRouter.js';
import { createWebhookRouter } from './routes/webhookRouter.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize services
const segmentService = new SegmentService();
const twilioService = new TwilioService();
const cacheService = new CacheService();
const aggregator = new CandidateAggregator(segmentService, twilioService);

// Routes
app.use('/api/candidates', createCandidateRouter(aggregator, cacheService));
app.use('/api/search', createSearchRouter(aggregator));
app.use('/webhooks', createWebhookRouter(aggregator, cacheService));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AMN Recruiter Dashboard API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      candidates: '/api/candidates/:identifier',
      current: '/api/candidates/current',
      search: '/api/search?q=query',
      webhook: '/webhooks/segment',
      health: '/webhooks/health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cache: cacheService.getCacheStats()
  });
});

// Cache cleanup interval (every 15 minutes)
setInterval(() => {
  cacheService.clearExpiredCache();
}, 15 * 60 * 1000);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 AMN Recruiter Dashboard API`);
  console.log('='.repeat(60));
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API docs: http://localhost:${PORT}/`);
  console.log('='.repeat(60));
  console.log('Environment:');
  console.log(`- Segment configured: ${!!process.env.SEGMENT_PROFILE_TOKEN}`);
  console.log(`- Twilio configured: ${!!process.env.TWILIO_ACCOUNT_SID}`);
  console.log(`- Memory configured: ${!!process.env.MEMORY_STORE_ID}`);
  console.log('='.repeat(60));
});
