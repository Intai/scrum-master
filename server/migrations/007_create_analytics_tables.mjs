// Migration: Create analytics and feedback tables
// Based on database-design.md specification

export const up = async (query) => {
  // Create quiz_responses table
  await query(`
    CREATE TABLE quiz_responses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id VARCHAR(8) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
      member_name VARCHAR(30),
      answer VARCHAR(500) NOT NULL,
      is_correct BOOLEAN NOT NULL,
      responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Create indexes for quiz_responses
  await query(`
    CREATE INDEX idx_quiz_responses_team_id ON quiz_responses(team_id);
  `);

  await query(`
    CREATE INDEX idx_quiz_responses_question_id ON quiz_responses(question_id);
  `);

  await query(`
    CREATE INDEX idx_quiz_responses_team_question ON quiz_responses(team_id, question_id);
  `);

  await query(`
    CREATE INDEX idx_quiz_responses_correctness ON quiz_responses(question_id, is_correct);
  `);

  // Add constraints for quiz_responses
  await query(`
    ALTER TABLE quiz_responses ADD CONSTRAINT chk_quiz_response_answer_length
      CHECK (LENGTH(answer) >= 1 AND LENGTH(answer) <= 500);
  `);

  await query(`
    ALTER TABLE quiz_responses ADD CONSTRAINT chk_quiz_response_member_length
      CHECK (member_name IS NULL OR LENGTH(member_name) <= 30);
  `);

  // Create tip_feedback table
  await query(`
    CREATE TABLE tip_feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id VARCHAR(8) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      tip_id UUID NOT NULL REFERENCES standup_tips(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      member_name VARCHAR(30),
      comment TEXT,
      submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Create indexes for tip_feedback
  await query(`
    CREATE INDEX idx_tip_feedback_team_id ON tip_feedback(team_id);
  `);

  await query(`
    CREATE INDEX idx_tip_feedback_tip_id ON tip_feedback(tip_id);
  `);

  await query(`
    CREATE INDEX idx_tip_feedback_rating ON tip_feedback(tip_id, rating);
  `);

  // Add constraints for tip_feedback
  await query(`
    ALTER TABLE tip_feedback ADD CONSTRAINT chk_tip_feedback_rating
      CHECK (rating >= 1 AND rating <= 5);
  `);

  await query(`
    ALTER TABLE tip_feedback ADD CONSTRAINT chk_tip_feedback_member_length
      CHECK (member_name IS NULL OR LENGTH(member_name) <= 30);
  `);

  await query(`
    ALTER TABLE tip_feedback ADD CONSTRAINT chk_tip_feedback_comment_length
      CHECK (comment IS NULL OR LENGTH(comment) <= 1000);
  `);

  console.log('Analytics and feedback tables created successfully');
};

export const down = async (query) => {
  await query('DROP TABLE IF EXISTS tip_feedback CASCADE;');
  await query('DROP TABLE IF EXISTS quiz_responses CASCADE;');
  console.log('Analytics and feedback tables dropped');
};