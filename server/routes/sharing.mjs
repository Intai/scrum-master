// Sharing API routes
// Based on API design specification

import express from 'express';
import { DatabaseService } from '../services/database.mjs';
import { requireAdmin } from '../middleware/admin-auth.mjs';
import { validateTeamId } from '../utils/validators.mjs';
import { generateShortCode, generateTeamId } from '../utils/id-generator.mjs';
import { query } from '../config/database.mjs';
import { BusinessError } from '../middleware/error-handler.mjs';

const router = express.Router({ mergeParams: true });

// POST /api/v1/teams/:teamId/sharing/regenerate - Regenerate share URLs
router.post('/regenerate', requireAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);

    // Verify team exists and admin has access
    const team = await DatabaseService.getTeamById(req.params.teamId);

    // Generate new IDs
    let newTeamId, newShortCode;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      newTeamId = generateTeamId();
      newShortCode = generateShortCode();
      attempts++;

      // Check if short code already exists
      const shortCodeExists = await DatabaseService.checkShortCodeExists(newShortCode);
      if (!shortCodeExists) {
        break;
      }

      if (attempts >= maxAttempts) {
        return res.error('INTERNAL_ERROR', 'Unable to generate unique identifiers', null, 500);
      }
    } while (attempts < maxAttempts);

    // Update team with new sharing identifiers
    await query(`
      UPDATE teams
      SET
        id = $2,
        short_code = $3,
        last_active_at = NOW()
      WHERE id = $1
    `, [req.params.teamId, newTeamId, newShortCode]);

    // Update foreign key references
    await query(`
      UPDATE members SET team_id = $2 WHERE team_id = $1;
      UPDATE selections SET team_id = $2 WHERE team_id = $1;
      UPDATE rotation_queues SET team_id = $2 WHERE team_id = $1;
      UPDATE content_views SET team_id = $2 WHERE team_id = $1;
      UPDATE quiz_responses SET team_id = $2 WHERE team_id = $1;
      UPDATE tip_feedback SET team_id = $2 WHERE team_id = $1;
    `, [req.params.teamId, newTeamId]);

    // Generate QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${newShortCode}&size=200x200`;

    const response = {
      shareUrl: `${req.protocol}://${req.get('host')}/team/${newTeamId}`,
      shortCode: newShortCode,
      qrCodeUrl: qrCodeUrl,
      regeneratedAt: new Date().toISOString()
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

// GET /api/v1/teams/:teamId/sharing/stats - Get sharing statistics
router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);

    // Verify team exists and admin has access
    await DatabaseService.getTeamById(req.params.teamId);

    // For this implementation, we'll calculate basic stats from existing data
    // In a real implementation, you'd track detailed access logs

    // Get team creation and activity data
    const teamStatsResult = await query(`
      SELECT
        t.created_at,
        t.last_active_at,
        COUNT(DISTINCT m.id) as unique_members,
        COUNT(DISTINCT s.selected_date) as total_selection_days,
        COUNT(DISTINCT cv.viewed_date) as content_view_days,
        COUNT(DISTINCT qr.responded_at::date) as quiz_response_days,
        COUNT(DISTINCT tf.submitted_at::date) as feedback_days
      FROM teams t
      LEFT JOIN members m ON t.id = m.team_id
      LEFT JOIN selections s ON t.id = s.team_id
      LEFT JOIN content_views cv ON t.id = cv.team_id
      LEFT JOIN quiz_responses qr ON t.id = qr.team_id
      LEFT JOIN tip_feedback tf ON t.id = tf.team_id
      WHERE t.id = $1
      GROUP BY t.id, t.created_at, t.last_active_at
    `, [req.params.teamId]);

    if (teamStatsResult.rows.length === 0) {
      return res.error('TEAM_NOT_FOUND', 'Team not found', null, 404);
    }

    const stats = teamStatsResult.rows[0];

    // Calculate usage patterns (mock data for demonstration)
    const totalViews = parseInt(stats.total_selection_days) * 2 +
                      parseInt(stats.content_view_days) * 3 +
                      parseInt(stats.quiz_response_days) * 1.5 +
                      parseInt(stats.feedback_days) * 1;

    const uniqueVisitors = Math.max(parseInt(stats.unique_members), 1);

    // Calculate peak usage hours (simplified estimation)
    const peakUsageHours = [9, 14, 16]; // Typical standup and work hours

    // Get access method estimates (mock data)
    const directUrlAccess = Math.floor(totalViews * 0.75);
    const shortCodeAccess = Math.floor(totalViews * 0.25);

    const response = {
      totalViews: Math.floor(totalViews),
      uniqueVisitors: uniqueVisitors,
      lastAccessed: stats.last_active_at,
      accessMethods: {
        directUrl: directUrlAccess,
        shortCode: shortCodeAccess
      },
      peakUsageHours: peakUsageHours,
      teamAge: {
        createdAt: stats.created_at,
        daysActive: Math.floor((new Date() - new Date(stats.created_at)) / (1000 * 60 * 60 * 24))
      },
      usageMetrics: {
        selectionDays: parseInt(stats.total_selection_days) || 0,
        contentViewDays: parseInt(stats.content_view_days) || 0,
        quizResponseDays: parseInt(stats.quiz_response_days) || 0,
        feedbackDays: parseInt(stats.feedback_days) || 0
      }
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

export default router;