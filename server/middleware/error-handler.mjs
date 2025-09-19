// Global error handling middleware
// Based on API design error response format

// Database error code mappings
const dbErrorMap = {
  '23505': { code: 'DUPLICATE_SELECTION', message: 'Selection already exists for this date', status: 409 },
  '23503': { code: 'TEAM_NOT_FOUND', message: 'Referenced team or member not found', status: 404 },
  '23514': { code: 'VALIDATION_ERROR', message: 'Data validation failed', status: 400 },
  '42P01': { code: 'DATABASE_ERROR', message: 'Database table not found', status: 500 }
};

// Business logic error mappings
const businessErrorMap = {
  'TEAM_NOT_FOUND': { status: 404 },
  'MEMBER_NOT_FOUND': { status: 404 },
  'ADMIN_REQUIRED': { status: 403 },
  'VALIDATION_ERROR': { status: 400 },
  'DUPLICATE_SELECTION': { status: 409 },
  'CONTENT_UNAVAILABLE': { status: 503 },
  'QUEUE_CORRUPTION': { status: 500 },
  'DATABASE_ERROR': { status: 500 }
};

export const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    requestId: req.requestId,
    path: req.path,
    method: req.method
  });

  // Default error response
  let errorResponse = {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    status: 500
  };

  // Handle database errors
  if (err.code && dbErrorMap[err.code]) {
    errorResponse = dbErrorMap[err.code];

    // Add more specific details for validation errors
    if (err.code === '23514' && err.constraint) {
      errorResponse.details = {
        constraint: err.constraint,
        field: err.column || 'unknown'
      };
    }
  }
  // Handle business logic errors
  else if (err.code && businessErrorMap[err.code]) {
    errorResponse = {
      code: err.code,
      message: err.message,
      status: businessErrorMap[err.code].status
    };

    if (err.details) {
      errorResponse.details = err.details;
    }
  }
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    errorResponse = {
      code: 'VALIDATION_ERROR',
      message: err.message,
      status: 400
    };

    if (err.errors) {
      errorResponse.details = err.errors;
    }
  }
  // Handle JSON parsing errors
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    errorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid JSON in request body',
      status: 400
    };
  }
  // Handle rate limiting (should be handled by rate limiter, but just in case)
  else if (err.code === 'RATE_LIMITED') {
    errorResponse = {
      code: 'RATE_LIMITED',
      message: 'Too many requests',
      status: 429
    };
  }

  // Send error response
  res.status(errorResponse.status).json({
    success: false,
    error: {
      code: errorResponse.code,
      message: errorResponse.message,
      ...(errorResponse.details && { details: errorResponse.details })
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    }
  });
};

// Custom error classes for business logic
export class BusinessError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'BusinessError';
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends Error {
  constructor(message, errors = null) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}