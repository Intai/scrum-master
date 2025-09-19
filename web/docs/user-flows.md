# User Flows: Daily Scrum Master Selector

## Primary User Journeys

### 1. Team Creation Flow (Team Lead)

**Entry Point:** Landing page visit
**Goal:** Create a new team and share access with members

#### Flow Steps:
1. **Landing Page**
   - User sees value proposition and "Create Team" CTA
   - Click "Create Team" button

2. **Team Setup**
   - Enter team name (optional, defaults to "Scrum Team")
   - Add team members by name (minimum 2, no maximum)
   - Input method: Simple text input with "Add Member" button
   - Visual feedback: Member list updates in real-time

3. **Initial Configuration**
   - Set team timezone (auto-detected, can override)
   - Choose starting member for first rotation
   - Preview rotation order

4. **Share Team**
   - Generate unique team URL and short code
   - Display sharing options: copy link, short code, QR code
   - Send invitation message template provided

5. **First Daily View**
   - See today's selected scrum master
   - View daily standup tip
   - Access daily quiz question
   - Bookmark/save team URL

**Success Metrics:** Team creation completion rate, time to first share

### 2. Daily Selection Flow (All Users)

**Entry Point:** Team URL visit or bookmark
**Goal:** Identify today's scrum master and access daily content

#### Flow Steps:
1. **Team Page Load**
   - Display team name and today's date
   - Show selected scrum master prominently
   - Display member availability status

2. **Content Consumption**
   - Read today's standup tip (expandable/collapsible)
   - View today's quiz question
   - Submit quiz answer (optional)
   - See previous answers/discussion

3. **Quick Actions**
   - Mark self as out of office (if applicable)
   - View rotation history
   - Access team settings (if creator)

**Success Metrics:** Daily active usage, content engagement rate

### 3. Availability Management Flow (Team Members)

**Entry Point:** Team page or direct link
**Goal:** Mark availability status for fair rotation

#### Primary Flow - Mark Out of Office:
1. **Status Change**
   - Click "Mark as Out of Office" button
   - Select duration: Today only, This week, Date range, Indefinite
   - Add optional reason/note

2. **Confirmation**
   - Show impact: "You'll be skipped until [date]"
   - Display next person in rotation
   - Confirm availability change

3. **Return Flow**
   - Automatic return on specified date
   - Manual "I'm back" button
   - Rejoin rotation queue fairly

#### Alternative Flow - Temporary Skip:
1. **Same-Day Skip**
   - "Can't facilitate today" emergency button
   - System automatically selects next available person
   - No impact on future rotation

**Success Metrics:** OOO usage rate, rotation fairness perception

### 4. Team Joining Flow (New Members)

**Entry Point:** Shared team URL or short code
**Goal:** Join existing team and understand rotation

#### Flow Steps:
1. **Team Discovery**
   - Enter short code OR visit shared URL
   - See team overview: name, member count, creation date

2. **Join Confirmation**
   - View current team members
   - See rotation schedule and position
   - Confirm joining team

3. **Onboarding**
   - Brief explanation of how rotation works
   - Overview of daily content features
   - First-time user tips for standup facilitation

4. **Integration**
   - Added to rotation queue fairly
   - Receive bookmark reminder
   - Optional: Enable browser notifications

**Success Metrics:** Join completion rate, first-week retention

### 5. Content Engagement Flow (All Users)

**Entry Point:** Daily team page visit
**Goal:** Consume educational content and build team connection

#### Standup Tips Flow:
1. **Tip Display**
   - Show relevant daily tip (non-repeating 14-day cycle)
   - Categorized: Time management, Engagement, Problem-solving
   - Expandable for detailed guidance

2. **Tip Interaction**
   - "Helpful" rating system
   - "Used this tip" check-in
   - Share feedback for future tips

#### Quiz Flow:
1. **Question Display**
   - Daily trivia question (30-day cycle)
   - Categories: Tech, General knowledge, Team building
   - Multiple choice or short answer

2. **Answer Submission**
   - Submit answer (anonymous or named)
   - See results after answering
   - View team leaderboard (optional)

3. **Discussion**
   - Comment on quiz questions
   - See team member responses
   - React to others' answers

**Success Metrics:** Content engagement rate, return visit frequency

### 6. Team Management Flow (Team Creator)

**Entry Point:** Team page with admin access
**Goal:** Modify team settings and manage members

#### Member Management:
1. **Add Members**
   - Same flow as initial team creation
   - New members added to rotation fairly

2. **Remove Members**
   - Select member to remove
   - Confirm action and impact on rotation
   - Adjust rotation order automatically

3. **Edit Member Details**
   - Update names/information
   - Modify availability preferences
   - Reset individual rotation position

#### Team Settings:
1. **Basic Settings**
   - Edit team name
   - Change timezone
   - Modify sharing permissions

2. **Rotation Settings**
   - Reset rotation order
   - Set rotation frequency (daily default)
   - Handle rotation conflicts

**Success Metrics:** Admin engagement, team longevity

## Error Flows and Edge Cases

### No Available Members
- **Scenario:** All team members marked as out of office
- **Flow:** Display "No one available today" message with suggestions to check availability or postpone standup

### Single Active Member
- **Scenario:** Only one team member available
- **Flow:** Auto-select available member with encouragement message

### Team Access Issues
- **Scenario:** Broken link or expired team
- **Flow:** Clear error message with options to create new team or contact support

### Browser/Network Issues
- **Scenario:** Offline usage or slow connection
- **Flow:** Cached last state with offline indicator and sync when reconnected

## Cross-Platform Considerations

### Mobile Experience
- Simplified single-column layout
- Touch-optimized buttons and inputs
- Reduced cognitive load for quick daily checks

### Desktop Experience
- Multi-column information display
- Keyboard shortcuts for power users
- Enhanced admin features for team management

### Tablet Experience
- Hybrid layout optimizing screen real estate
- Touch and mouse input support
- Team presentation mode for standups

## Analytics and Feedback Loops

### User Behavior Tracking
- Page visit patterns and timing
- Feature usage and engagement rates
- Drop-off points in flows

### Feedback Collection
- Periodic satisfaction surveys
- Feature request submission
- Bug reporting integration

### Iteration Opportunities
- A/B testing for flow optimization
- User interviews for deep insights
- Data-driven feature prioritization