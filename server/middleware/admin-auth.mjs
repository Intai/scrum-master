// Admin authentication middleware
// Based on API design session-based admin privileges

import { BusinessError } from './error-handler.mjs';
import { query } from '../config/database.mjs';

// Admin session validation middleware
export const requireAdmin = async (req, res, next) => {
  try {
    const adminSessionId = req.headers['x-admin-session'];

    if (!adminSessionId) {
      throw new BusinessError('ADMIN_REQUIRED', 'Admin session required for this operation');
    }

    // Validate admin session exists and belongs to the team
    const teamId = req.params.teamId;
    const result = await query(
      'SELECT id FROM teams WHERE id = $1 AND admin_session_id = $2 AND NOT is_archived',
      [teamId, adminSessionId]
    );

    if (result.rows.length === 0) {
      throw new BusinessError('ADMIN_REQUIRED', 'Invalid admin session or team not found');
    }

    // Update team last_active_at timestamp
    await query(
      'UPDATE teams SET last_active_at = NOW() WHERE id = $1',
      [teamId]
    );

    // Add admin info to request
    req.admin = {
      sessionId: adminSessionId,
      teamId: teamId
    };

    next();
  } catch (err) {
    next(err);
  }
};

// Optional admin check (for operations that can be performed by admin or public)
export const optionalAdmin = async (req, res, next) => {
  try {
    const adminSessionId = req.headers['x-admin-session'];

    if (adminSessionId) {
      const teamId = req.params.teamId;
      const result = await query(
        'SELECT id FROM teams WHERE id = $1 AND admin_session_id = $2 AND NOT is_archived',
        [teamId, adminSessionId]
      );

      if (result.rows.length > 0) {
        // Update team last_active_at timestamp
        await query(
          'UPDATE teams SET last_active_at = NOW() WHERE id = $1',
          [teamId]
        );

        req.admin = {
          sessionId: adminSessionId,
          teamId: teamId
        };
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};