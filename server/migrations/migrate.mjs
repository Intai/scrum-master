import { query, testConnection, closePool } from '../config/database.mjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create migrations table to track applied migrations
const createMigrationsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  await query(sql);
};

// Get list of applied migrations
const getAppliedMigrations = async () => {
  try {
    const result = await query('SELECT filename FROM migrations ORDER BY id');
    return result.rows.map(row => row.filename);
  } catch (err) {
    // If migrations table doesn't exist yet, return empty array
    if (err.code === '42P01') {
      return [];
    }
    throw err;
  }
};

// Get list of migration files
const getMigrationFiles = async () => {
  const files = await fs.readdir(__dirname);
  return files
    .filter(file => file.endsWith('.mjs') && file !== 'migrate.mjs')
    .sort();
};

// Apply a single migration
const applyMigration = async (filename) => {
  console.log(`Applying migration: ${filename}`);

  try {
    const migrationPath = path.join(__dirname, filename);
    const migration = await import(migrationPath);

    if (typeof migration.up !== 'function') {
      throw new Error(`Migration ${filename} must export an 'up' function`);
    }

    // Execute migration
    await migration.up(query);

    // Record migration as applied
    await query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);

    console.log(`✓ Migration ${filename} applied successfully`);
  } catch (err) {
    console.error(`✗ Failed to apply migration ${filename}:`, err.message);
    throw err;
  }
};

// Rollback a single migration
const rollbackMigration = async (filename) => {
  console.log(`Rolling back migration: ${filename}`);

  try {
    const migrationPath = path.join(__dirname, filename);
    const migration = await import(migrationPath);

    if (typeof migration.down !== 'function') {
      throw new Error(`Migration ${filename} must export a 'down' function for rollback`);
    }

    // Execute rollback
    await migration.down(query);

    // Remove migration record
    await query('DELETE FROM migrations WHERE filename = $1', [filename]);

    console.log(`✓ Migration ${filename} rolled back successfully`);
  } catch (err) {
    console.error(`✗ Failed to rollback migration ${filename}:`, err.message);
    throw err;
  }
};

// Run migrations
const runMigrations = async () => {
  console.log('Starting database migrations...');

  // Test database connection
  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot connect to database. Please check your configuration.');
    process.exit(1);
  }

  try {
    // Create migrations table
    await createMigrationsTable();

    // Get applied and available migrations
    const appliedMigrations = await getAppliedMigrations();
    const migrationFiles = await getMigrationFiles();

    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrations.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations found.');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migration(s)`);

    // Apply each pending migration
    for (const filename of pendingMigrations) {
      await applyMigration(filename);
    }

    console.log('All migrations completed successfully!');

  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
};

// Rollback last migration
const rollbackLastMigration = async () => {
  console.log('Rolling back last migration...');

  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Cannot connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Get last applied migration
    const result = await query(
      'SELECT filename FROM migrations ORDER BY id DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      console.log('No migrations to rollback.');
      return;
    }

    const lastMigration = result.rows[0].filename;
    await rollbackMigration(lastMigration);

    console.log('Rollback completed successfully!');

  } catch (err) {
    console.error('Rollback failed:', err.message);
    process.exit(1);
  }
};

// CLI handling
const command = process.argv[2];

if (command === 'rollback') {
  rollbackLastMigration().finally(() => closePool());
} else {
  runMigrations().finally(() => closePool());
}