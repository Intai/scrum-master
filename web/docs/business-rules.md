# Business Rules: Daily Scrum Master Selector

## Core Rotation Algorithm

### Fair Cycling Specification

**Primary Rule:** Every team member must be selected exactly once before any member is selected twice.

#### Algorithm Logic:
1. **Initial Setup**
   - Create ordered queue of all team members
   - Randomize initial order to prevent bias
   - Store original randomization seed for reproducibility

2. **Daily Selection Process**
   - Select next available member from queue
   - Move selected member to end of queue
   - Mark selection date and member for history

3. **Queue Management**
   - When queue reaches end, restart from beginning
   - Maintain selection history for audit trail
   - Preserve queue order across sessions

#### Implementation Details:
```
Queue State: [Alice, Bob, Charlie, Diana]
Day 1: Select Alice → Queue: [Bob, Charlie, Diana, Alice]
Day 2: Select Bob → Queue: [Charlie, Diana, Alice, Bob]
Day 3: Charlie OOO → Select Diana → Queue: [Alice, Bob, Charlie, Diana]
Day 4: Select Alice → Queue: [Bob, Charlie, Diana, Alice]
```

### Out of Office Handling

**Skip Logic:** Members marked as out of office are temporarily removed from rotation but maintain their queue position.

#### OOO Business Rules:

1. **Temporary Skip**
   - Member remains in queue but is skipped during selection
   - Queue position preserved for return
   - No impact on other members' rotation order

2. **Queue Position Preservation**
   - OOO members don't lose their place in line
   - Return to exact same position when available
   - Fair catch-up mechanism for extended absences

3. **Extended Absence Handling**
   - If OOO for complete rotation cycle, rejoin at natural position
   - No penalty or acceleration for time away
   - Transparent position calculation for team visibility

#### Edge Cases:
- **All members OOO:** Display "No one available" with team notification
- **Single member available:** Auto-select with encouragement message
- **Return after partial cycle:** Insert at preserved position
- **New member during cycle:** Add to end of current rotation

### Content Rotation Rules

#### Standup Tips (14-Day Cycle)

**Non-Repetition Rule:** Tips must not repeat within 14 consecutive days (10 business days).

1. **Content Pool Management**
   - Maintain library of 50+ unique tips
   - Track last shown date for each tip
   - Calculate eligibility based on 14-day window

2. **Selection Algorithm**
   - Filter available tips (not shown in last 14 days)
   - Prioritize tips relevant to team size/experience
   - Randomize from eligible pool for variety

3. **Fallback Mechanism**
   - If all tips used in 14 days, reset cycle
   - Show "Bonus tip" indicator for early resets
   - Expand content pool through community contributions

#### Quiz Questions (30-Day Cycle)

**Non-Repetition Rule:** Quiz questions must not repeat within 30 consecutive days.

1. **Question Pool Management**
   - Maintain library of 100+ unique questions
   - Track last shown date and answer statistics
   - Categorize by difficulty and topic

2. **Selection Strategy**
   - Rotate through difficulty levels
   - Balance topic categories weekly
   - Avoid consecutive questions from same category

3. **Content Quality Rules**
   - Questions must be appropriate for all team members
   - Answers should be verifiable and educational
   - Difficulty should match team composition

### Team Creation and Sharing Rules

#### Team Access Control

**No Authentication Rule:** Teams are accessible via URL/code without user accounts.

1. **Team Ownership**
   - Creator has admin privileges by default
   - Admin status tied to browser session initially
   - Transfer ownership through sharing admin link

2. **Access Levels**
   - **Creator/Admin:** Full team management, member addition/removal, settings
   - **Member:** Availability management, content viewing, quiz participation
   - **Viewer:** Read-only access to current day information

3. **Privacy Rules**
   - Teams are private by default (not searchable)
   - Access only through direct link or code sharing
   - No personal information required or stored

#### Sharing Mechanism

**Link Generation Rules:** Each team gets unique URL and short code for sharing.

1. **URL Structure**
   - Format: `app-domain.com/team/[unique-hash]`
   - Hash: 8-character alphanumeric (case-insensitive)
   - Collision prevention: Check uniqueness before generation

2. **Short Code System**
   - Format: 4-character code (letters only, case-insensitive)
   - Excludes potentially confusing combinations (O/0, I/1)
   - 456,976 possible combinations (26^4)
   - Auto-regenerate if collision detected

3. **Link Persistence**
   - URLs never expire unless team explicitly deleted
   - Short codes remain active for team lifetime
   - Historical selections preserved indefinitely

### Data Retention and Privacy

#### Information Collection

**Minimal Data Rule:** Collect only essential information for functionality.

1. **Required Data**
   - Team name (optional, default: "Scrum Team")
   - Member names (display purposes only)
   - Selection history (for fair rotation)
   - Availability status and dates

2. **Prohibited Data**
   - Email addresses or contact information
   - Personal details beyond display names
   - IP addresses or tracking identifiers
   - Authentication credentials

3. **Data Lifecycle**
   - Teams auto-archived after 90 days of inactivity
   - Archived teams accessible for 1 year
   - Permanent deletion after inactivity period
   - Members can request immediate team deletion

#### Content Interaction

**Anonymous Participation Rule:** Quiz answers and tip feedback can be anonymous.

1. **Quiz Participation**
   - Option to answer anonymously or with name
   - Aggregate statistics shown to team
   - Individual performance tracking optional

2. **Feedback Collection**
   - Tip helpfulness ratings anonymous by default
   - Optional attribution for feature requests
   - No persistent user profiling

### Error Handling and Edge Cases

#### System Resilience Rules

1. **Graceful Degradation**
   - If rotation data corrupted, regenerate fair queue
   - If content unavailable, show cached/default content
   - If sharing broken, provide alternative access methods

2. **Conflict Resolution**
   - Multiple simultaneous OOO changes: Last timestamp wins
   - Team modifications during active use: Queue-based updates
   - Content delivery failures: Fallback to basic rotation

3. **Data Consistency**
   - All rotation changes logged with timestamps
   - Selection history immutable once recorded
   - Queue state synchronized across all team views

#### Business Continuity

1. **Service Availability**
   - Core rotation function works offline with cached data
   - Selection persists across browser sessions
   - Content delivery continues with cached libraries

2. **Migration and Backup**
   - Teams exportable as JSON for backup
   - Import functionality for team migration
   - History preservation across platform changes

### Algorithm Transparency

#### Fairness Verification

**Audit Trail Rule:** All rotation decisions must be verifiable and explainable.

1. **Selection Logging**
   - Every selection recorded with timestamp and reason
   - Queue state snapshots for historical verification
   - OOO periods and impacts documented

2. **Fairness Metrics**
   - Calculate and display rotation equity over time
   - Show days since last selection for each member
   - Highlight any algorithmic bias or imbalance

3. **Algorithm Disclosure**
   - Rotation logic explained in user-friendly terms
   - Mathematical fairness guarantees documented
   - Open source implementation for transparency