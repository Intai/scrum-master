# API Design: Daily Scrum Master Selector

## Overview

RESTful API specification for the scrum master rotation application. The API provides endpoints for team management, member rotation, content delivery, and analytics without requiring user authentication.

### API Base Structure

```
Base URL: /api/v1
Content-Type: application/json
Authentication: Session-based admin privileges
Rate Limiting: 100 requests/minute per IP
```

### Response Format Standards

```json
{
  "success": true,
  "data": { /* response payload */ },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0",
    "requestId": "req_123456"
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Team name must be between 1 and 50 characters",
    "details": {
      "field": "name",
      "constraint": "length"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_123456"
  }
}
```

## Teams API

### Create Team
**POST** `/api/v1/teams`

Creates a new team with members and generates sharing URLs.

**Request Body:**
```json
{
  "name": "Development Team Alpha",
  "timezone": "America/New_York",
  "members": [
    {"name": "Alice Johnson"},
    {"name": "Bob Smith"},
    {"name": "Charlie Brown"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4",
    "name": "Development Team Alpha",
    "shortCode": "ABCD",
    "shareUrl": "https://app.example.com/team/a1b2c3d4",
    "timezone": "America/New_York",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "adminSessionId": "sess_789xyz",
    "members": [
      {
        "id": "mem_001",
        "name": "Alice Johnson",
        "position": 0,
        "isActive": true
      }
    ]
  }
}
```

**Status Codes:**
- `201` - Team created successfully
- `400` - Invalid request data
- `409` - Short code collision (auto-retry)
- `429` - Rate limit exceeded

### Get Team
**GET** `/api/v1/teams/{teamId}`

Retrieves team information and current state.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4",
    "name": "Development Team Alpha",
    "shortCode": "ABCD",
    "timezone": "America/New_York",
    "members": [
      {
        "id": "mem_001",
        "name": "Alice Johnson",
        "position": 0,
        "isActive": true,
        "lastSelectedAt": "2024-01-14T09:00:00.000Z",
        "isAvailable": true,
        "unavailableUntil": null
      }
    ],
    "rotationQueue": {
      "currentPosition": 1,
      "queueOrder": ["mem_001", "mem_002", "mem_003"],
      "totalSelections": 45
    },
    "todaysSelection": {
      "memberId": "mem_002",
      "memberName": "Bob Smith",
      "selectedDate": "2024-01-15",
      "selectionMethod": "automatic"
    }
  }
}
```

### Get Team by Short Code
**GET** `/api/v1/teams/code/{shortCode}`

Access team via 4-character short code.

**Response:** Same as Get Team

### Update Team Settings
**PATCH** `/api/v1/teams/{teamId}`

Updates team configuration (admin privileges required).

**Request Body:**
```json
{
  "name": "Updated Team Name",
  "timezone": "Europe/London"
}
```

**Headers:**
```
X-Admin-Session: sess_789xyz
```

## Members API

### Add Member
**POST** `/api/v1/teams/{teamId}/members`

Adds a new member to the team rotation.

**Request Body:**
```json
{
  "name": "Diana Prince"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "mem_004",
    "name": "Diana Prince",
    "position": 3,
    "isActive": true,
    "joinedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Member
**PATCH** `/api/v1/teams/{teamId}/members/{memberId}`

Updates member information or availability.

**Request Body:**
```json
{
  "name": "Diana Prince-Wayne",
  "isActive": false
}
```

### Remove Member
**DELETE** `/api/v1/teams/{teamId}/members/{memberId}`

Soft deletes a member from the team (preserves history).

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Member removed successfully",
    "affectedSelections": 12
  }
}
```

### Reorder Members
**PUT** `/api/v1/teams/{teamId}/members/order`

Updates the rotation queue order.

**Request Body:**
```json
{
  "memberOrder": ["mem_003", "mem_001", "mem_002", "mem_004"]
}
```

## Availability API

### Set Member Availability
**POST** `/api/v1/teams/{teamId}/members/{memberId}/availability`

Marks member as out of office for specified period.

**Request Body:**
```json
{
  "startDate": "2024-01-16",
  "endDate": "2024-01-20",
  "reason": "Vacation in Hawaii"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "avail_001",
    "startDate": "2024-01-16",
    "endDate": "2024-01-20",
    "reason": "Vacation in Hawaii",
    "isActive": true,
    "impactOnRotation": {
      "daysSkipped": 5,
      "nextSelectionDate": "2024-01-23"
    }
  }
}
```

### Get Member Availability
**GET** `/api/v1/teams/{teamId}/members/{memberId}/availability`

Lists all availability periods for a member.

### Quick Toggle Availability
**POST** `/api/v1/teams/{teamId}/members/{memberId}/availability/today`

Quick toggle for today-only unavailability.

**Request Body:**
```json
{
  "isAvailable": false,
  "reason": "Sick day"
}
```

### Return Early
**DELETE** `/api/v1/teams/{teamId}/members/{memberId}/availability/{availabilityId}`

Cancels an existing availability period early.

## Rotation API

### Get Today's Selection
**GET** `/api/v1/teams/{teamId}/rotation/today`

Retrieves today's scrum master selection.

**Response:**
```json
{
  "success": true,
  "data": {
    "selectedMember": {
      "id": "mem_002",
      "name": "Bob Smith"
    },
    "selectedDate": "2024-01-15",
    "selectionMethod": "automatic",
    "confidence": "high",
    "alternativeMember": null,
    "rotationMetrics": {
      "daysSinceLastSelection": 3,
      "totalSelectionsCount": 12,
      "fairnessCoefficient": 0.95
    }
  }
}
```

### Get Rotation Queue
**GET** `/api/v1/teams/{teamId}/rotation/queue`

Shows current rotation order and upcoming selections.

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPosition": 1,
    "queueOrder": [
      {
        "memberId": "mem_002",
        "memberName": "Bob Smith",
        "isNext": true,
        "daysSinceLastSelection": 3
      },
      {
        "memberId": "mem_003",
        "memberName": "Charlie Brown",
        "isNext": false,
        "daysSinceLastSelection": 1
      }
    ],
    "upcomingSelections": [
      {
        "date": "2024-01-15",
        "memberId": "mem_002",
        "memberName": "Bob Smith"
      },
      {
        "date": "2024-01-16",
        "memberId": "mem_003",
        "memberName": "Charlie Brown"
      }
    ]
  }
}
```

### Manual Override Selection
**POST** `/api/v1/teams/{teamId}/rotation/override`

Manually override today's automatic selection (admin only).

**Request Body:**
```json
{
  "memberId": "mem_001",
  "reason": "Emergency standup coverage"
}
```

**Headers:**
```
X-Admin-Session: sess_789xyz
```

### Regenerate Queue
**POST** `/api/v1/teams/{teamId}/rotation/regenerate`

Regenerates rotation queue for fairness reset (admin only).

## Content API

### Get Daily Tip
**GET** `/api/v1/teams/{teamId}/content/tip`

Retrieves today's standup tip for the team.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tip_001",
    "title": "Time Boxing Techniques",
    "content": "Set a clear time limit for each standup discussion point. Use a visible timer to keep the meeting focused and respect everyone's schedule.",
    "category": "time_management",
    "difficulty": "beginner",
    "targetTeamSize": "any",
    "helpfulnessRating": 4.2,
    "canProvideFeedback": true
  }
}
```

### Get Daily Quiz
**GET** `/api/v1/teams/{teamId}/content/quiz`

Retrieves today's quiz question for the team.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "quiz_001",
    "question": "What does the acronym 'SOLID' represent in software engineering?",
    "options": [
      "Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion",
      "Simple objects, Limited interfaces, Direct dependencies",
      "Structured programming principles",
      "Software optimization guidelines"
    ],
    "category": "tech",
    "difficulty": "medium",
    "explanation": "SOLID represents five fundamental principles of object-oriented design that make software more maintainable and flexible.",
    "hasBeenAnswered": false,
    "teamStats": {
      "totalResponses": 0,
      "correctPercentage": 0
    }
  }
}
```

### Submit Quiz Answer
**POST** `/api/v1/teams/{teamId}/content/quiz/{quizId}/answer`

Submits answer to daily quiz question.

**Request Body:**
```json
{
  "answer": "Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion",
  "memberName": "Alice Johnson"  // optional for anonymous
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "correctAnswer": "Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion",
    "explanation": "SOLID represents five fundamental principles...",
    "teamStats": {
      "totalResponses": 3,
      "correctPercentage": 67,
      "yourRank": 2
    }
  }
}
```

### Submit Tip Feedback
**POST** `/api/v1/teams/{teamId}/content/tip/{tipId}/feedback`

Provides feedback on tip helpfulness.

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Really helped us reduce meeting time!",
  "memberName": "Bob Smith"  // optional for anonymous
}
```

## History API

### Get Selection History
**GET** `/api/v1/teams/{teamId}/history/selections`

Retrieves chronological selection history.

**Query Parameters:**
- `limit` (default: 50, max: 200)
- `offset` (default: 0)
- `startDate` (ISO date)
- `endDate` (ISO date)
- `memberId` (filter by specific member)

**Response:**
```json
{
  "success": true,
  "data": {
    "selections": [
      {
        "id": "sel_001",
        "memberId": "mem_001",
        "memberName": "Alice Johnson",
        "selectedDate": "2024-01-15",
        "selectedAt": "2024-01-15T09:00:00.000Z",
        "selectionMethod": "automatic"
      }
    ],
    "pagination": {
      "total": 125,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Get Fairness Analytics
**GET** `/api/v1/teams/{teamId}/analytics/fairness`

Provides rotation fairness metrics and statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "fairnessCoefficient": 0.95,
    "memberStats": [
      {
        "memberId": "mem_001",
        "memberName": "Alice Johnson",
        "totalSelections": 12,
        "daysSinceLastSelection": 3,
        "averageDaysBetweenSelections": 3.2,
        "fairnessRatio": 1.05
      }
    ],
    "rotationCycles": {
      "completed": 4,
      "currentCycleProgress": 75,
      "averageCycleDuration": 12.5
    }
  }
}
```

### Export Team Data
**GET** `/api/v1/teams/{teamId}/export`

Exports complete team data for backup or migration.

**Query Parameters:**
- `format` (json, csv)
- `includeHistory` (true, false)

**Response Headers:**
```
Content-Type: application/json
Content-Disposition: attachment; filename="team-a1b2c3d4-export.json"
```

## Sharing API

### Generate Share URLs
**POST** `/api/v1/teams/{teamId}/sharing/regenerate`

Regenerates sharing URLs for security (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "shareUrl": "https://app.example.com/team/x9y8z7w6",
    "shortCode": "WXYZ",
    "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?data=WXYZ"
  }
}
```

### Get Sharing Statistics
**GET** `/api/v1/teams/{teamId}/sharing/stats`

Access statistics for team sharing (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "totalViews": 245,
    "uniqueVisitors": 12,
    "lastAccessed": "2024-01-15T08:30:00.000Z",
    "accessMethods": {
      "directUrl": 180,
      "shortCode": 65
    },
    "peakUsageHours": [9, 14, 16]
  }
}
```

## Error Codes Reference

### Client Errors (4xx)

| Code | Description | Common Causes |
|------|-------------|---------------|
| `VALIDATION_ERROR` | Request data invalid | Missing required fields, invalid formats |
| `TEAM_NOT_FOUND` | Team ID/code not found | Incorrect ID, deleted team |
| `MEMBER_NOT_FOUND` | Member ID not found | Incorrect member ID |
| `ADMIN_REQUIRED` | Admin privileges needed | Invalid session, unauthorized action |
| `RATE_LIMITED` | Too many requests | Exceeded rate limit |
| `DUPLICATE_SELECTION` | Selection already exists | Multiple selections same day |

### Server Errors (5xx)

| Code | Description | Resolution |
|------|-------------|------------|
| `DATABASE_ERROR` | Database operation failed | Retry request, contact support |
| `CONTENT_UNAVAILABLE` | Daily content service down | Fallback content provided |
| `QUEUE_CORRUPTION` | Rotation queue invalid | Auto-regeneration triggered |

## Rate Limiting

### Limits by Endpoint Category

- **Team Operations**: 20 requests/minute
- **Member Management**: 30 requests/minute
- **Content Delivery**: 100 requests/minute
- **History/Analytics**: 50 requests/minute

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1642248600
```

## Security Considerations

### CORS Configuration
```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, X-Admin-Session
```

### Input Validation
- All string inputs sanitized for XSS prevention
- Unicode normalization for consistent data storage
- SQL injection prevention through parameterized queries
- File upload restrictions (if applicable)

### Session Management
- Admin sessions expire after 30 days inactivity
- Session tokens are cryptographically secure
- No persistent authentication tokens
- Session invalidation on security events

## API Versioning Strategy

### Version Lifecycle
- **v1**: Current stable version
- **v2**: Future enhancements (breaking changes)
- **Deprecation**: 6-month notice period
- **Support**: Minimum 12 months overlap

### Version Selection
```
# Header-based (preferred)
Accept: application/vnd.scrummaster.v1+json

# URL-based (fallback)
/api/v1/teams
```

### Backward Compatibility
- Additive changes only within major versions
- Optional parameters remain optional
- Response format consistency maintained
- Clear migration documentation provided