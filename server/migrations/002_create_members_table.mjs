// Migration: Create members table
// Based on database-design.md specification

export const up = async (query) => {
  // Create members table
  await query(`
    CREATE TABLE members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id VARCHAR(8) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      name VARCHAR(30) NOT NULL,
      position INTEGER NOT NULL,
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      is_active BOOLEAN DEFAULT TRUE,
      last_selected_at TIMESTAMP WITH TIME ZONE
    );
  `);

  // Create indexes for performance
  await query(`
    CREATE INDEX idx_members_team_id ON members(team_id);
  `);

  await query(`
    CREATE UNIQUE INDEX idx_members_team_position ON members(team_id, position) WHERE is_active;
  `);

  await query(`
    CREATE INDEX idx_members_team_active ON members(team_id, is_active);
  `);

  await query(`
    CREATE INDEX idx_members_last_selected ON members(last_selected_at) WHERE last_selected_at IS NOT NULL;
  `);

  // Add constraints
  await query(`
    ALTER TABLE members ADD CONSTRAINT chk_members_name_length
      CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 30);
  `);

  await query(`
    ALTER TABLE members ADD CONSTRAINT chk_members_position_valid
      CHECK (position >= 0);
  `);

  console.log('Members table created successfully');
};

export const down = async (query) => {
  await query('DROP TABLE IF EXISTS members CASCADE;');
  console.log('Members table dropped');
};