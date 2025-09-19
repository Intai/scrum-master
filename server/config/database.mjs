import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database configuration based on postgresql.conf settings from database design
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'scrummaster_db',
  user: process.env.DB_USER || 'scrummaster_app',
  password: process.env.DB_PASSWORD || 'secure_password',

  // Connection pool settings optimized for performance
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established

  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connected successfully at:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return false;
  }
};

// Execute query with error handling
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 100ms as per performance targets)
    if (duration > 100) {
      console.warn(`Slow query detected (${duration}ms):`, text.substring(0, 100));
    }

    return res;
  } catch (err) {
    console.error('Database query error:', {
      query: text.substring(0, 100),
      params: params,
      error: err.message
    });
    throw err;
  }
};

// Execute transaction
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Get client for complex operations
const getClient = async () => {
  return await pool.connect();
};

// Close pool gracefully
const closePool = async () => {
  await pool.end();
  console.log('Database pool closed');
};

export {
  pool,
  query,
  transaction,
  getClient,
  testConnection,
  closePool
};