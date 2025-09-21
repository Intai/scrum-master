# Team Management Layout

Layout design for managing team members, their availability status, and team settings.

## Screen Purpose
- Mark team members as out of office
- Edit member names and remove members
- Manage team settings and preferences
- Access sharing options

## Layout Structure

### Desktop (1024px+)
```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                  Header                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  [← Back to Dashboard]    Team Management                [Save Changes]  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────┐ ┌─────────────────────────────────┐ │
│  │          Team Members               │ │         Team Settings           │ │
│  │                                     │ │                                 │ │
│  │  ┌─────────────────────────────────┐ │ │  Team Name                      │ │
│  │  │ Alice                      ✅   │ │ │  ┌─────────────────────────────┐ │ │
│  │  │ alice@company.com               │ │ │  │ [Awesome Dev Team]          │ │ │
│  │  │ [Edit] [Remove]  [📧 Notify]    │ │ │  └─────────────────────────────┘ │ │
│  │  └─────────────────────────────────┘ │ │                                 │ │
│  │                                     │ │  Rotation Settings              │ │
│  │  ┌─────────────────────────────────┐ │ │  ┌─────────────────────────────┐ │ │
│  │  │ Bob                        ✅   │ │ │  │ ☑ Fair rotation enabled     │ │ │
│  │  │ bob@company.com                 │ │ │  │ ☑ Skip weekends             │ │ │
│  │  │ [Edit] [Remove]  [📧 Notify]    │ │ │  │ ☐ Skip holidays             │ │ │
│  │  └─────────────────────────────────┘ │ │  └─────────────────────────────┘ │ │
│  │                                     │ │                                 │ │
│  │  ┌─────────────────────────────────┐ │ │  Notification Settings         │ │
│  │  │ Carol                      🏠   │ │ │  ┌─────────────────────────────┐ │ │
│  │  │ carol@company.com               │ │ │  │ ☑ Daily email reminders     │ │ │
│  │  │ [Edit] [Remove]  [📧 Notify]    │ │ │  │ ☑ Slack integration         │ │ │
│  │  │                                 │ │ │  │ ☐ SMS notifications         │ │ │
│  │  │ Out until: March 25, 2025       │ │ │  └─────────────────────────────┘ │ │
│  │  └─────────────────────────────────┘ │ │                                 │ │
│  │                                     │ │  Team Actions                   │ │
│  │  ┌─────────────────────────────────┐ │ │  ┌─────────────────────────────┐ │ │
│  │  │ David                      🏖️   │ │ │  │ [📤 Share Team]             │ │ │
│  │  │ david@company.com               │ │ │  │ [📊 View History]           │ │ │
│  │  │ [Edit] [Remove]  [📧 Notify]    │ │ │  │ [🗑️ Delete Team]            │ │ │
│  │  │                                 │ │ │  └─────────────────────────────┘ │ │
│  │  │ Out until: March 28, 2025       │ │ └─────────────────────────────────┘ │
│  │  └─────────────────────────────────┘ │                                     │
│  │                                     │                                     │
│  │  ┌─────────────────────────────────┐ │                                     │
│  │  │          Add Member             │ │                                     │
│  │  │                                 │ │                                     │
│  │  │  Name: [________________]        │ │                                     │
│  │  │  Email: [_______________]        │ │                                     │
│  │  │                    [Add Member] │ │                                     │
│  │  └─────────────────────────────────┘ │                                     │
│  └─────────────────────────────────────┘                                     │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Mobile (320-767px)
```
┌─────────────────────────────────┐
│            Header               │
│  ┌─────────────────────────────┐│
│  │[←] Team Management    [💾] ││
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │       Team Members          │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Alice               ✅  │ │ │
│ │ │ alice@company.com       │ │ │
│ │ │ [Edit] [❌] [📧]        │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Bob                 ✅  │ │ │
│ │ │ bob@company.com         │ │ │
│ │ │ [Edit] [❌] [📧]        │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Carol               🏠  │ │ │
│ │ │ carol@company.com       │ │ │
│ │ │ [Edit] [❌] [📧]        │ │ │
│ │ │ Out until: Mar 25       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │      Add Member         │ │ │
│ │ │ Name: [_____________]   │ │ │
│ │ │ Email: [____________]   │ │ │
│ │ │            [Add]        │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      Team Settings          │ │
│ │                             │ │
│ │ Team Name                   │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ [Awesome Dev Team]      │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ Rotation                    │ │
│ │ ☑ Fair rotation enabled     │ │
│ │ ☑ Skip weekends             │ │
│ │ ☐ Skip holidays             │ │
│ │                             │ │
│ │ Notifications               │ │
│ │ ☑ Daily email reminders     │ │
│ │ ☑ Slack integration         │ │
│ │ ☐ SMS notifications         │ │
│ │                             │ │
│ │ Actions                     │ │
│ │ [📤 Share] [📊 History]     │ │
│ │ [🗑️ Delete Team]            │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

## Component Hierarchy

```
TeamManagement
├── Header
│   ├── BackButton
│   ├── Title
│   └── SaveButton
├── TeamMembersList
│   ├── MemberCard[]
│   │   ├── MemberInfo
│   │   │   ├── Name
│   │   │   ├── Email
│   │   │   └── StatusIcon
│   │   ├── OutOfOfficeInfo (conditional)
│   │   │   └── ReturnDate
│   │   └── MemberActions
│   │       ├── EditButton
│   │       ├── RemoveButton
│   │       └── NotifyButton
│   └── AddMemberForm
│       ├── NameInput
│       ├── EmailInput
│       └── AddButton
├── TeamSettings
│   ├── TeamNameInput
│   ├── RotationSettings
│   │   ├── FairRotationToggle
│   │   ├── SkipWeekendsToggle
│   │   └── SkipHolidaysToggle
│   ├── NotificationSettings
│   │   ├── EmailToggle
│   │   ├── SlackToggle
│   │   └── SMSToggle
│   └── TeamActions
│       ├── ShareButton
│       ├── HistoryButton
│       └── DeleteButton
```

## States and Variations

### Edit Member Mode
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ Edit Member: Alice          │ │
│ │                             │ │
│ │ Name: [Alice Johnson_____]  │ │
│ │ Email: [alice@company.com]  │ │
│ │                             │ │
│ │ Status:                     │ │
│ │ ○ Available                 │ │
│ │ ● Working from home         │ │
│ │ ○ Out of office             │ │
│ │                             │ │
│ │ If out of office:           │ │
│ │ Return date: [2025-03-25]   │ │
│ │ Reason: [_______________]   │ │
│ │                             │ │
│ │ [Cancel] [Save Changes]     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Delete Confirmation
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │     Confirm Deletion        │ │
│ │                             │ │
│ │ Remove Alice from team?     │ │
│ │                             │ │
│ │ This action cannot be       │ │
│ │ undone.                     │ │
│ │                             │ │
│ │ [Cancel] [Remove Member]    │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Bulk Actions Mode
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ [✓] Select All              │ │
│ │                             │ │
│ │ ☑ Alice                     │ │
│ │ ☐ Bob                       │ │
│ │ ☑ Carol                     │ │
│ │ ☐ David                     │ │
│ │                             │ │
│ │ Selected: 2 members         │ │
│ │                             │ │
│ │ [Mark Available]            │ │
│ │ [Mark Out of Office]        │ │
│ │ [Send Notification]         │ │
│ │ [Remove Selected]           │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Member Status Options

- ✅ **Available** - Ready for scrum master selection
- 🏠 **Working from home** - Available but remote
- 🏖️ **Out of office** - Vacation, not available
- 🤒 **Sick leave** - Medical leave, not available
- 🎓 **Training** - In training, limited availability

## Quick Actions

### Status Toggle
- Single tap to cycle through common statuses
- Long press for full status menu
- Visual feedback for status changes

### Notification Options
- **Email**: Send status update to member
- **Slack**: Post in team channel
- **SMS**: Text message notification
- **Bulk notify**: Send to multiple members

## Responsive Behavior

- **Mobile**: Single column, simplified member cards, collapsible sections
- **Tablet**: Wider member cards, side-by-side add form
- **Desktop**: Two-column layout, expanded member details

## Accessibility

- Form labels and descriptions
- Status icons with text alternatives
- Keyboard navigation for all actions
- Screen reader support for dynamic changes
- High contrast mode support

## Validation Rules

- **Member names**: 2-50 characters, no duplicates
- **Email addresses**: Valid format, optional field
- **Return dates**: Future dates only for out of office
- **Team name**: 1-100 characters

## Auto-save Behavior

- Save changes automatically after 2 seconds
- Show save indicator during updates
- Offline support with sync when reconnected
- Conflict resolution for concurrent edits

## Integration Points

- **Slack**: Post status updates to team channel
- **Calendar**: Sync out of office dates
- **Email**: Send daily master notifications
- **Webhooks**: External system integrations