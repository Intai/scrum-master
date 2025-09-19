// Rotation API routes
// Based on API design specification

import express from 'express';
import { DatabaseService } from '../services/database.mjs';
import { requireAdmin } from '../middleware/admin-auth.mjs';
import {
  validateTeamId,
  validateMemberId
} from '../utils/validators.mjs';
import { query } from '../config/database.mjs';
import { BusinessError } from '../middleware/error-handler.mjs';

const router = express.Router({ mergeParams: true });

// GET /api/v1/teams/:teamId/rotation/today - Get today's selection
router.get('/today', async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    const today = new Date().toISOString().split('T')[0];

    // Check if selection already exists for today
    let todaysSelection = await DatabaseService.getTodaysSelection(req.params.teamId, today);

    if (!todaysSelection) {
      // Get next scrum master selection
      const nextSelection = await DatabaseService.getNextScrumMaster(req.params.teamId, today);

      if (nextSelection.member_id) {
        // Auto-record the selection
        await DatabaseService.recordSelection(
          req.params.teamId,
          nextSelection.member_id,
          today,
          nextSelection.selection_method
        );

        // Get the recorded selection
        todaysSelection = await DatabaseService.getTodaysSelection(req.params.teamId, today);
      } else {
        // No one available
        return res.success({
          selectedMember: null,
          selectedDate: today,
          selectionMethod: 'automatic',
          confidence: 'low',
          alternativeMember: null,
          rotationMetrics: {
            daysSinceLastSelection: 0,
            totalSelectionsCount: 0,
            fairnessCoefficient: 0
          }
        });
      }
    }

    // Get rotation metrics
    const metricsResult = await query(`
      SELECT
        COALESCE(CURRENT_DATE - MAX(s.selected_date), 999) as days_since_last_selection,
        COUNT(s.id) as total_selections_count
      FROM selections s
      WHERE s.member_id = $1
    `, [todaysSelection.member_id]);

    const metrics = metricsResult.rows[0];

    // Get fairness coefficient
    const fairnessResult = await query(`
      SELECT fairness_coefficient
      FROM team_fairness_metrics
      WHERE team_id = $1
    `, [req.params.teamId]);

    const fairnessCoefficient = fairnessResult.rows[0]?.fairness_coefficient || 1;

    const response = {
      selectedMember: {
        id: todaysSelection.member_id,
        name: todaysSelection.member_name
      },
      selectedDate: todaysSelection.selected_date,
      selectionMethod: todaysSelection.selection_method,
      confidence: 'high', // Could be calculated based on availability
      alternativeMember: null, // Could be implemented to show backup
      rotationMetrics: {
        daysSinceLastSelection: parseInt(metrics.days_since_last_selection),
        totalSelectionsCount: parseInt(metrics.total_selections_count),
        fairnessCoefficient: parseFloat(fairnessCoefficient)
      }
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

// GET /api/v1/teams/:teamId/rotation/queue - Get rotation queue
router.get('/queue', async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Get rotation queue
    const rotationQueue = await DatabaseService.getRotationQueue(req.params.teamId);

    // Get member details with rotation info
    const queueOrder = JSON.parse(rotationQueue.queue_order);
    const memberDetailsResult = await query(`
      SELECT
        m.id,
        m.name,
        COALESCE(CURRENT_DATE - MAX(s.selected_date), 999) as days_since_last_selection
      FROM members m
      LEFT JOIN selections s ON m.id = s.member_id
      WHERE m.id = ANY($1) AND m.is_active = TRUE
      GROUP BY m.id, m.name
      ORDER BY array_position($1, m.id)
    `, [queueOrder]);

    const queueOrderWithDetails = memberDetailsResult.rows.map((member, index) => ({
      memberId: member.id,
      memberName: member.name,
      isNext: index === rotationQueue.current_position,
      daysSinceLastSelection: parseInt(member.days_since_last_selection)
    }));

    // Generate upcoming selections (next 7 days)
    const upcomingSelectionsResult = await query(`
      WITH RECURSIVE upcoming_dates AS (
        SELECT CURRENT_DATE as date, 0 as day_offset
        UNION ALL
        SELECT date + INTERVAL '1 day', day_offset + 1
        FROM upcoming_dates
        WHERE day_offset < 6
      ),
      available_members AS (
        SELECT
          ud.date,
          m.id as member_id,
          m.name as member_name,
          array_position($2, m.id) as queue_position
        FROM upcoming_dates ud
        CROSS JOIN members m
        WHERE m.team_id = $1
          AND m.is_active = TRUE
          AND NOT EXISTS (
            SELECT 1 FROM availability_periods ap
            WHERE ap.member_id = m.id
              AND ap.is_active = TRUE
              AND ud.date BETWEEN ap.start_date AND COALESCE(ap.end_date, ud.date)
          )
          AND NOT EXISTS (
            SELECT 1 FROM selections s
            WHERE s.team_id = $1 AND s.selected_date = ud.date
          )
      ),
      next_selections AS (
        SELECT DISTINCT ON (am.date)
          am.date,
          am.member_id,
          am.member_name
        FROM available_members am
        WHERE am.queue_position IS NOT NULL
        ORDER BY am.date, am.queue_position
      )
      SELECT * FROM next_selections
      ORDER BY date
    `, [req.params.teamId, queueOrder]);

    const upcomingSelections = upcomingSelectionsResult.rows.map(row => ({
      date: row.date,
      memberId: row.member_id,
      memberName: row.member_name
    }));

    const response = {
      currentPosition: rotationQueue.current_position,
      queueOrder: queueOrderWithDetails,
      upcomingSelections: upcomingSelections
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

// POST /api/v1/teams/:teamId/rotation/override - Manual override selection
router.post('/override', requireAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);
    validateMemberId(req.body.memberId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Verify member exists and belongs to team
    const member = await DatabaseService.getMemberById(req.body.memberId);
    if (member.team_id !== req.params.teamId) {
      return res.error('MEMBER_NOT_FOUND', 'Member not found in this team', null, 404);
    }

    const today = new Date().toISOString().split('T')[0];
    const reason = req.body.reason || 'Manual override';

    // Check if selection already exists for today
    const existingSelection = await DatabaseService.getTodaysSelection(req.params.teamId, today);
    if (existingSelection) {
      return res.error('DUPLICATE_SELECTION', 'Selection already exists for today', null, 409);
    }

    // Record manual override selection
    const selectionId = await DatabaseService.recordSelection(
      req.params.teamId,
      req.body.memberId,
      today,
      'manual_override',
      reason
    );

    // Get the recorded selection details
    const selection = await query(`
      SELECT s.*, m.name as member_name
      FROM selections s
      JOIN members m ON s.member_id = m.id
      WHERE s.id = $1
    `, [selectionId]);

    const response = {
      id: selection.rows[0].id,
      memberId: selection.rows[0].member_id,
      memberName: selection.rows[0].member_name,
      selectedDate: selection.rows[0].selected_date,
      selectionMethod: selection.rows[0].selection_method,
      reason: selection.rows[0].skip_reason,
      selectedAt: selection.rows[0].selected_at
    };

    res.status(201).success(response);

  } catch (err) {
    next(err);
  }
});

// POST /api/v1/teams/:teamId/rotation/regenerate - Regenerate queue
router.post('/regenerate', requireAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Get active team members
    const members = await DatabaseService.getTeamMembers(req.params.teamId);
    const activeMemberIds = members
      .filter(member => member.is_active)
      .sort((a, b) => a.position - b.position)
      .map(member => member.id);

    if (activeMemberIds.length === 0) {
      return res.error('VALIDATION_ERROR', 'No active members found for rotation queue');
    }

    // Update rotation queue with new order and reset position
    await query(`
      UPDATE rotation_queues
      SET
        queue_order = $2::jsonb,
        current_position = 0,
        last_shuffled_at = NOW()
      WHERE team_id = $1
    `, [req.params.teamId, JSON.stringify(activeMemberIds)]);

    // Get updated queue details
    const updatedQueue = await DatabaseService.getRotationQueue(req.params.teamId);

    const response = {
      message: 'Rotation queue regenerated successfully',
      queueOrder: JSON.parse(updatedQueue.queue_order),
      currentPosition: updatedQueue.current_position,
      totalMembers: activeMemberIds.length,
      lastShuffledAt: updatedQueue.last_shuffled_at
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

export default router;