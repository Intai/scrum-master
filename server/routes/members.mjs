// Members API routes
// Based on API design specification

import express from 'express';
import { DatabaseService } from '../services/database.mjs';
import { requireAdmin } from '../middleware/admin-auth.mjs';
import {
  validateMember,
  validateTeamId,
  validateMemberId
} from '../utils/validators.mjs';

const router = express.Router({ mergeParams: true });

// POST /api/v1/teams/:teamId/members - Add member
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);
    validateMember(req.body);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Add member
    const member = await DatabaseService.addMember(req.params.teamId, req.body);

    const response = {
      id: member.id,
      name: member.name,
      position: member.position,
      isActive: member.is_active,
      joinedAt: member.joined_at
    };

    res.status(201).success(response);

  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/teams/:teamId/members/:memberId - Update member
router.patch('/:memberId', requireAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);
    validateMemberId(req.params.memberId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Verify member exists and belongs to team
    const existingMember = await DatabaseService.getMemberById(req.params.memberId);
    if (existingMember.team_id !== req.params.teamId) {
      return res.error('MEMBER_NOT_FOUND', 'Member not found in this team', null, 404);
    }

    // Validate allowed updates
    const allowedUpdates = ['name', 'isActive'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'isActive') {
          updates.is_active = req.body[key];
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.error('VALIDATION_ERROR', 'No valid fields to update');
    }

    // Validate member data if provided
    if (updates.name || updates.is_active !== undefined) {
      const memberData = {
        name: updates.name || existingMember.name,
        isActive: updates.is_active !== undefined ? updates.is_active : existingMember.is_active
      };
      validateMember(memberData);
    }

    // Update member
    const updatedMember = await DatabaseService.updateMember(req.params.memberId, updates);

    const response = {
      id: updatedMember.id,
      name: updatedMember.name,
      position: updatedMember.position,
      isActive: updatedMember.is_active,
      lastSelectedAt: updatedMember.last_selected_at
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/teams/:teamId/members/:memberId - Remove member
router.delete('/:memberId', requireAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);
    validateMemberId(req.params.memberId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Verify member exists and belongs to team
    const existingMember = await DatabaseService.getMemberById(req.params.memberId);
    if (existingMember.team_id !== req.params.teamId) {
      return res.error('MEMBER_NOT_FOUND', 'Member not found in this team', null, 404);
    }

    // Remove member
    const { member, affectedSelections } = await DatabaseService.removeMember(req.params.memberId);

    const response = {
      message: 'Member removed successfully',
      affectedSelections: affectedSelections
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/teams/:teamId/members/order - Reorder members
router.put('/order', requireAdmin, async (req, res, next) => {
  try {
    validateTeamId(req.params.teamId);

    // Verify team exists
    await DatabaseService.getTeamById(req.params.teamId);

    // Validate request body
    if (!req.body.memberOrder || !Array.isArray(req.body.memberOrder)) {
      return res.error('VALIDATION_ERROR', 'memberOrder must be an array of member IDs');
    }

    const memberOrder = req.body.memberOrder;

    // Validate all member IDs
    for (const memberId of memberOrder) {
      validateMemberId(memberId);
    }

    // Get current team members
    const currentMembers = await DatabaseService.getTeamMembers(req.params.teamId);
    const currentMemberIds = currentMembers.map(m => m.id);

    // Verify all provided member IDs belong to the team
    for (const memberId of memberOrder) {
      if (!currentMemberIds.includes(memberId)) {
        return res.error('MEMBER_NOT_FOUND', `Member ${memberId} not found in this team`, null, 404);
      }
    }

    // Verify all active members are included
    const activeMemberIds = currentMembers.filter(m => m.is_active).map(m => m.id);
    for (const memberId of activeMemberIds) {
      if (!memberOrder.includes(memberId)) {
        return res.error('VALIDATION_ERROR', `All active members must be included in the order`);
      }
    }

    // Update member positions and rotation queue
    const updatePromises = memberOrder.map((memberId, index) =>
      DatabaseService.updateMember(memberId, { position: index })
    );

    await Promise.all(updatePromises);

    // Update rotation queue order
    await DatabaseService.updateRotationQueue(req.params.teamId, memberOrder);

    const response = {
      message: 'Member order updated successfully',
      newOrder: memberOrder
    };

    res.success(response);

  } catch (err) {
    next(err);
  }
});

export default router;