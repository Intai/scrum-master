# Data Models: Daily Scrum Master Selector

## Entity Relationships Overview

The application uses a simple relational model focused on teams, members, and historical tracking with minimal data collection for privacy.

```
Team (1) → (N) Member
Team (1) → (N) Selection
Team (1) → (N) ContentView
Team (1) → (1) RotationQueue
Member (1) → (N) AvailabilityPeriod
Member (1) → (N) Selection
```

## Core Entities

### Team Entity

**Purpose:** Central entity representing a scrum team and its configuration.

```
Team {
  id: String (primary key, 8-char hash)
  shortCode: String (unique, 4-char code)
  name: String (default: "Scrum Team")
  timezone: String (IANA timezone, default: auto-detected)
  createdAt: DateTime
  lastActiveAt: DateTime
  isArchived: Boolean (default: false)
  adminSessionId: String (browser session for creator privileges)
}
```

**Indexes:**
- Primary: `id`
- Unique: `shortCode`
- Query: `lastActiveAt` (for archival cleanup)

**Business Rules:**
- ID generated as URL-safe 8-character hash
- Short code excludes confusing characters (0, O, 1, I)
- Auto-archive after 90 days of inactivity
- Name can be empty (uses default display)

### Member Entity

**Purpose:** Individual team member with minimal identifying information.

```
Member {
  id: String (UUID)
  teamId: String (foreign key → Team.id)
  name: String (display name only)
  position: Integer (current queue position, 0-indexed)
  joinedAt: DateTime
  isActive: Boolean (default: true)
  lastSelectedAt: DateTime (nullable)
}
```

**Indexes:**
- Primary: `id`
- Foreign: `teamId`
- Query: `(teamId, position)` for rotation order
- Query: `(teamId, isActive)` for availability

**Business Rules:**
- Position determines rotation order within team
- Name is display-only, no validation required
- isActive = false for removed members (soft delete)
- lastSelectedAt tracks individual selection history

### RotationQueue Entity

**Purpose:** Maintains current rotation state and algorithm configuration.

```
RotationQueue {
  id: String (UUID)
  teamId: String (foreign key → Team.id, unique)
  currentPosition: Integer (next member to select)
  queueOrder: JSON Array of member IDs
  lastShuffledAt: DateTime
  totalSelections: Integer (counter for cycle tracking)
  algorithm: String (default: "fair_cycle")
}
```

**Indexes:**
- Primary: `id`
- Unique: `teamId`

**Business Rules:**
- queueOrder maintains fair rotation sequence
- currentPosition wraps around at array length
- Algorithm field allows future rotation strategies
- Queue reshuffles when members added/removed

### Selection Entity

**Purpose:** Historical record of all scrum master selections for audit and fairness tracking.

```
Selection {
  id: String (UUID)
  teamId: String (foreign key → Team.id)
  memberId: String (foreign key → Member.id)
  selectedDate: Date (YYYY-MM-DD format)
  selectedAt: DateTime
  selectionMethod: String ("automatic", "manual_override")
  skipReason: String (nullable, for OOO scenarios)
}
```

**Indexes:**
- Primary: `id`
- Foreign: `teamId`, `memberId`
- Unique: `(teamId, selectedDate)` (one selection per day)
- Query: `selectedDate` for date-based lookups

**Business Rules:**
- One selection per team per day maximum
- selectedDate in team's timezone
- selectionMethod tracks override scenarios
- Immutable once created (no updates)

### AvailabilityPeriod Entity

**Purpose:** Tracks out-of-office periods for rotation skipping.

```
AvailabilityPeriod {
  id: String (UUID)
  memberId: String (foreign key → Member.id)
  startDate: Date
  endDate: Date (nullable for indefinite)
  reason: String (nullable, user-provided note)
  isActive: Boolean (default: true)
  createdAt: DateTime
}
```

**Indexes:**
- Primary: `id`
- Foreign: `memberId`
- Query: `(memberId, startDate, endDate)` for availability checks

**Business Rules:**
- startDate/endDate in member's team timezone
- Overlapping periods allowed (union logic)
- endDate = null for indefinite unavailability
- isActive = false for cancelled OOO periods

## Content Management Entities

### StandupTip Entity

**Purpose:** Educational content for daily standup improvement.

```
StandupTip {
  id: String (UUID)
  title: String
  content: Text
  category: String ("time_management", "engagement", "problem_solving")
  difficulty: String ("beginner", "intermediate", "advanced")
  targetTeamSize: String ("small", "medium", "large", "any")
  isActive: Boolean (default: true)
  createdAt: DateTime
}
```

**Indexes:**
- Primary: `id`
- Query: `(category, difficulty, isActive)` for content selection
- Query: `targetTeamSize` for team-specific tips

### QuizQuestion Entity

**Purpose:** Daily trivia questions for team engagement.

```
QuizQuestion {
  id: String (UUID)
  question: Text
  correctAnswer: String
  options: JSON Array (for multiple choice)
  category: String ("tech", "general", "team_building")
  difficulty: String ("easy", "medium", "hard")
  explanation: Text (nullable)
  isActive: Boolean (default: true)
  createdAt: DateTime
}
```

**Indexes:**
- Primary: `id`
- Query: `(category, difficulty, isActive)` for content selection

### ContentView Entity

**Purpose:** Tracks content delivery to prevent repetition within specified periods.

```
ContentView {
  id: String (UUID)
  teamId: String (foreign key → Team.id)
  contentType: String ("tip", "quiz")
  contentId: String (tip or quiz ID)
  viewedDate: Date
  viewedAt: DateTime
}
```

**Indexes:**
- Primary: `id`
- Foreign: `teamId`
- Unique: `(teamId, contentType, contentId, viewedDate)`
- Query: `(teamId, contentType, viewedDate)` for repetition checking

**Business Rules:**
- Prevents tip repetition within 14 days
- Prevents quiz repetition within 30 days
- One view per content item per team per day

## Analytics and Feedback Entities

### QuizResponse Entity

**Purpose:** Captures team member quiz participation for engagement tracking.

```
QuizResponse {
  id: String (UUID)
  teamId: String (foreign key → Team.id)
  questionId: String (foreign key → QuizQuestion.id)
  memberName: String (nullable for anonymous)
  answer: String
  isCorrect: Boolean
  respondedAt: DateTime
}
```

**Indexes:**
- Primary: `id`
- Foreign: `teamId`, `questionId`
- Query: `(teamId, questionId)` for team results

### TipFeedback Entity

**Purpose:** Collects tip helpfulness ratings for content improvement.

```
TipFeedback {
  id: String (UUID)
  teamId: String (foreign key → Team.id)
  tipId: String (foreign key → StandupTip.id)
  rating: Integer (1-5 scale)
  memberName: String (nullable for anonymous)
  comment: Text (nullable)
  submittedAt: DateTime
}
```

**Indexes:**
- Primary: `id`
- Foreign: `teamId`, `tipId`
- Query: `tipId` for content performance

## Data Relationships and Constraints

### Referential Integrity

1. **Cascade Deletions**
   - Team deletion → removes all members, selections, content views
   - Member deletion → removes availability periods, selections soft-deleted
   - Content deletion → content views remain for analytics

2. **Foreign Key Constraints**
   - All foreign keys enforced at database level
   - Orphaned records prevented through constraints
   - Soft deletes used where historical data required

### Data Validation Rules

1. **Team Level**
   - Team names: 1-50 characters, any Unicode
   - Short codes: 4 uppercase letters, no confusing chars
   - Timezone: Valid IANA timezone identifier

2. **Member Level**
   - Names: 1-30 characters, any Unicode except control chars
   - Position: Non-negative integer, unique within team
   - Email: Not collected or stored

3. **Date/Time Handling**
   - All dates stored in team timezone
   - UTC timestamps for system events
   - Date ranges validated (start ≤ end)

## Storage and Performance Considerations

### Database Schema Design

1. **PostgreSQL Optimization**
   - JSON columns for flexible arrays (queue order, quiz options)
   - Partial indexes for active records only
   - Composite indexes for common query patterns

2. **Query Performance**
   - Team-based partitioning for large datasets
   - Indexed foreign keys for join performance
   - Cached content selection for daily operations

### Data Lifecycle Management

1. **Archival Strategy**
   - Teams archived after 90 days inactivity
   - Archived data compressed and moved to cold storage
   - Purge archived teams after 1 year

2. **Backup and Recovery**
   - Daily incremental backups
   - Weekly full database snapshots
   - Point-in-time recovery capability

3. **Data Export**
   - Teams exportable as JSON for backup
   - Selection history preserved in exports
   - Import functionality for team migration

## Privacy and Security Considerations

### Data Minimization

1. **Personal Information**
   - No email addresses or contact details
   - Display names only for identification
   - No IP address logging or user tracking

2. **Session Management**
   - Admin privileges tied to browser session
   - No persistent authentication tokens
   - Session timeout after 30 days inactivity

### Data Protection

1. **Encryption**
   - Database encryption at rest
   - TLS encryption for data in transit
   - No client-side data storage except caching

2. **Access Control**
   - Team-level data isolation
   - URL-based access without authentication
   - Admin privileges for team creators only