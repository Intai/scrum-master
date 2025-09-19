// Rate limiting middleware
// Based on API design rate limiting specification

import rateLimit from 'express-rate-limit';

// Rate limit configurations from API design
const rateLimitConfigs = {
  // General API rate limit
  general: rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per minute
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later.'
      }
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests, please try again later.'
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }
  }),

  // Team operations - 20 requests/minute
  teamOperations: rateLimit({
    windowMs: 60000,
    max: 20,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many team operations, please try again later.'
      }
    }
  }),

  // Member management - 30 requests/minute
  memberManagement: rateLimit({
    windowMs: 60000,
    max: 30,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many member management requests, please try again later.'
      }
    }
  }),

  // Content delivery - 100 requests/minute (same as general)
  contentDelivery: rateLimit({
    windowMs: 60000,
    max: 100,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many content requests, please try again later.'
      }
    }
  }),

  // History/Analytics - 50 requests/minute
  analytics: rateLimit({
    windowMs: 60000,
    max: 50,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many analytics requests, please try again later.'
      }
    }
  })
};

export default rateLimitConfigs;