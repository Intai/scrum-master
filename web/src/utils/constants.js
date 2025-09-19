// Application constants

export const TEAM_VALIDATION = {
  MIN_MEMBERS: 2,
  MAX_MEMBERS: 50,
  MAX_TEAM_NAME_LENGTH: 50,
  MAX_MEMBER_NAME_LENGTH: 30,
  SHORT_CODE_LENGTH: 4,
}

export const AVAILABILITY_STATUSES = {
  AVAILABLE: 'available',
  OUT_OF_OFFICE: 'out_of_office',
  SICK: 'sick',
  WORKING_FROM_HOME: 'working_from_home',
}

export const CONTENT_CYCLES = {
  TIP_CYCLE_DAYS: 14,
  QUIZ_CYCLE_DAYS: 30,
}

export const API_TIMEOUTS = {
  DEFAULT: 10000,
  UPLOAD: 30000,
}

export const STATUS_ICONS = {
  [AVAILABILITY_STATUSES.AVAILABLE]: {
    icon: '✅',
    text: 'Available',
    color: 'text-success-600 bg-success-50',
  },
  [AVAILABILITY_STATUSES.OUT_OF_OFFICE]: {
    icon: '🏖️',
    text: 'Out of office',
    color: 'text-warning-600 bg-warning-50',
  },
  [AVAILABILITY_STATUSES.SICK]: {
    icon: '🤒',
    text: 'Sick leave',
    color: 'text-red-600 bg-red-50',
  },
  [AVAILABILITY_STATUSES.WORKING_FROM_HOME]: {
    icon: '🏠',
    text: 'Working from home',
    color: 'text-primary-600 bg-primary-50',
  },
}

export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
]