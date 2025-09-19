// Migration: Create content management tables
// Based on database-design.md specification

export const up = async (query) => {
  // Create standup_tips table
  await query(`
    CREATE TABLE standup_tips (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(100) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(30) NOT NULL,
      difficulty VARCHAR(20) NOT NULL,
      target_team_size VARCHAR(20) DEFAULT 'any',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Create indexes for standup_tips
  await query(`
    CREATE INDEX idx_standup_tips_category ON standup_tips(category, is_active) WHERE is_active;
  `);

  await query(`
    CREATE INDEX idx_standup_tips_difficulty ON standup_tips(difficulty, is_active) WHERE is_active;
  `);

  await query(`
    CREATE INDEX idx_standup_tips_team_size ON standup_tips(target_team_size, is_active) WHERE is_active;
  `);

  await query(`
    CREATE INDEX idx_standup_tips_active ON standup_tips(is_active, created_at) WHERE is_active;
  `);

  // Add constraints for standup_tips
  await query(`
    ALTER TABLE standup_tips ADD CONSTRAINT chk_tips_title_length
      CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 100);
  `);

  await query(`
    ALTER TABLE standup_tips ADD CONSTRAINT chk_tips_content_length
      CHECK (LENGTH(content) >= 10 AND LENGTH(content) <= 2000);
  `);

  await query(`
    ALTER TABLE standup_tips ADD CONSTRAINT chk_tips_category
      CHECK (category IN ('time_management', 'engagement', 'problem_solving', 'facilitation', 'retrospectives'));
  `);

  await query(`
    ALTER TABLE standup_tips ADD CONSTRAINT chk_tips_difficulty
      CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
  `);

  await query(`
    ALTER TABLE standup_tips ADD CONSTRAINT chk_tips_team_size
      CHECK (target_team_size IN ('small', 'medium', 'large', 'any'));
  `);

  // Create quiz_questions table
  await query(`
    CREATE TABLE quiz_questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      question TEXT NOT NULL,
      correct_answer VARCHAR(500) NOT NULL,
      options JSONB NOT NULL,
      category VARCHAR(30) NOT NULL,
      difficulty VARCHAR(20) NOT NULL,
      explanation TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Create indexes for quiz_questions
  await query(`
    CREATE INDEX idx_quiz_category ON quiz_questions(category, is_active) WHERE is_active;
  `);

  await query(`
    CREATE INDEX idx_quiz_difficulty ON quiz_questions(difficulty, is_active) WHERE is_active;
  `);

  await query(`
    CREATE INDEX idx_quiz_active ON quiz_questions(is_active, created_at) WHERE is_active;
  `);

  // Add constraints for quiz_questions
  await query(`
    ALTER TABLE quiz_questions ADD CONSTRAINT chk_quiz_question_length
      CHECK (LENGTH(question) >= 10 AND LENGTH(question) <= 1000);
  `);

  await query(`
    ALTER TABLE quiz_questions ADD CONSTRAINT chk_quiz_answer_length
      CHECK (LENGTH(correct_answer) >= 1 AND LENGTH(correct_answer) <= 500);
  `);

  await query(`
    ALTER TABLE quiz_questions ADD CONSTRAINT chk_quiz_options_format
      CHECK (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) >= 2);
  `);

  await query(`
    ALTER TABLE quiz_questions ADD CONSTRAINT chk_quiz_category
      CHECK (category IN ('tech', 'general', 'team_building', 'agile', 'software_engineering'));
  `);

  await query(`
    ALTER TABLE quiz_questions ADD CONSTRAINT chk_quiz_difficulty
      CHECK (difficulty IN ('easy', 'medium', 'hard'));
  `);

  await query(`
    ALTER TABLE quiz_questions ADD CONSTRAINT chk_quiz_explanation_length
      CHECK (explanation IS NULL OR LENGTH(explanation) <= 1000);
  `);

  // Create content_views table
  await query(`
    CREATE TABLE content_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id VARCHAR(8) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      content_type VARCHAR(10) NOT NULL,
      content_id UUID NOT NULL,
      viewed_date DATE NOT NULL,
      viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Create indexes for content_views
  await query(`
    CREATE INDEX idx_content_views_team_id ON content_views(team_id);
  `);

  await query(`
    CREATE UNIQUE INDEX idx_content_views_unique ON content_views(team_id, content_type, content_id, viewed_date);
  `);

  await query(`
    CREATE INDEX idx_content_views_repetition ON content_views(team_id, content_type, viewed_date);
  `);

  // Note: Cleanup index removed due to PostgreSQL IMMUTABLE function restriction
  // Cleanup can be done with a periodic query instead

  // Add constraints for content_views
  await query(`
    ALTER TABLE content_views ADD CONSTRAINT chk_content_type
      CHECK (content_type IN ('tip', 'quiz'));
  `);

  console.log('Content management tables created successfully');
};

export const down = async (query) => {
  await query('DROP TABLE IF EXISTS content_views CASCADE;');
  await query('DROP TABLE IF EXISTS quiz_questions CASCADE;');
  await query('DROP TABLE IF EXISTS standup_tips CASCADE;');
  console.log('Content management tables dropped');
};