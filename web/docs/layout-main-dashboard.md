# Main Dashboard Layout

Layout design for the primary daily view showing today's scrum master, team status, and daily content.

## Screen Purpose
- Display today's selected scrum master
- Show team member availability status
- Provide daily standup tip and pub quiz
- Quick access to team management actions

## Layout Structure

### Desktop (1024px+)
```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                  Header                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  [Team Name] - Daily Scrum Master          [Settings] [Share] [Menu]    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────┐ ┌─────────────────────────────────┐ │
│  │           Today's Master             │ │         Team Status             │ │
│  │                                     │ │                                 │ │
│  │  ┌─────────────────────────────────┐ │ │  ┌───────┐ ┌───────┐ ┌───────┐ │ │
│  │  │             Alice               │ │ │  │ Alice │ │  Bob  │ │ Carol │ │ │
│  │  │        🎯 Scrum Master          │ │ │  │  ✅   │ │  ✅   │ │  ✅   │ │ │
│  │  │        March 20, 2025           │ │ │  └───────┘ └───────┘ └───────┘ │ │
│  │  └─────────────────────────────────┘ │ │  ┌───────┐ ┌───────┐ ┌───────┐ │ │
│  │                                     │ │  │ David │ │  Eve  │ │ Frank │ │ │
│  │  [🔄 Pick New Master]               │ │  │  🏠   │ │  ✅   │ │  🏖️   │ │ │
│  └─────────────────────────────────────┘ │  └───────┘ └───────┘ └───────┘ │ │
│                                           │                                 │ │
│  ┌─────────────────────────────────────┐ │  [⚙️ Manage Team]               │ │
│  │           Daily Tip                 │ └─────────────────────────────────┘ │
│  │                                     │                                     │
│  │  💡 Keep standups focused           │                                     │
│  │                                     │                                     │
│  │  Ask each member:                   │                                     │
│  │  • What did you accomplish?         │                                     │
│  │  • What are you working on today?   │                                     │
│  │  • Any blockers or help needed?     │                                     │
│  │                                     │                                     │
│  │  Keep it under 15 minutes total.    │                                     │
│  └─────────────────────────────────────┘                                     │
│                                                                               │
│  ┌─────────────────────────────────────┐                                     │
│  │           Daily Quiz                │                                     │
│  │                                     │                                     │
│  │  🧠 What does "API" stand for?      │                                     │
│  │                                     │                                     │
│  │  ○ Application Programming Interface│                                     │
│  │  ○ Automated Program Integration    │                                     │
│  │  ○ Advanced Processing Interface    │                                     │
│  │  ○ Application Process Indicator    │                                     │
│  │                                     │                                     │
│  │  [Show Answer]                      │                                     │
│  └─────────────────────────────────────┘                                     │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Tablet (768-1023px)
```
┌─────────────────────────────────────────────────────────────┐
│                          Header                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [Team Name] - Daily Scrum   [Settings] [Share] [Menu]   ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Today's Master                         ││
│  │                                                         ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │                   Alice                             │││
│  │  │              🎯 Scrum Master                        │││
│  │  │              March 20, 2025                         │││
│  │  └─────────────────────────────────────────────────────┘││
│  │                                                         ││
│  │  [🔄 Pick New Master]                                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Team Status                           ││
│  │                                                         ││
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐     ││
│  │  │ Alice │ │  Bob  │ │ Carol │ │ David │ │  Eve  │     ││
│  │  │  ✅   │ │  ✅   │ │  ✅   │ │  🏠   │ │  ✅   │     ││
│  │  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘     ││
│  │  ┌───────┐                                              ││
│  │  │ Frank │                                              ││
│  │  │  🏖️   │                                              ││
│  │  └───────┘                                              ││
│  │                                                         ││
│  │  [⚙️ Manage Team]                                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Daily Tip                             ││
│  │                                                         ││
│  │  💡 Keep standups focused                               ││
│  │                                                         ││
│  │  Ask each member:                                       ││
│  │  • What did you accomplish?                             ││
│  │  • What are you working on today?                       ││
│  │  • Any blockers or help needed?                         ││
│  │                                                         ││
│  │  Keep it under 15 minutes total.                        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Daily Quiz                            ││
│  │                                                         ││
│  │  🧠 What does "API" stand for?                          ││
│  │                                                         ││
│  │  ○ Application Programming Interface                    ││
│  │  ○ Automated Program Integration                        ││
│  │  ○ Advanced Processing Interface                        ││
│  │  ○ Application Process Indicator                        ││
│  │                                                         ││
│  │  [Show Answer]                                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (320-767px)
```
┌─────────────────────────────────┐
│            Header               │
│  ┌─────────────────────────────┐│
│  │[Team Name]        [☰ Menu] ││
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │       Today's Master        │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │         Alice           │ │ │
│ │ │    🎯 Scrum Master      │ │ │
│ │ │    March 20, 2025       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ [🔄 Pick New Master]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │       Team Status           │ │
│ │                             │ │
│ │ ┌─────────┐ ┌─────────┐     │ │
│ │ │  Alice  │ │   Bob   │     │ │
│ │ │   ✅    │ │   ✅    │     │ │
│ │ └─────────┘ └─────────┘     │ │
│ │ ┌─────────┐ ┌─────────┐     │ │
│ │ │  Carol  │ │  David  │     │ │
│ │ │   ✅    │ │   🏠    │     │ │
│ │ └─────────┘ └─────────┘     │ │
│ │ ┌─────────┐ ┌─────────┐     │ │
│ │ │   Eve   │ │  Frank  │     │ │
│ │ │   ✅    │ │   🏖️    │     │ │
│ │ └─────────┘ └─────────┘     │ │
│ │                             │ │
│ │ [⚙️ Manage Team]            │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │        Daily Tip            │ │
│ │                             │ │
│ │ 💡 Keep standups focused    │ │
│ │                             │ │
│ │ Ask each member:            │ │
│ │ • What did you accomplish?  │ │
│ │ • What are you working on?  │ │
│ │ • Any blockers?             │ │
│ │                             │ │
│ │ Keep it under 15 minutes.   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │        Daily Quiz           │ │
│ │                             │ │
│ │ 🧠 What does "API" stand    │ │
│ │    for?                     │ │
│ │                             │ │
│ │ ○ Application Programming   │ │
│ │   Interface                 │ │
│ │ ○ Automated Program         │ │
│ │   Integration               │ │
│ │ ○ Advanced Processing       │ │
│ │   Interface                 │ │
│ │ ○ Application Process       │ │
│ │   Indicator                 │ │
│ │                             │ │
│ │ [Show Answer]               │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

## Component Hierarchy

```
MainDashboard
├── Header
│   ├── TeamName
│   ├── Navigation
│   │   ├── SettingsButton
│   │   ├── ShareButton
│   │   └── MenuButton (mobile)
├── TodaysMasterCard
│   ├── MasterName
│   ├── MasterIcon
│   ├── Date
│   └── PickNewButton
├── TeamStatusCard
│   ├── TeamMemberGrid
│   │   └── MemberStatusCard[]
│   │       ├── MemberName
│   │       └── StatusIcon
│   └── ManageTeamButton
├── DailyTipCard
│   ├── TipIcon
│   ├── TipTitle
│   └── TipContent
└── DailyQuizCard
    ├── QuizIcon
    ├── Question
    ├── AnswerOptions[]
    └── ShowAnswerButton
```

## States and Variations

### Loading State
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │    Loading today's master   │ │
│ │         [spinner]           │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │     Loading team status     │ │
│ │         [spinner]           │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Empty Team State
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │     No team members         │ │
│ │                             │ │
│ │  Add members to get started │ │
│ │                             │ │
│ │    [Add Team Members]       │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### All Members Out State
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │    No one available today   │ │
│ │                             │ │
│ │   All team members are      │ │
│ │   marked as out of office   │ │
│ │                             │ │
│ │    [Update Availability]    │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Status Icons

- ✅ Available (green)
- 🏠 Working from home (blue)
- 🏖️ Out of office (orange)
- 🤒 Sick leave (red)
- 🎯 Today's scrum master (special highlight)

## Interactions

1. **Pick New Master**
   - Click button to manually select new master
   - Shows fair rotation logic
   - Updates display immediately

2. **Team Member Status**
   - Click member card to change status
   - Quick toggle between available/unavailable
   - Visual feedback for changes

3. **Daily Quiz**
   - Select answer option
   - Click "Show Answer" to reveal correct answer
   - Track quiz completion for rotation

4. **Navigation**
   - Settings: Opens team management
   - Share: Opens sharing options
   - Menu (mobile): Collapsed navigation

## Responsive Behavior

- **Mobile**: Single column, stacked cards, 2-column member grid
- **Tablet**: Single column, wider cards, 3-5 column member grid
- **Desktop**: Two-column layout, side-by-side master/status cards

## Accessibility

- Clear heading hierarchy
- Status icons with text alternatives
- Keyboard navigation support
- Screen reader announcements for dynamic updates
- High contrast status indicators

## Auto-refresh Behavior

- Check for new day at midnight
- Rotate to next master automatically
- Refresh daily tip and quiz content
- Maintain team status between sessions