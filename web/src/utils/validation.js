import { TEAM_VALIDATION } from './constants'

export const validateTeamName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: true, error: null } // Team name is optional
  }

  if (name.length > TEAM_VALIDATION.MAX_TEAM_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Team name must be ${TEAM_VALIDATION.MAX_TEAM_NAME_LENGTH} characters or less`
    }
  }

  return { isValid: true, error: null }
}

export const validateMemberName = (name) => {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: 'Member name is required'
    }
  }

  if (name.trim().length > TEAM_VALIDATION.MAX_MEMBER_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Member name must be ${TEAM_VALIDATION.MAX_MEMBER_NAME_LENGTH} characters or less`
    }
  }

  // Check for only whitespace
  if (name.trim().length === 0) {
    return {
      isValid: false,
      error: 'Member name cannot be only whitespace'
    }
  }

  return { isValid: true, error: null }
}

export const validateTeamMembers = (members) => {
  const validMembers = members.filter(m => m && m.trim())

  if (validMembers.length < TEAM_VALIDATION.MIN_MEMBERS) {
    return {
      isValid: false,
      error: `Team must have at least ${TEAM_VALIDATION.MIN_MEMBERS} members`
    }
  }

  if (validMembers.length > TEAM_VALIDATION.MAX_MEMBERS) {
    return {
      isValid: false,
      error: `Team cannot have more than ${TEAM_VALIDATION.MAX_MEMBERS} members`
    }
  }

  // Check for duplicate names (case insensitive)
  const memberNames = validMembers.map(m => m.trim().toLowerCase())
  const uniqueNames = new Set(memberNames)

  if (memberNames.length !== uniqueNames.size) {
    return {
      isValid: false,
      error: 'All team member names must be unique'
    }
  }

  // Validate each member name
  for (const member of validMembers) {
    const validation = validateMemberName(member)
    if (!validation.isValid) {
      return validation
    }
  }

  return { isValid: true, error: null }
}

export const validateShortCode = (code) => {
  if (!code || code.length !== TEAM_VALIDATION.SHORT_CODE_LENGTH) {
    return {
      isValid: false,
      error: `Team code must be exactly ${TEAM_VALIDATION.SHORT_CODE_LENGTH} characters`
    }
  }

  // Check if contains only letters
  if (!/^[A-Z]+$/.test(code)) {
    return {
      isValid: false,
      error: 'Team code must contain only letters'
    }
  }

  return { isValid: true, error: null }
}