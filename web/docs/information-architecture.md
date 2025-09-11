# Scrum Master Picker - Information Architecture

## Site Structure Overview

The application follows a simple, flat structure optimized for quick daily access and minimal cognitive load.

```
Home/Landing
├── Create Team Flow
│   ├── Team Setup Form
│   ├── Add Members
│   └── Share Team Access
├── Team Dashboard (Main Interface)
│   ├── Current Scrum Master Display
│   ├── Daily Content Section
│   │   ├── Standup Hint
│   │   └── Pub Quiz Question
│   ├── Team Status Panel
│   │   ├── Member List
│   │   ├── Availability Status
│   │   └── Rotation Order
│   └── Quick Actions
│       ├── Toggle My Status
│       └── Share Team Link
└── Access Team (Short Code Entry)
    └── Redirect to Team Dashboard
```

## Navigation Structure

### Primary Navigation
**Single-Page Application Model**
- No traditional navigation menu required
- Context-sensitive actions based on current state
- Breadcrumb navigation for multi-step processes only

### Navigation Hierarchy

#### Level 1: Landing/Entry Points
- Homepage (marketing/introduction)
- Team Dashboard (main application interface)
- Team Access (short code entry)

#### Level 2: Functional Areas
- Team Creation Wizard
- Team Settings (future enhancement)
- Help/Support (minimal, contextual)

#### Level 3: Detail Views
- Team History (future enhancement)
- Content Archives (future enhancement)

## Content Organization Principles

### Information Priority (Top to Bottom)
1. **Critical Daily Info**: Current scrum master, today's date
2. **Value-Added Content**: Standup hint, pub quiz question
3. **Team Status**: Member availability, rotation preview
4. **Actions**: Status toggle, sharing options
5. **Secondary Info**: Team details, last updated

### Progressive Disclosure Strategy
- **First Visit**: Essential information only, guided setup
- **Daily Usage**: Streamlined interface, quick access
- **Deep Usage**: Additional features revealed through interaction

### Content Categorization

#### Functional Content
- **Team Data**: Member names, availability status, rotation order
- **Daily Content**: Standup hints, pub quiz questions
- **System Info**: Team ID, sharing links, last update timestamps

#### Educational Content
- **Standup Hints**: Categorized by focus area (facilitation, time management, engagement)
- **Quiz Questions**: Categorized by type (trivia, industry knowledge, team building)

#### Meta Content
- **Help Text**: Contextual assistance, feature explanations
- **Error Messages**: Clear guidance for resolution
- **Status Feedback**: Confirmation messages, loading states

## URL Structure

### Team Access URLs
```
Primary: https://scrummaster.app/t/{team-id}
Short:   https://scrummaster.app/{short-code}
```

### Functional URLs
```
Homepage:     https://scrummaster.app/
Create Team:  https://scrummaster.app/create
Access Team:  https://scrummaster.app/join
```

### URL Design Principles
- **Memorable**: Short codes are human-readable
- **Shareable**: Clean URLs for easy copy/paste
- **Persistent**: Team URLs never change
- **SEO-Friendly**: Semantic paths where applicable

## Data Architecture

### Core Data Entities

#### Team
- team_id (primary key)
- team_name (optional)
- short_code (unique)
- created_at
- last_accessed
- settings (JSON)

#### Team Member
- member_id (primary key)
- team_id (foreign key)
- name
- is_out_of_office (boolean)
- position_in_rotation (integer)
- last_scrum_master_date

#### Daily Content
- content_id (primary key)
- type (hint/quiz)
- content_text
- category
- rotation_day (1-14 for hints, 1-30 for quiz)

### Data Relationships
- One team has many team members
- Team members belong to one team
- Daily content is shared across all teams
- Rotation state is calculated, not stored

## Information Flow Patterns

### Data Input Patterns
1. **Bulk Entry**: Team member names during setup
2. **Toggle Actions**: Out-of-office status changes
3. **Minimal Forms**: Short code entry, optional team naming

### Data Display Patterns
1. **Dashboard Cards**: Grouped information in digestible chunks
2. **Status Indicators**: Visual cues for availability and rotation
3. **Contextual Updates**: Real-time feedback without page refresh

### State Management
1. **Team State**: Persisted in database, cached for performance
2. **Daily State**: Generated based on current date and team data
3. **Session State**: Minimal client-side state for UI interactions

## Search and Discovery

### Primary Discovery Method
- **Direct Access**: URL sharing is primary entry point
- **Short Codes**: Alternative for verbal/text sharing
- **Bookmarking**: Encourages repeat visits

### Content Discovery
- **Daily Rotation**: New content appears automatically
- **Progressive Learning**: Hints build on previous concepts
- **Surprise Factor**: Quiz questions maintain engagement

### No Search Required
- Simple structure eliminates need for search functionality
- All relevant information visible on single page
- Historical data access through simple chronological browsing (future)

## Content Strategy

### Daily Content Curation
- **Standup Hints**: 14-day cycle ensures variety without repetition
- **Quiz Questions**: 30-day cycle maintains freshness
- **Content Quality**: Professional, inclusive, actionable

### Content Categories

#### Standup Hints
1. **Facilitation Skills**: Leading discussions, managing time
2. **Engagement Techniques**: Keeping team involved, encouraging participation
3. **Problem Solving**: Identifying blockers, facilitating resolution
4. **Communication**: Clear updates, asking good questions

#### Pub Quiz Questions
1. **General Knowledge**: Accessible to all team members
2. **Tech Industry**: Light technical topics, industry trends
3. **Team Building**: Questions that encourage sharing
4. **Fun Facts**: Surprising, conversation-starting content

### Content Maintenance
- Regular review for relevance and inclusivity
- Team feedback integration (future enhancement)
- Seasonal and cultural considerations
- Continuous expansion of content library

## Accessibility Architecture

### Information Hierarchy
- Clear heading structure (H1-H6) for screen readers
- Logical tab order for keyboard navigation
- Semantic HTML for assistive technology

### Visual Information Design
- High contrast ratios for visibility
- Clear typography hierarchy
- Consistent iconography with text labels
- Responsive design for various screen sizes

### Interactive Element Design
- Focus indicators for all interactive elements
- Clear error messages and recovery paths
- Consistent interaction patterns throughout application

## Performance Architecture

### Loading Strategy
- **Critical Path**: Team data loads first
- **Progressive Enhancement**: Daily content loads asynchronously
- **Caching Strategy**: Team data cached client-side
- **Offline Considerations**: Essential functionality available offline

### Update Patterns
- **Real-time Updates**: Status changes via WebSocket or polling
- **Daily Refresh**: Content updates at midnight local time
- **Optimistic Updates**: UI updates before server confirmation

### Scalability Considerations
- **Database Indexing**: Optimized queries for team access
- **CDN Strategy**: Static assets served globally
- **API Rate Limiting**: Prevent abuse while maintaining usability
- **Monitoring**: Performance tracking for optimization opportunities