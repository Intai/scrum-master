// Response formatter middleware
// Based on API design standard response format

import { v4 as uuidv4 } from 'uuid';

// Standard response format middleware
export const responseFormatter = (req, res, next) => {
  // Add request ID for tracking
  req.requestId = uuidv4().split('-')[0]; // Short request ID

  // Success response helper
  res.success = (data, meta = {}) => {
    const response = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        requestId: req.requestId,
        ...meta
      }
    };
    res.json(response);
  };

  // Error response helper
  res.error = (code, message, details = null, statusCode = 400) => {
    const response = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details })
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      }
    };
    res.status(statusCode).json(response);
  };

  next();
};