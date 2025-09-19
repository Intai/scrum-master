// Migration: Create selections table
// Based on database-design.md specification

export const up = async (query) => {
  // Create selections table
  await query(`
    CREATE TABLE selections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id VARCHAR(8) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
      selected_date DATE NOT NULL,
      selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      selection_method VARCHAR(20) DEFAULT 'automatic',
      skip_reason TEXT
    );
  `);

  // Create indexes for performance
  await query(`
    CREATE INDEX idx_selections_team_id ON selections(team_id);
  `);

  await query(`
    CREATE INDEX idx_selections_member_id ON selections(member_id);
  `);

  await query(`
    CREATE UNIQUE INDEX idx_selections_team_date ON selections(team_id, selected_date);
  `);

  await query(`
    CREATE INDEX idx_selections_date ON selections(selected_date);
  `);

  await query(`
    CREATE INDEX idx_selections_method ON selections(selection_method);
  `);

  // Add constraints
  await query(`
    ALTER TABLE selections ADD CONSTRAINT chk_selections_method
      CHECK (selection_method IN ('automatic', 'manual_override'));
  `);

  await query(`
    ALTER TABLE selections ADD CONSTRAINT chk_selections_skip_reason_length
      CHECK (LENGTH(skip_reason) <= 500);
  `);

  console.log('Selections table created successfully');
};

export const down = async (query) => {
  await query('DROP TABLE IF EXISTS selections CASCADE;');
  console.log('Selections table dropped');
};