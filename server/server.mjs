// Main Express.js server
// Based on API design specification

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import middleware
import { responseFormatter } from './middleware/response-formatter.mjs';
import { errorHandler } from './middleware/error-handler.mjs';
import rateLimitConfigs from './middleware/rate-limiter.mjs';

// Import routes
import teamsRouter from './routes/teams.mjs';
import membersRouter from './routes/members.mjs';
import availabilityRouter from './routes/availability.mjs';
import rotationRouter from './routes/rotation.mjs';
import contentRouter from './routes/content.mjs';
import historyRouter from './routes/history.mjs';
import sharingRouter from './routes/sharing.mjs';

// Import database
import { testConnection } from './config/database.mjs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration based on API design
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://app.example.com'] // Update with actual frontend domain
    : true, // Allow all origins in development
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'X-Admin-Session'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware
app.use(responseFormatter);

// Apply general rate limiting
app.use('/api', rateLimitConfigs.general);

// Health check endpoint
app.get('/health', (req, res) => {
  res.success({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0'
  });
});

// API versioning - all routes under /api/v1
const apiV1 = express.Router();

// Apply specific rate limiting to different endpoint categories
apiV1.use('/teams', rateLimitConfigs.teamOperations);
apiV1.use('/teams/:teamId/members', rateLimitConfigs.memberManagement);
apiV1.use('/teams/:teamId/content', rateLimitConfigs.contentDelivery);
apiV1.use('/teams/:teamId/history', rateLimitConfigs.analytics);
apiV1.use('/teams/:teamId/analytics', rateLimitConfigs.analytics);

// Route handlers
apiV1.use('/teams', teamsRouter);

// Mount nested routes with team ID parameter
apiV1.use('/teams/:teamId/members', membersRouter);
apiV1.use('/teams/:teamId/members/:memberId/availability', availabilityRouter);
apiV1.use('/teams/:teamId/rotation', rotationRouter);
apiV1.use('/teams/:teamId/content', contentRouter);
apiV1.use('/teams/:teamId/history', historyRouter);
apiV1.use('/teams/:teamId/analytics', historyRouter); // Analytics endpoints in history router
apiV1.use('/teams/:teamId/sharing', sharingRouter);

// Mount API v1 routes
app.use('/api/v1', apiV1);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('Failed to connect to database. Server not started.');
      process.exit(1);
    }

    // Start HTTP server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
🚀 Scrum Master API Server Started
   Port: ${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
   Base URL: http://localhost:${PORT}/api/v1
   Health Check: http://localhost:${PORT}/health
      `);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();