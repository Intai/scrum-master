// History and Analytics API routes
// Based on API design specification

import express from 'express';
import { DatabaseService } from '../services/database.mjs';
import { requireAdmin } from '../middleware/admin-auth.mjs';
import {
  validateTeamId,
  validateMemberId,
  validatePagination,
  validateDateRange
} from '../utils/validators.mjs';
import { query } from '../config/database.mjs';
import { BusinessError } from '../middleware/error-handler.mjs';

const router = express.Router({ mergeParams: true });

// GET /api/v1/teams/:teamId/history/selections - Get selection history
router.get('/selections', async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Validate pagination
    const { limit, offset } = validatePagination(req.query);

    // Validate date range if provided
    if (req.query.startDate || req.query.endDate) {
      validateDateRange(req.query.startDate, req.query.endDate);
    }

    // Validate member ID if provided
    if (req.query.memberId) {
      validateMemberId(req.query.memberId);
    }

    const options = {
      limit,
      offset,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      memberId: req.query.memberId
    };

    // Get selection history
    const result = await DatabaseService.getSelectionHistory(req.params.teamId, options);

    const response = {
      selections: result.selections.map(selection => ({
        id: selection.id,
        memberId: selection.member_id,
        memberName: selection.member_name,
        selectedDate: selection.selected_date,
        selectedAt: selection.selected_at,
        selectionMethod: selection.selection_method
      })),
      pagination: result.pagination
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

// GET /api/v1/teams/:teamId/analytics/fairness - Get fairness analytics
router.get('/fairness', async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Get fairness metrics
    const fairnessResult = await query(`
      SELECT *
      FROM team_fairness_metrics
      WHERE team_id = $1
    `, [req.params.teamId]);

    if (fairnessResult.rows.length === 0) {
      return res.error('TEAM_NOT_FOUND', 'Team metrics not found', null, 404);
    }

    const teamMetrics = fairnessResult.rows[0];

    // Get individual member stats
    const memberStatsResult = await query(`
      SELECT
        m.id as member_id,
        m.name as member_name,
        atm.total_selections,
        atm.days_since_last_selection,
        CASE
          WHEN atm.total_selections > 0
          THEN ROUND(atm.total_selections::decimal / NULLIF($2, 0), 2)
          ELSE 0
        END as fairness_ratio,
        CASE
          WHEN COUNT(s.id) > 1
          THEN ROUND(AVG(
            EXTRACT(DAYS FROM (s.selected_date - LAG(s.selected_date) OVER (
              PARTITION BY s.member_id ORDER BY s.selected_date
            )))
          ), 1)
          ELSE 0
        END as average_days_between_selections
      FROM members m
      LEFT JOIN active_team_members atm ON m.id = atm.id
      LEFT JOIN selections s ON m.id = s.member_id
      WHERE m.team_id = $1 AND m.is_active = TRUE
      GROUP BY m.id, m.name, atm.total_selections, atm.days_since_last_selection
      ORDER BY m.position
    `, [req.params.teamId, teamMetrics.avg_selections_per_member]);

    // Get rotation cycles information
    const cyclesResult = await query(`
      WITH cycle_analysis AS (
        SELECT
          rq.total_selections,
          COUNT(m.id) as active_members,
          CASE
            WHEN COUNT(m.id) > 0
            THEN rq.total_selections / COUNT(m.id)
            ELSE 0
          END as completed_cycles,
          CASE
            WHEN COUNT(m.id) > 0
            THEN (rq.total_selections % COUNT(m.id)) * 100 / COUNT(m.id)
            ELSE 0
          END as current_cycle_progress
        FROM rotation_queues rq
        LEFT JOIN members m ON m.team_id = rq.team_id AND m.is_active = TRUE
        WHERE rq.team_id = $1
        GROUP BY rq.total_selections
      ),
      avg_cycle_duration AS (
        SELECT
          CASE
            WHEN COUNT(*) > 1
            THEN AVG(cycle_days)
            ELSE 0
          END as average_cycle_duration
        FROM (
          SELECT
            LAG(selected_date) OVER (ORDER BY selected_date) as prev_date,
            selected_date,
            ROW_NUMBER() OVER (ORDER BY selected_date) as selection_number,
            CASE
              WHEN (ROW_NUMBER() OVER (ORDER BY selected_date) - 1) % (
                SELECT COUNT(*) FROM members WHERE team_id = $1 AND is_active = TRUE
              ) = 0 AND ROW_NUMBER() OVER (ORDER BY selected_date) > 1
              THEN EXTRACT(DAYS FROM (
                selected_date - LAG(selected_date, (
                  SELECT COUNT(*) FROM members WHERE team_id = $1 AND is_active = TRUE
                )) OVER (ORDER BY selected_date)
              ))
              ELSE NULL
            END as cycle_days
          FROM selections
          WHERE team_id = $1
        ) cycle_calc
        WHERE cycle_days IS NOT NULL
      )
      SELECT
        ca.completed_cycles::integer,
        ca.current_cycle_progress::integer,
        COALESCE(acd.average_cycle_duration, 0)::numeric(5,1) as average_cycle_duration
      FROM cycle_analysis ca
      CROSS JOIN avg_cycle_duration acd
    `, [req.params.teamId]);

    const cyclesData = cyclesResult.rows[0] || {
      completed_cycles: 0,
      current_cycle_progress: 0,
      average_cycle_duration: 0
    };

    const response = {
      fairnessCoefficient: parseFloat(teamMetrics.fairness_coefficient),
      memberStats: memberStatsResult.rows.map(member => ({
        memberId: member.member_id,
        memberName: member.member_name,
        totalSelections: parseInt(member.total_selections) || 0,
        daysSinceLastSelection: parseInt(member.days_since_last_selection) || 999,
        averageDaysBetweenSelections: parseFloat(member.average_days_between_selections) || 0,
        fairnessRatio: parseFloat(member.fairness_ratio) || 0
      })),
      rotationCycles: {
        completed: cyclesData.completed_cycles,
        currentCycleProgress: cyclesData.current_cycle_progress,
        averageCycleDuration: parseFloat(cyclesData.average_cycle_duration)
      }
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

// GET /api/v1/teams/:teamId/export - Export team data
router.get('/export', requireAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);

    // Verify team exists
    const team = await DatabaseService.getTeamById(req.params.teamId);

    const format = req.query.format || 'json';
    const includeHistory = req.query.includeHistory === 'true';

    if (!['json', 'csv'].includes(format)) {
      return res.error('VALIDATION_ERROR', 'Format must be json or csv');
    }

    // Get team data
    const members = await DatabaseService.getTeamMembers(req.params.teamId, true);
    const rotationQueue = await DatabaseService.getRotationQueue(req.params.teamId);

    let selections = [];
    if (includeHistory) {
      const historyResult = await DatabaseService.getSelectionHistory(req.params.teamId, {
        limit: 10000, // Large limit for export
        offset: 0
      });
      selections = historyResult.selections;
    }

    const exportData = {
      team: {
        id: team.id,
        name: team.name,
        shortCode: team.short_code,
        timezone: team.timezone,
        createdAt: team.created_at,
        lastActiveAt: team.last_active_at
      },
      members: members.map(member => ({
        id: member.id,
        name: member.name,
        position: member.position,
        isActive: member.is_active,
        joinedAt: member.joined_at,
        lastSelectedAt: member.last_selected_at
      })),
      rotationQueue: {
        currentPosition: rotationQueue.current_position,
        queueOrder: JSON.parse(rotationQueue.queue_order),
        totalSelections: rotationQueue.total_selections,
        lastShuffledAt: rotationQueue.last_shuffled_at,
        algorithm: rotationQueue.algorithm
      },
      ...(includeHistory && {
        selections: selections.map(selection => ({
          id: selection.id,
          memberId: selection.member_id,
          memberName: selection.member_name,
          selectedDate: selection.selected_date,
          selectedAt: selection.selected_at,
          selectionMethod: selection.selection_method
        }))
      }),
      exportedAt: new Date().toISOString(),
      format: format,
      includeHistory: includeHistory
    };

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="team-${team.id}-export.json"`);
      res.success(exportData);
    } else if (format === 'csv') {
      // Simple CSV export for members
      const csvHeaders = 'ID,Name,Position,Active,JoinedAt,LastSelectedAt\n';
      const csvRows = members.map(member =>
        `${member.id},"${member.name}",${member.position},${member.is_active},${member.joined_at},${member.last_selected_at || ''}`
      ).join('\n');

      const csvContent = csvHeaders + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="team-${team.id}-members.csv"`);
      res.send(csvContent);
    }

  } catch (err) {
    next(err);
  }
});

export default router;