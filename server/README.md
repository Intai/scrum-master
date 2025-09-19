# Scrum Master Selector - Backend API

A Node.js/Express.js backend API for the Daily Scrum Master Selector application with PostgreSQL database.

## Features

- **Team Management**: Create and manage scrum teams with members
- **Fair Rotation**: Automatic fair rotation algorithm for scrum master selection
- **Availability Management**: Track member out-of-office periods
- **Daily Content**: Standup tips and quiz questions with repetition prevention
- **Analytics**: Fairness metrics and team performance analytics
- **Admin Controls**: Session-based admin privileges for team management
- **Data Export**: Export team data in JSON or CSV formats

## API Endpoints

All endpoints are under `/api/v1` prefix. See [API Design](./docs/api-design.md) for complete specification.

### Teams
- `POST /teams` - Create new team
- `GET /teams/{teamId}` - Get team details
- `GET /teams/code/{shortCode}` - Get team by short code
- `PATCH /teams/{teamId}` - Update team settings (admin)

### Members
- `POST /teams/{teamId}/members` - Add member (admin)
- `PATCH /teams/{teamId}/members/{memberId}` - Update member (admin)
- `DELETE /teams/{teamId}/members/{memberId}` - Remove member (admin)
- `PUT /teams/{teamId}/members/order` - Reorder members (admin)

### Availability
- `POST /teams/{teamId}/members/{memberId}/availability` - Set availability (admin)
- `GET /teams/{teamId}/members/{memberId}/availability` - Get availability
- `POST /teams/{teamId}/members/{memberId}/availability/today` - Quick toggle (admin)
- `DELETE /teams/{teamId}/members/{memberId}/availability/{id}` - End early (admin)

### Rotation
- `GET /teams/{teamId}/rotation/today` - Get today's scrum master
- `GET /teams/{teamId}/rotation/queue` - Get rotation queue
- `POST /teams/{teamId}/rotation/override` - Manual override (admin)
- `POST /teams/{teamId}/rotation/regenerate` - Regenerate queue (admin)

### Content
- `GET /teams/{teamId}/content/tip` - Get daily tip
- `GET /teams/{teamId}/content/quiz` - Get daily quiz
- `POST /teams/{teamId}/content/quiz/{quizId}/answer` - Submit quiz answer
- `POST /teams/{teamId}/content/tip/{tipId}/feedback` - Submit tip feedback

### History & Analytics
- `GET /teams/{teamId}/history/selections` - Get selection history
- `GET /teams/{teamId}/analytics/fairness` - Get fairness metrics
- `GET /teams/{teamId}/export` - Export team data (admin)

### Sharing
- `POST /teams/{teamId}/sharing/regenerate` - Regenerate share URLs (admin)
- `GET /teams/{teamId}/sharing/stats` - Get sharing statistics (admin)

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Custom validation middleware

## Setup

### Prerequisites

1. Node.js 18 or higher
2. PostgreSQL 14 or higher
3. npm or yarn package manager

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Setup database**:
   ```bash
   # Run migrations and seed content
   npm run setup
   ```

4. **Start server**:
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## Environment Variables

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scrummaster_db
DB_USER=scrummaster_app
DB_PASSWORD=secure_password

# Server Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET=your-super-secret-session-key
```

## Database Schema

The database uses PostgreSQL with the following key tables:

- **teams**: Team information and settings
- **members**: Team members with rotation positions
- **rotation_queues**: Current rotation state per team
- **selections**: Historical record of all selections
- **availability_periods**: Member out-of-office tracking
- **standup_tips**: Educational content library
- **quiz_questions**: Daily quiz questions
- **content_views**: Content delivery tracking
- **quiz_responses**: Quiz participation data
- **tip_feedback**: Tip helpfulness ratings

See [Database Design](./docs/database-design.md) for complete schema.

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run migrate` - Run database migrations
- `npm run migrate:rollback` - Rollback last migration
- `npm run seed` - Seed database with sample content
- `npm run setup` - Run migrations and seeding

## API Response Format

### Success Response
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

### Error Response
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

## Rate Limiting

- **General API**: 100 requests/minute per IP
- **Team Operations**: 20 requests/minute
- **Member Management**: 30 requests/minute
- **Content Delivery**: 100 requests/minute
- **Analytics**: 50 requests/minute

## Authentication

The API uses session-based admin authentication:

- **Public Access**: Team viewing, content consumption
- **Admin Access**: Team creation returns admin session ID
- **Admin Operations**: Require `X-Admin-Session` header

## Business Logic

### Fair Rotation Algorithm

The system implements a fair rotation algorithm that:

1. Maintains queue order based on member positions
2. Skips unavailable members automatically
3. Calculates fairness coefficients
4. Tracks selection history for analytics

### Content Management

- **Tips**: 14-day repetition prevention per team
- **Quiz**: 30-day repetition prevention per team
- **Seeded Content**: 15+ tips and 12+ quiz questions

### Availability Handling

- **Date Ranges**: Support start/end date periods
- **Quick Toggles**: Today-only unavailability
- **Early Returns**: Cancel or modify existing periods

## Performance Targets

- **Team lookup**: < 5ms
- **Selection calculation**: < 100ms
- **Content delivery**: < 50ms
- **History queries**: < 200ms
- **Analytics aggregation**: < 500ms

## Security Features

- Input validation and sanitization
- SQL injection prevention
- Rate limiting by endpoint category
- CORS configuration
- Session-based admin authentication
- Error handling without information leakage

## Development

### Database Migrations

Create new migration files in `migrations/` directory:

```javascript
// migrations/009_new_feature.mjs
export const up = async (query) => {
  await query('CREATE TABLE ...');
};

export const down = async (query) => {
  await query('DROP TABLE ...');
};
```

### Adding New Endpoints

1. Add route handler in appropriate `routes/` file
2. Add database methods to `services/database.mjs`
3. Add validation functions to `utils/validators.mjs`
4. Update API documentation

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `TEAM_NOT_FOUND` | Team ID/code not found | 404 |
| `MEMBER_NOT_FOUND` | Member ID not found | 404 |
| `ADMIN_REQUIRED` | Admin privileges needed | 403 |
| `RATE_LIMITED` | Too many requests | 429 |
| `DUPLICATE_SELECTION` | Selection already exists | 409 |
| `CONTENT_UNAVAILABLE` | Daily content service down | 503 |
| `DATABASE_ERROR` | Database operation failed | 500 |

## Health Check

The API includes a health check endpoint:

```bash
GET /health
```

Returns server status and timestamp for monitoring.

## Contributing

1. Follow existing code patterns and conventions
2. Add appropriate validation for new inputs
3. Include error handling for all database operations
4. Update documentation for API changes
5. Test all endpoints thoroughly

## License

MIT License - see LICENSE file for details.