// Database service layer
// Based on database design and API specifications

import { query, transaction } from '../config/database.mjs';
import { BusinessError } from '../middleware/error-handler.mjs';

export class DatabaseService {
  // Team operations
  static async createTeam(teamData) {
    return await transaction(async (client) => {
      // Insert team
      const teamResult = await client.query(
        `INSERT INTO teams (id, short_code, name, timezone, admin_session_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [teamData.id, teamData.shortCode, teamData.name, teamData.timezone, teamData.adminSessionId]
      );

      const team = teamResult.rows[0];

      // Insert members
      const memberPromises = teamData.members.map((member, index) =>
        client.query(
          `INSERT INTO members (team_id, name, position)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [team.id, member.name, index]
        )
      );

      const memberResults = await Promise.all(memberPromises);
      const members = memberResults.map(result => result.rows[0]);

      // Create rotation queue
      const queueOrder = members.map(member => member.id);
      await client.query(
        `INSERT INTO rotation_queues (team_id, queue_order)
         VALUES ($1, $2)`,
        [team.id, JSON.stringify(queueOrder)]
      );

      return { team, members };
    });
  }

  static async getTeamById(teamId) {
    const result = await query(
      `SELECT * FROM teams WHERE id = $1 AND NOT is_archived`,
      [teamId]
    );

    if (result.rows.length === 0) {
      throw new BusinessError('TEAM_NOT_FOUND', 'Team not found');
    }

    return result.rows[0];
  }

  static async getTeamByShortCode(shortCode) {
    const result = await query(
      `SELECT * FROM teams WHERE short_code = $1 AND NOT is_archived`,
      [shortCode]
    );

    if (result.rows.length === 0) {
      throw new BusinessError('TEAM_NOT_FOUND', 'Team not found');
    }

    return result.rows[0];
  }

  static async updateTeam(teamId, updates) {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (setClause.length === 0) {
      throw new BusinessError('VALIDATION_ERROR', 'No valid fields to update');
    }

    values.push(teamId);

    const result = await query(
      `UPDATE teams SET ${setClause.join(', ')}, last_active_at = NOW()
       WHERE id = $${paramIndex} AND NOT is_archived
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new BusinessError('TEAM_NOT_FOUND', 'Team not found');
    }

    return result.rows[0];
  }

  static async checkShortCodeExists(shortCode) {
    const result = await query(
      `SELECT id FROM teams WHERE short_code = $1`,
      [shortCode]
    );
    return result.rows.length > 0;
  }

  // Member operations
  static async getTeamMembers(teamId, includeInactive = false) {
    const whereClause = includeInactive ? 'team_id = $1' : 'team_id = $1 AND is_active = TRUE';

    const result = await query(
      `SELECT * FROM members WHERE ${whereClause} ORDER BY position`,
      [teamId]
    );

    return result.rows;
  }

  static async getMemberById(memberId) {
    const result = await query(
      `SELECT * FROM members WHERE id = $1`,
      [memberId]
    );

    if (result.rows.length === 0) {
      throw new BusinessError('MEMBER_NOT_FOUND', 'Member not found');
    }

    return result.rows[0];
  }

  static async addMember(teamId, memberData) {
    return await transaction(async (client) => {
      // Get next position
      const positionResult = await client.query(
        `SELECT COALESCE(MAX(position), -1) + 1 as next_position
         FROM members WHERE team_id = $1 AND is_active = TRUE`,
        [teamId]
      );

      const position = positionResult.rows[0].next_position;

      // Insert member
      const memberResult = await client.query(
        `INSERT INTO members (team_id, name, position)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [teamId, memberData.name, position]
      );

      const member = memberResult.rows[0];

      // Update rotation queue
      await client.query(
        `UPDATE rotation_queues
         SET queue_order = queue_order || $2::jsonb
         WHERE team_id = $1`,
        [teamId, JSON.stringify([member.id])]
      );

      return member;
    });
  }

  static async updateMember(memberId, updates) {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (setClause.length === 0) {
      throw new BusinessError('VALIDATION_ERROR', 'No valid fields to update');
    }

    values.push(memberId);

    const result = await query(
      `UPDATE members SET ${setClause.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new BusinessError('MEMBER_NOT_FOUND', 'Member not found');
    }

    return result.rows[0];
  }

  static async removeMember(memberId) {
    return await transaction(async (client) => {
      // Get member info
      const memberResult = await client.query(
        `SELECT * FROM members WHERE id = $1`,
        [memberId]
      );

      if (memberResult.rows.length === 0) {
        throw new BusinessError('MEMBER_NOT_FOUND', 'Member not found');
      }

      const member = memberResult.rows[0];

      // Count selections
      const selectionResult = await client.query(
        `SELECT COUNT(*) as count FROM selections WHERE member_id = $1`,
        [memberId]
      );

      const affectedSelections = parseInt(selectionResult.rows[0].count);

      // Soft delete member
      await client.query(
        `UPDATE members SET is_active = FALSE WHERE id = $1`,
        [memberId]
      );

      // Remove from rotation queue
      await client.query(
        `UPDATE rotation_queues
         SET queue_order = (
           SELECT jsonb_agg(elem)
           FROM jsonb_array_elements(queue_order) elem
           WHERE elem::text != $2::text
         )
         WHERE team_id = $1`,
        [member.team_id, `"${memberId}"`]
      );

      return { member, affectedSelections };
    });
  }

  // Rotation operations
  static async getRotationQueue(teamId) {
    const result = await query(
      `SELECT * FROM rotation_queues WHERE team_id = $1`,
      [teamId]
    );

    if (result.rows.length === 0) {
      throw new BusinessError('TEAM_NOT_FOUND', 'Rotation queue not found for team');
    }

    return result.rows[0];
  }

  static async getTodaysSelection(teamId, targetDate = null) {
    const date = targetDate || new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT s.*, m.name as member_name
       FROM selections s
       JOIN members m ON s.member_id = m.id
       WHERE s.team_id = $1 AND s.selected_date = $2`,
      [teamId, date]
    );

    return result.rows[0] || null;
  }

  static async recordSelection(teamId, memberId, selectedDate, method = 'automatic', skipReason = null) {
    const result = await query(
      `SELECT record_selection($1, $2, $3, $4, $5) as selection_id`,
      [teamId, memberId, selectedDate, method, skipReason]
    );

    return result.rows[0].selection_id;
  }

  static async getNextScrumMaster(teamId, targetDate = null) {
    const date = targetDate || new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT * FROM get_next_scrum_master($1, $2)`,
      [teamId, date]
    );

    return result.rows[0];
  }

  static async updateRotationQueue(teamId, memberOrder) {
    const result = await query(
      `UPDATE rotation_queues
       SET queue_order = $2::jsonb
       WHERE team_id = $1
       RETURNING *`,
      [teamId, JSON.stringify(memberOrder)]
    );

    if (result.rows.length === 0) {
      throw new BusinessError('TEAM_NOT_FOUND', 'Rotation queue not found for team');
    }

    return result.rows[0];
  }

  // Selection history
  static async getSelectionHistory(teamId, options = {}) {
    const { limit = 50, offset = 0, startDate, endDate, memberId } = options;

    let whereClause = 'team_id = $1';
    let values = [teamId];
    let paramIndex = 2;

    if (startDate) {
      whereClause += ` AND selected_date >= $${paramIndex}`;
      values.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereClause += ` AND selected_date <= $${paramIndex}`;
      values.push(endDate);
      paramIndex++;
    }

    if (memberId) {
      whereClause += ` AND member_id = $${paramIndex}`;
      values.push(memberId);
      paramIndex++;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM selections WHERE ${whereClause}`,
      values
    );

    const total = parseInt(countResult.rows[0].total);

    // Get selections with pagination
    values.push(limit, offset);
    const result = await query(
      `SELECT s.*, m.name as member_name
       FROM selections s
       JOIN members m ON s.member_id = m.id
       WHERE ${whereClause}
       ORDER BY s.selected_date DESC, s.selected_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      values
    );

    return {
      selections: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  // Content operations
  static async getDailyTip(teamId) {
    // Get a tip that hasn't been viewed by this team in the last 14 days
    const result = await query(`
      SELECT st.*,
             COALESCE(AVG(tf.rating), 0) as helpfulness_rating,
             CASE WHEN cv.id IS NOT NULL THEN FALSE ELSE TRUE END as can_provide_feedback
      FROM standup_tips st
      LEFT JOIN tip_feedback tf ON st.id = tf.tip_id
      LEFT JOIN content_views cv ON st.id = cv.content_id
                                 AND cv.team_id = $1
                                 AND cv.content_type = 'tip'
                                 AND cv.viewed_date > CURRENT_DATE - INTERVAL '14 days'
      WHERE st.is_active = TRUE
        AND cv.id IS NULL
      GROUP BY st.id, cv.id
      ORDER BY RANDOM()
      LIMIT 1
    `, [teamId]);

    if (result.rows.length === 0) {
      // If no new tips available, get a random active tip
      const fallbackResult = await query(`
        SELECT *, 0 as helpfulness_rating, true as can_provide_feedback
        FROM standup_tips
        WHERE is_active = TRUE
        ORDER BY RANDOM()
        LIMIT 1
      `);

      if (fallbackResult.rows.length === 0) {
        throw new BusinessError('CONTENT_UNAVAILABLE', 'No tips available');
      }

      return fallbackResult.rows[0];
    }

    // Record the view
    await query(`
      INSERT INTO content_views (team_id, content_type, content_id, viewed_date)
      VALUES ($1, 'tip', $2, CURRENT_DATE)
      ON CONFLICT (team_id, content_type, content_id, viewed_date) DO NOTHING
    `, [teamId, result.rows[0].id]);

    return result.rows[0];
  }

  static async getDailyQuiz(teamId) {
    // Get a quiz that hasn't been viewed by this team in the last 30 days
    const result = await query(`
      SELECT qq.*,
             CASE WHEN EXISTS(
               SELECT 1 FROM quiz_responses qr
               WHERE qr.team_id = $1 AND qr.question_id = qq.id
               AND qr.responded_at::date = CURRENT_DATE
             ) THEN TRUE ELSE FALSE END as has_been_answered,
             (SELECT COUNT(*) FROM quiz_responses qr WHERE qr.question_id = qq.id AND qr.team_id = $1) as total_responses,
             CASE
               WHEN (SELECT COUNT(*) FROM quiz_responses qr WHERE qr.question_id = qq.id AND qr.team_id = $1) > 0
               THEN (SELECT COUNT(*) * 100 / COUNT(*) FROM quiz_responses qr WHERE qr.question_id = qq.id AND qr.team_id = $1 AND qr.is_correct = TRUE)
               ELSE 0
             END as correct_percentage
      FROM quiz_questions qq
      LEFT JOIN content_views cv ON qq.id = cv.content_id
                                 AND cv.team_id = $1
                                 AND cv.content_type = 'quiz'
                                 AND cv.viewed_date > CURRENT_DATE - INTERVAL '30 days'
      WHERE qq.is_active = TRUE
        AND cv.id IS NULL
      ORDER BY RANDOM()
      LIMIT 1
    `, [teamId]);

    if (result.rows.length === 0) {
      throw new BusinessError('CONTENT_UNAVAILABLE', 'No quiz questions available');
    }

    // Record the view
    await query(`
      INSERT INTO content_views (team_id, content_type, content_id, viewed_date)
      VALUES ($1, 'quiz', $2, CURRENT_DATE)
      ON CONFLICT (team_id, content_type, content_id, viewed_date) DO NOTHING
    `, [teamId, result.rows[0].id]);

    return result.rows[0];
  }

  static async submitQuizAnswer(teamId, questionId, answerData) {
    // Get correct answer
    const questionResult = await query(
      `SELECT correct_answer FROM quiz_questions WHERE id = $1 AND is_active = TRUE`,
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      throw new BusinessError('CONTENT_UNAVAILABLE', 'Quiz question not found');
    }

    const correctAnswer = questionResult.rows[0].correct_answer;
    const isCorrect = answerData.answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    // Record response
    await query(`
      INSERT INTO quiz_responses (team_id, question_id, member_name, answer, is_correct)
      VALUES ($1, $2, $3, $4, $5)
    `, [teamId, questionId, answerData.memberName || null, answerData.answer, isCorrect]);

    // Get team stats
    const statsResult = await query(`
      SELECT
        COUNT(*) as total_responses,
        COUNT(*) FILTER (WHERE is_correct = TRUE) * 100 / COUNT(*) as correct_percentage
      FROM quiz_responses
      WHERE team_id = $1 AND question_id = $2
    `, [teamId, questionId]);

    return {
      isCorrect,
      correctAnswer,
      teamStats: statsResult.rows[0]
    };
  }

  static async submitTipFeedback(teamId, tipId, feedbackData) {
    await query(`
      INSERT INTO tip_feedback (team_id, tip_id, rating, member_name, comment)
      VALUES ($1, $2, $3, $4, $5)
    `, [teamId, tipId, feedbackData.rating, feedbackData.memberName || null, feedbackData.comment || null]);

    return { submitted: true };
  }
}