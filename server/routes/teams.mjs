// Teams API routes
// Based on API design specification

import express from 'express';
import { DatabaseService } from '../services/database.mjs';
import { requireAdmin, optionalAdmin } from '../middleware/admin-auth.mjs';
import {
  validateTeam,
  validateTeamId,
  validateShortCodeFormat
} from '../utils/validators.mjs';
import {
  generateTeamId,
  generateShortCode,
  generateAdminSessionId
} from '../utils/id-generator.mjs';

const router = express.Router();

// POST /api/v1/teams - Create team
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    validateTeam(req.body);

    // Generate unique IDs
    let teamId, shortCode;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      teamId = generateTeamId();
      shortCode = generateShortCode();
      attempts++;

      // Check if short code already exists
      const shortCodeExists = await DatabaseService.checkShortCodeExists(shortCode);
      if (!shortCodeExists) {
        break;
      }

      if (attempts >= maxAttempts) {
        return res.error('INTERNAL_ERROR', 'Unable to generate unique short code', null, 500);
      }
    } while (attempts < maxAttempts);

    const adminSessionId = generateAdminSessionId();

    // Prepare team data
    const teamData = {
      id: teamId,
      shortCode: shortCode,
      name: req.body.name || 'Scrum Team',
      timezone: req.body.timezone || 'UTC',
      adminSessionId: adminSessionId,
      members: req.body.members || []
    };

    // Create team and members
    const { team, members } = await DatabaseService.createTeam(teamData);

    // Prepare response
    const response = {
      id: team.id,
      name: team.name,
      shortCode: team.short_code,
      shareUrl: `${req.protocol}://${req.get('host')}/team/${team.id}`,
      timezone: team.timezone,
      createdAt: team.created_at,
      adminSessionId: team.admin_session_id,
      members: members.map(member => ({
        id: member.id,
        name: member.name,
        position: member.position,
        isActive: member.is_active
      }))
    };

    res.status(201).success(response);

  } catch (err) {
    next(err);
  }
});

// GET /api/v1/teams/:teamId - Get team
router.get('/:teamId', optionalAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);

    // Get team
    const team = await DatabaseService.getTeamById(req.params.teamId);

    // Get team members
    const members = await DatabaseService.getTeamMembers(req.params.teamId);

    // Get rotation queue
    const rotationQueue = await DatabaseService.getRotationQueue(req.params.teamId);

    // Get today's selection
    const todaysSelection = await DatabaseService.getTodaysSelection(req.params.teamId);

    // Transform members data
    const membersData = members.map(member => ({
      id: member.id,
      name: member.name,
      position: member.position,
      isActive: member.is_active,
      lastSelectedAt: member.last_selected_at,
      isAvailable: true, // Will be calculated by view in real implementation
      unavailableUntil: null // Will be calculated from availability_periods
    }));

    // Transform rotation queue data
    const queueOrder = JSON.parse(rotationQueue.queue_order);
    const rotationData = {
      currentPosition: rotationQueue.current_position,
      queueOrder: queueOrder,
      totalSelections: rotationQueue.total_selections
    };

    // Transform today's selection data
    let todaysSelectionData = null;
    if (todaysSelection) {
      todaysSelectionData = {
        memberId: todaysSelection.member_id,
        memberName: todaysSelection.member_name,
        selectedDate: todaysSelection.selected_date,
        selectionMethod: todaysSelection.selection_method
      };
    }

    const response = {
      id: team.id,
      name: team.name,
      shortCode: team.short_code,
      timezone: team.timezone,
      members: membersData,
      rotationQueue: rotationData,
      todaysSelection: todaysSelectionData
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

// GET /api/v1/teams/code/:shortCode - Get team by short code
router.get('/code/:shortCode', optionalAdmin, async (req, res, next) => {
  try {
    const shortCode = req.params.shortCode.toUpperCase();
    validateShortCodeFormat(shortCode);

    // Get team by short code
    const team = await DatabaseService.getTeamByShortCode(shortCode);

    // Redirect to regular team endpoint
    req.params.teamId = team.id;

    // Get team members
    const members = await DatabaseService.getTeamMembers(team.id);

    // Get rotation queue
    const rotationQueue = await DatabaseService.getRotationQueue(team.id);

    // Get today's selection
    const todaysSelection = await DatabaseService.getTodaysSelection(team.id);

    // Transform members data
    const membersData = members.map(member => ({
      id: member.id,
      name: member.name,
      position: member.position,
      isActive: member.is_active,
      lastSelectedAt: member.last_selected_at,
      isAvailable: true,
      unavailableUntil: null
    }));

    // Transform rotation queue data
    const queueOrder = JSON.parse(rotationQueue.queue_order);
    const rotationData = {
      currentPosition: rotationQueue.current_position,
      queueOrder: queueOrder,
      totalSelections: rotationQueue.total_selections
    };

    // Transform today's selection data
    let todaysSelectionData = null;
    if (todaysSelection) {
      todaysSelectionData = {
        memberId: todaysSelection.member_id,
        memberName: todaysSelection.member_name,
        selectedDate: todaysSelection.selected_date,
        selectionMethod: todaysSelection.selection_method
      };
    }

    const response = {
      id: team.id,
      name: team.name,
      shortCode: team.short_code,
      timezone: team.timezone,
      members: membersData,
      rotationQueue: rotationData,
      todaysSelection: todaysSelectionData
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/teams/:teamId - Update team settings
router.patch('/:teamId', requireAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);

    // Validate allowed updates
    const allowedUpdates = ['name', 'timezone'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.error('VALIDATION_ERROR', 'No valid fields to update');
    }

    // Validate team name if provided
    if (updates.name) {
      if (typeof updates.name !== 'string' || updates.name.length < 1 || updates.name.length > 50) {
        return res.error('VALIDATION_ERROR', 'Team name must be between 1 and 50 characters');
      }
    }

    // Validate timezone if provided
    if (updates.timezone) {
      if (typeof updates.timezone !== 'string') {
        return res.error('VALIDATION_ERROR', 'Timezone must be a string');
      }
    }

    // Update team
    const updatedTeam = await DatabaseService.updateTeam(req.params.teamId, updates);

    const response = {
      id: updatedTeam.id,
      name: updatedTeam.name,
      shortCode: updatedTeam.short_code,
      timezone: updatedTeam.timezone,
      updatedAt: updatedTeam.last_active_at
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

export default router;