// Input validation utilities
// Based on database design constraints

import { ValidationError } from '../middleware/error-handler.mjs';
import { isValidTeamId, isValidShortCode, isValidUUID } from './id-generator.mjs';

// Team validation
export const validateTeam = (team) => {
  const errors = [];

  if (!team.name || typeof team.name !== 'string') {
    errors.push({ field: 'name', message: 'Team name is required' });
  } else if (team.name.length < 1 || team.name.length > 50) {
    errors.push({ field: 'name', message: 'Team name must be between 1 and 50 characters' });
  }

  if (team.timezone && typeof team.timezone !== 'string') {
    errors.push({ field: 'timezone', message: 'Timezone must be a string' });
  }

  if (team.members && !Array.isArray(team.members)) {
    errors.push({ field: 'members', message: 'Members must be an array' });
  } else if (team.members) {
    team.members.forEach((member, index) => {
      if (!member.name || typeof member.name !== 'string') {
        errors.push({ field: `members[${index}].name`, message: 'Member name is required' });
      } else if (member.name.length < 1 || member.name.length > 30) {
        errors.push({ field: `members[${index}].name`, message: 'Member name must be between 1 and 30 characters' });
      }
    });
  }

  if (errors.length > 0) {
    throw new ValidationError('Team validation failed', errors);
  }
};

// Member validation
export const validateMember = (member) => {
  const errors = [];

  if (!member.name || typeof member.name !== 'string') {
    errors.push({ field: 'name', message: 'Member name is required' });
  } else if (member.name.length < 1 || member.name.length > 30) {
    errors.push({ field: 'name', message: 'Member name must be between 1 and 30 characters' });
  }

  if (member.position !== undefined && (!Number.isInteger(member.position) || member.position < 0)) {
    errors.push({ field: 'position', message: 'Position must be a non-negative integer' });
  }

  if (member.isActive !== undefined && typeof member.isActive !== 'boolean') {
    errors.push({ field: 'isActive', message: 'isActive must be a boolean' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Member validation failed', errors);
  }
};

// Availability period validation
export const validateAvailabilityPeriod = (period) => {
  const errors = [];

  if (!period.startDate) {
    errors.push({ field: 'startDate', message: 'Start date is required' });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(period.startDate)) {
    errors.push({ field: 'startDate', message: 'Start date must be in YYYY-MM-DD format' });
  }

  if (period.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(period.endDate)) {
    errors.push({ field: 'endDate', message: 'End date must be in YYYY-MM-DD format' });
  }

  if (period.startDate && period.endDate && period.endDate < period.startDate) {
    errors.push({ field: 'endDate', message: 'End date must be after start date' });
  }

  if (period.reason && typeof period.reason !== 'string') {
    errors.push({ field: 'reason', message: 'Reason must be a string' });
  } else if (period.reason && period.reason.length > 200) {
    errors.push({ field: 'reason', message: 'Reason must be 200 characters or less' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Availability period validation failed', errors);
  }
};

// Quiz answer validation
export const validateQuizAnswer = (answer) => {
  const errors = [];

  if (!answer.answer || typeof answer.answer !== 'string') {
    errors.push({ field: 'answer', message: 'Answer is required' });
  } else if (answer.answer.length > 500) {
    errors.push({ field: 'answer', message: 'Answer must be 500 characters or less' });
  }

  if (answer.memberName && typeof answer.memberName !== 'string') {
    errors.push({ field: 'memberName', message: 'Member name must be a string' });
  } else if (answer.memberName && answer.memberName.length > 30) {
    errors.push({ field: 'memberName', message: 'Member name must be 30 characters or less' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Quiz answer validation failed', errors);
  }
};

// Tip feedback validation
export const validateTipFeedback = (feedback) => {
  const errors = [];

  if (!Number.isInteger(feedback.rating) || feedback.rating < 1 || feedback.rating > 5) {
    errors.push({ field: 'rating', message: 'Rating must be an integer between 1 and 5' });
  }

  if (feedback.memberName && typeof feedback.memberName !== 'string') {
    errors.push({ field: 'memberName', message: 'Member name must be a string' });
  } else if (feedback.memberName && feedback.memberName.length > 30) {
    errors.push({ field: 'memberName', message: 'Member name must be 30 characters or less' });
  }

  if (feedback.comment && typeof feedback.comment !== 'string') {
    errors.push({ field: 'comment', message: 'Comment must be a string' });
  } else if (feedback.comment && feedback.comment.length > 1000) {
    errors.push({ field: 'comment', message: 'Comment must be 1000 characters or less' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Tip feedback validation failed', errors);
  }
};

// ID validation helpers
export const validateTeamId = (teamId) => {
  if (!isValidTeamId(teamId)) {
    throw new ValidationError('Invalid team ID format');
  }
};

export const validateMemberId = (memberId) => {
  if (!isValidUUID(memberId)) {
    throw new ValidationError('Invalid member ID format');
  }
};

export const validateShortCodeFormat = (shortCode) => {
  if (!isValidShortCode(shortCode)) {
    throw new ValidationError('Invalid short code format');
  }
};

// Pagination validation
export const validatePagination = (query) => {
  const limit = parseInt(query.limit) || 50;
  const offset = parseInt(query.offset) || 0;

  if (limit < 1 || limit > 200) {
    throw new ValidationError('Limit must be between 1 and 200');
  }

  if (offset < 0) {
    throw new ValidationError('Offset must be non-negative');
  }

  return { limit, offset };
};

// Date validation
export const validateDateRange = (startDate, endDate) => {
  const errors = [];

  if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    errors.push({ field: 'startDate', message: 'Start date must be in YYYY-MM-DD format' });
  }

  if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    errors.push({ field: 'endDate', message: 'End date must be in YYYY-MM-DD format' });
  }

  if (startDate && endDate && endDate < startDate) {
    errors.push({ field: 'dateRange', message: 'End date must be after start date' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Date range validation failed', errors);
  }
};