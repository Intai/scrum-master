// Availability API routes
// Based on API design specification

import express from 'express';
import { DatabaseService } from '../services/database.mjs';
import { requireAdmin } from '../middleware/admin-auth.mjs';
import {
  validateAvailabilityPeriod,
  validateTeamId,
  validateMemberId,
  validateDateRange
} from '../utils/validators.mjs';
import { query } from '../config/database.mjs';
import { BusinessError } from '../middleware/error-handler.mjs';

const router = express.Router({ mergeParams: true });

// POST /api/v1/teams/:teamId/members/:memberId/availability - Set member availability
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);
    validateMemberId(req.params.memberId);
    validateAvailabilityPeriod(req.body);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Verify member exists and belongs to team
    const member = await DatabaseService.getMemberById(req.params.memberId);
    if (member.team_id !== req.params.teamId) {
      return res.error('MEMBER_NOT_FOUND', 'Member not found in this team', null, 404);
    }

    // Create availability period
    const result = await query(`
      INSERT INTO availability_periods (member_id, start_date, end_date, reason)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      req.params.memberId,
      req.body.startDate,
      req.body.endDate || null,
      req.body.reason || null
    ]);

    const availabilityPeriod = result.rows[0];

    // Calculate impact on rotation
    const impactResult = await query(`
      SELECT
        COUNT(*) as days_skipped,
        CASE
          WHEN $3 IS NOT NULL
          THEN $3::date + INTERVAL '1 day'
          ELSE NULL
        END as next_selection_date
      FROM generate_series($2::date, COALESCE($3::date, $2::date), '1 day'::interval) as date_series
    `, [req.params.memberId, req.body.startDate, req.body.endDate]);

    const impact = impactResult.rows[0];

    const response = {
      id: availabilityPeriod.id,
      startDate: availabilityPeriod.start_date,
      endDate: availabilityPeriod.end_date,
      reason: availabilityPeriod.reason,
      isActive: availabilityPeriod.is_active,
      impactOnRotation: {
        daysSkipped: parseInt(impact.days_skipped),
        nextSelectionDate: impact.next_selection_date
      }
    };

    res.status(201).success(response);

  } catch (err) {
    next(err);
  }
});

// GET /api/v1/teams/:teamId/members/:memberId/availability - Get member availability
router.get('/', async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);
    validateMemberId(req.params.memberId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Verify member exists and belongs to team
    const member = await DatabaseService.getMemberById(req.params.memberId);
    if (member.team_id !== req.params.teamId) {
      return res.error('MEMBER_NOT_FOUND', 'Member not found in this team', null, 404);
    }

    // Get availability periods
    const result = await query(`
      SELECT *
      FROM availability_periods
      WHERE member_id = $1 AND is_active = TRUE
      ORDER BY start_date DESC
    `, [req.params.memberId]);

    const availabilityPeriods = result.rows.map(period => ({
      id: period.id,
      startDate: period.start_date,
      endDate: period.end_date,
      reason: period.reason,
      isActive: period.is_active,
      createdAt: period.created_at
    }));

    res.success({
      memberId: req.params.memberId,
      memberName: member.name,
      availabilityPeriods: availabilityPeriods
    });

  } catch (err) {
    next(err);
  }
});

// POST /api/v1/teams/:teamId/members/:memberId/availability/today - Quick toggle availability
router.post('/today', requireAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);
    validateMemberId(req.params.memberId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Verify member exists and belongs to team
    const member = await DatabaseService.getMemberById(req.params.memberId);
    if (member.team_id !== req.params.teamId) {
      return res.error('MEMBER_NOT_FOUND', 'Member not found in this team', null, 404);
    }

    const isAvailable = req.body.isAvailable;
    const reason = req.body.reason || null;

    if (typeof isAvailable !== 'boolean') {
      return res.error('VALIDATION_ERROR', 'isAvailable must be a boolean');
    }

    const today = new Date().toISOString().split('T')[0];

    if (isAvailable) {
      // Remove today's unavailability if it exists
      await query(`
        UPDATE availability_periods
        SET is_active = FALSE
        WHERE member_id = $1
          AND start_date = $2
          AND (end_date IS NULL OR end_date = $2)
          AND is_active = TRUE
      `, [req.params.memberId, today]);

      res.success({
        message: 'Member marked as available for today',
        date: today,
        isAvailable: true
      });
    } else {
      // Add today's unavailability
      const result = await query(`
        INSERT INTO availability_periods (member_id, start_date, end_date, reason)
        VALUES ($1, $2, $2, $3)
        ON CONFLICT (member_id, start_date, end_date) DO UPDATE SET
          reason = EXCLUDED.reason,
          is_active = TRUE
        RETURNING *
      `, [req.params.memberId, today, reason]);

      const availabilityPeriod = result.rows[0];

      res.success({
        id: availabilityPeriod.id,
        message: 'Member marked as unavailable for today',
        date: today,
        isAvailable: false,
        reason: reason
      });
    }

  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/teams/:teamId/members/:memberId/availability/:availabilityId - Return early
router.delete('/:availabilityId', requireAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);
    validateMemberId(req.params.memberId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Verify member exists and belongs to team
    const member = await DatabaseService.getMemberById(req.params.memberId);
    if (member.team_id !== req.params.teamId) {
      return res.error('MEMBER_NOT_FOUND', 'Member not found in this team', null, 404);
    }

    // Get availability period
    const availabilityResult = await query(`
      SELECT * FROM availability_periods
      WHERE id = $1 AND member_id = $2 AND is_active = TRUE
    `, [req.params.availabilityId, req.params.memberId]);

    if (availabilityResult.rows.length === 0) {
      return res.error('NOT_FOUND', 'Availability period not found', null, 404);
    }

    const availabilityPeriod = availabilityResult.rows[0];
    const today = new Date().toISOString().split('T')[0];

    // Check if period can be cancelled early
    if (availabilityPeriod.start_date > today) {
      // Future period - cancel entirely
      await query(`
        UPDATE availability_periods
        SET is_active = FALSE
        WHERE id = $1
      `, [req.params.availabilityId]);

      res.success({
        message: 'Availability period cancelled',
        originalEndDate: availabilityPeriod.end_date,
        actualEndDate: null
      });
    } else if (availabilityPeriod.end_date && availabilityPeriod.end_date > today) {
      // Ongoing period - end today
      await query(`
        UPDATE availability_periods
        SET end_date = $2
        WHERE id = $1
      `, [req.params.availabilityId, today]);

      res.success({
        message: 'Availability period ended early',
        originalEndDate: availabilityPeriod.end_date,
        actualEndDate: today
      });
    } else {
      // Period already ended
      res.success({
        message: 'Availability period has already ended',
        endDate: availabilityPeriod.end_date || availabilityPeriod.start_date
      });
    }

  } catch (err) {
    next(err);
  }
});

export default router;