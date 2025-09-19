// ID generation utilities
// Based on database design constraints

import crypto from 'crypto';

// Generate 8-character team ID (alphanumeric, URL-safe)
export const generateTeamId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

// Generate 4-character short code (uppercase letters, excluding confusing chars)
export const generateShortCode = () => {
  // Exclude confusing characters: O, I, 0, 1
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

// Generate admin session ID (64 characters, cryptographically secure)
export const generateAdminSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate team ID format
export const isValidTeamId = (id) => {
  return /^[a-zA-Z0-9]{8}$/.test(id);
};

// Validate short code format
export const isValidShortCode = (code) => {
  return /^[A-Z]{4}$/.test(code);
};

// Validate UUID format
export const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};