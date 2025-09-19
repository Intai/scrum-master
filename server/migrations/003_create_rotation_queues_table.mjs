// Migration: Create rotation_queues table
// Based on database-design.md specification

export const up = async (query) => {
  // Create rotation_queues table
  await query(`
    CREATE TABLE rotation_queues (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id VARCHAR(8) UNIQUE NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      current_position INTEGER DEFAULT 0,
      queue_order JSONB NOT NULL,
      last_shuffled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      total_selections INTEGER DEFAULT 0,
      algorithm VARCHAR(20) DEFAULT 'fair_cycle'
    );
  `);

  // Create indexes for performance
  await query(`
    CREATE UNIQUE INDEX idx_rotation_queues_team_id ON rotation_queues(team_id);
  `);

  await query(`
    CREATE INDEX idx_rotation_queues_algorithm ON rotation_queues(algorithm);
  `);

  // Add constraints
  await query(`
    ALTER TABLE rotation_queues ADD CONSTRAINT chk_rotation_current_position
      CHECK (current_position >= 0);
  `);

  await query(`
    ALTER TABLE rotation_queues ADD CONSTRAINT chk_rotation_queue_order
      CHECK (jsonb_typeof(queue_order) = 'array');
  `);

  await query(`
    ALTER TABLE rotation_queues ADD CONSTRAINT chk_rotation_algorithm
      CHECK (algorithm IN ('fair_cycle', 'random', 'manual'));
  `);

  console.log('Rotation queues table created successfully');
};

export const down = async (query) => {
  await query('DROP TABLE IF EXISTS rotation_queues CASCADE;');
  console.log('Rotation queues table dropped');
};