// Migration: Create availability_periods table
// Based on database-design.md specification

export const up = async (query) => {
  // Create availability_periods table
  await query(`
    CREATE TABLE availability_periods (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE,
      reason VARCHAR(200),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Create indexes for performance
  await query(`
    CREATE INDEX idx_availability_member_id ON availability_periods(member_id);
  `);

  await query(`
    CREATE INDEX idx_availability_dates ON availability_periods(member_id, start_date, end_date) WHERE is_active;
  `);

  await query(`
    CREATE INDEX idx_availability_active ON availability_periods(is_active, start_date) WHERE is_active;
  `);

  // Add constraints
  await query(`
    ALTER TABLE availability_periods ADD CONSTRAINT chk_availability_dates
      CHECK (end_date IS NULL OR end_date >= start_date);
  `);

  await query(`
    ALTER TABLE availability_periods ADD CONSTRAINT chk_availability_reason_length
      CHECK (LENGTH(reason) <= 200);
  `);

  console.log('Availability periods table created successfully');
};

export const down = async (query) => {
  await query('DROP TABLE IF EXISTS availability_periods CASCADE;');
  console.log('Availability periods table dropped');
};