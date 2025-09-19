# Team Creation Layout

Layout design for the initial team setup screen where users create a new scrum team.

## Screen Purpose
- Allow users to input team member names
- Create a new team without authentication
- Guide users through the setup process

## Layout Structure

### Desktop/Tablet (768px+)
```
┌─────────────────────────────────────────────────────────────────┐
│                          Header                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Create Your Team                         │   │
│  │              Simple daily scrum master                 │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Team Setup                           │   │
│  │                                                         │   │
│  │  Team Name (Optional)                                   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ [Enter team name...]                            │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  Add Team Members                                       │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ [Enter member name...]                          │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                           [+ Add]      │   │
│  │                                                         │   │
│  │  Team Members (2 minimum required)                     │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │   │
│  │  │   Alice     │ │     Bob     │ │    Carol    │     │   │
│  │  │     [×]     │ │     [×]     │ │     [×]     │     │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘     │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │              Create Team                        │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile (320-767px)
```
┌─────────────────────────────────┐
│            Header               │
│  ┌─────────────────────────────┐│
│  │      Create Your Team       ││
│  │   Simple daily scrum master ││
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │        Team Setup           │ │
│ │                             │ │
│ │ Team Name (Optional)        │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ [Enter team name...]    │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ Add Members                 │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ [Enter member name...]  │ │ │
│ │ └─────────────────────────┘ │ │
│ │                    [+ Add]  │ │
│ │                             │ │
│ │ Team Members (2+ required)  │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │   Alice            [×]  │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │   Bob              [×]  │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │   Carol            [×]  │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │      Create Team        │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

## Component Hierarchy

```
TeamCreationScreen
├── Header
│   ├── Title: "Create Your Team"
│   └── Subtitle: "Simple daily scrum master"
├── TeamSetupCard
│   ├── TeamNameInput (optional)
│   ├── MemberInput
│   │   ├── TextInput
│   │   └── AddButton
│   ├── MembersList
│   │   └── MemberCard[]
│   │       ├── MemberName
│   │       └── RemoveButton
│   └── CreateTeamButton
└── Footer (if needed)
```

## States and Variations

### Empty State
- Show placeholder text in member input
- Disable create button until minimum 2 members
- Show helper text about minimum requirements

### Loading State
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ ┌─────────────────────────┐ │ │
│ │ │    Creating team...     │ │ │
│ │ │         [spinner]       │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Error State
- Show error message below relevant field
- Highlight invalid fields in red
- Keep user input to avoid re-entry

### Validation Rules
- Team name: Optional, max 50 characters
- Member names: Required, 2-20 characters, unique
- Minimum 2 members required
- Maximum 20 members allowed

## Interactions

1. **Add Member Flow**
   - User types in member input field
   - Press Enter or click Add button
   - Member appears in list below
   - Input field clears for next entry

2. **Remove Member**
   - Click × button on member card
   - Member removed from list
   - Update create button state if below minimum

3. **Create Team**
   - Validate all requirements met
   - Show loading state
   - Navigate to main dashboard on success
   - Generate team URL and short code

## Navigation

- **Entry Point**: Landing page or direct URL
- **Exit Point**: Main dashboard after successful creation
- **Back Action**: None (fresh start flow)

## Accessibility

- Form labels properly associated
- Keyboard navigation support
- Screen reader announcements for dynamic content
- Focus management during interactions
- Error messages clearly announced

## Responsive Behavior

- **Mobile**: Single column, full-width inputs, stacked member cards
- **Tablet**: Slightly wider layout, larger touch targets
- **Desktop**: Centered card layout, multi-column member display