// Content API routes
// Based on API design specification

import express from 'express';
import { DatabaseService } from '../services/database.mjs';
import {
  validateTeamId,
  validateQuizAnswer,
  validateTipFeedback
} from '../utils/validators.mjs';
import { query } from '../config/database.mjs';
import { BusinessError } from '../middleware/error-handler.mjs';

const router = express.Router({ mergeParams: true });

// GET /api/v1/teams/:teamId/content/tip - Get daily tip
router.get('/tip', async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Get daily tip
    const tip = await DatabaseService.getDailyTip(req.params.teamId);

    const response = {
      id: tip.id,
      title: tip.title,
      content: tip.content,
      category: tip.category,
      difficulty: tip.difficulty,
      targetTeamSize: tip.target_team_size,
      helpfulnessRating: parseFloat(tip.helpfulness_rating) || 0,
      canProvideFeedback: tip.can_provide_feedback
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

// GET /api/v1/teams/:teamId/content/quiz - Get daily quiz
router.get('/quiz', async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Get daily quiz
    const quiz = await DatabaseService.getDailyQuiz(req.params.teamId);

    const response = {
      id: quiz.id,
      question: quiz.question,
      options: typeof quiz.options === 'string'
        ? JSON.parse(quiz.options)
        : quiz.options,
      category: quiz.category,
      difficulty: quiz.difficulty,
      explanation: quiz.explanation,
      hasBeenAnswered: quiz.has_been_answered,
      teamStats: {
        totalResponses: parseInt(quiz.total_responses) || 0,
        correctPercentage: parseInt(quiz.correct_percentage) || 0
      }
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

// POST /api/v1/teams/:teamId/content/quiz/:quizId/answer - Submit quiz answer
router.post('/quiz/:quizId/answer', async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);
    validateQuizAnswer(req.body);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Verify quiz exists
    const quizResult = await query(`
      SELECT * FROM quiz_questions
      WHERE id = $1 AND is_active = TRUE
    `, [req.params.quizId]);

    if (quizResult.rows.length === 0) {
      return res.error('CONTENT_UNAVAILABLE', 'Quiz question not found', null, 404);
    }

    const quiz = quizResult.rows[0];

    // Submit answer
    const result = await DatabaseService.submitQuizAnswer(
      req.params.teamId,
      req.params.quizId,
      req.body
    );

    // Get ranking if member name provided
    let yourRank = null;
    if (req.body.memberName) {
      const rankResult = await query(`
        SELECT COUNT(*) + 1 as rank
        FROM quiz_responses
        WHERE team_id = $1
          AND question_id = $2
          AND is_correct = TRUE
          AND responded_at < (
            SELECT responded_at
            FROM quiz_responses
            WHERE team_id = $1
              AND question_id = $2
              AND member_name = $3
              AND answer = $4
            ORDER BY responded_at DESC
            LIMIT 1
          )
      `, [req.params.teamId, req.params.quizId, req.body.memberName, req.body.answer]);

      if (result.isCorrect) {
        yourRank = parseInt(rankResult.rows[0].rank);
      }
    }

    const response = {
      isCorrect: result.isCorrect,
      correctAnswer: result.correctAnswer,
      explanation: quiz.explanation,
      teamStats: {
        totalResponses: parseInt(result.teamStats.total_responses),
        correctPercentage: parseInt(result.teamStats.correct_percentage),
        ...(yourRank && { yourRank })
      }
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

// POST /api/v1/teams/:teamId/content/tip/:tipId/feedback - Submit tip feedback
router.post('/tip/:tipId/feedback', async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);
    validateTipFeedback(req.body);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Verify tip exists
    const tipResult = await query(`
      SELECT * FROM standup_tips
      WHERE id = $1 AND is_active = TRUE
    `, [req.params.tipId]);

    if (tipResult.rows.length === 0) {
      return res.error('CONTENT_UNAVAILABLE', 'Tip not found', null, 404);
    }

    // Submit feedback
    await DatabaseService.submitTipFeedback(
      req.params.teamId,
      req.params.tipId,
      req.body
    );

    // Get updated tip rating
    const ratingResult = await query(`
      SELECT
        COUNT(*) as total_feedback,
        AVG(rating) as average_rating
      FROM tip_feedback
      WHERE tip_id = $1
    `, [req.params.tipId]);

    const stats = ratingResult.rows[0];

    const response = {
      message: 'Feedback submitted successfully',
      tipId: req.params.tipId,
      yourRating: req.body.rating,
      tipStats: {
        totalFeedback: parseInt(stats.total_feedback),
        averageRating: parseFloat(stats.average_rating).toFixed(1)
      }
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

export default router;