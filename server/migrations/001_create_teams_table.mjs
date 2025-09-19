// Migration: Create teams table
// Based on database-design.md specification

export const up = async (query) => {
  // Create teams table
  await query(`
    CREATE TABLE teams (
      id VARCHAR(8) PRIMARY KEY,
      short_code VARCHAR(4) UNIQUE NOT NULL,
      name VARCHAR(50) DEFAULT 'Scrum Team',
      timezone VARCHAR(50) DEFAULT 'UTC',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      is_archived BOOLEAN DEFAULT FALSE,
      admin_session_id VARCHAR(64)
    );
  `);

  // Create indexes for performance
  await query(`
    CREATE UNIQUE INDEX idx_teams_short_code ON teams(short_code);
  `);

  await query(`
    CREATE INDEX idx_teams_last_active_at ON teams(last_active_at) WHERE NOT is_archived;
  `);

  await query(`
    CREATE INDEX idx_teams_admin_session ON teams(admin_session_id) WHERE admin_session_id IS NOT NULL;
  `);

  // Add constraints
  await query(`
    ALTER TABLE teams ADD CONSTRAINT chk_teams_id_format
      CHECK (id ~ '^[a-zA-Z0-9]{8}$');
  `);

  await query(`
    ALTER TABLE teams ADD CONSTRAINT chk_teams_short_code_format
      CHECK (short_code ~ '^[A-Z]{4}$');
  `);

  await query(`
    ALTER TABLE teams ADD CONSTRAINT chk_teams_name_length
      CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 50);
  `);

  console.log('Teams table created successfully');
};

export const down = async (query) => {
  await query('DROP TABLE IF EXISTS teams CASCADE;');
  console.log('Teams table dropped');
};