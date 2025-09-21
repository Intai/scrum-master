# Share Team Layout

Layout design for sharing team access through URL links, short codes, and QR codes.

## Screen Purpose
- Display team sharing URL and short code
- Generate QR code for easy mobile access
- Provide copy-to-clipboard functionality
- Show team invitation options

## Layout Structure

### Desktop (1024px+)
```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                  Header                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  [← Back to Dashboard]      Share Team Access                           │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           Team: Awesome Dev Team                        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────┐ ┌─────────────────────────────────┐ │
│  │            Share Link               │ │          QR Code                │ │
│  │                                     │ │                                 │ │
│  │  Full URL                           │ │  ┌─────────────────────────────┐ │ │
│  │  ┌─────────────────────────────────┐ │ │  │                             │ │ │
│  │  │ https://scrummaster.app/t/abc123│ │ │  │    ████  ██    ██  ████    │ │ │
│  │  │                          [📋]  │ │ │  │    █  █  ████  █  █ █  █    │ │ │
│  │  └─────────────────────────────────┘ │ │  │    ████  █  █  ████ ████    │ │ │
│  │                                     │ │  │    █  █  █  █  █  █ █  █    │ │ │
│  │  Short Code                         │ │  │    ████  ████  ████ ████    │ │ │
│  │  ┌─────────────────────────────────┐ │ │  │                             │ │ │
│  │  │         ABC123           [📋]  │ │ │  └─────────────────────────────┘ │ │
│  │  └─────────────────────────────────┘ │ │                                 │ │
│  │                                     │ │  [📱 Save QR Code]              │ │
│  │  [🔄 Generate New Code]             │ │                                 │ │
│  └─────────────────────────────────────┘ └─────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           Team Invitation                               │ │
│  │                                                                         │ │
│  │  Invite team members via email                                          │ │
│  │                                                                         │ │
│  │  Email addresses (one per line)                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ alice@company.com                                                   │ │ │
│  │  │ bob@company.com                                                     │ │ │
│  │  │ carol@company.com                                                   │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  Custom message (optional)                                              │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ Join our daily scrum master rotation! We use this simple tool      │ │ │
│  │  │ to fairly select who runs our standup each day.                    │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  [📧 Send Invitations]                                                  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                          Access Statistics                              │ │
│  │                                                                         │ │
│  │  Team created: March 15, 2025                                           │ │
│  │  Total team members: 6                                                  │ │
│  │  Active members: 4                                                      │ │
│  │  Times shared: 12                                                       │ │
│  │  Last accessed: 2 hours ago                                             │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Mobile (320-767px)
```
┌─────────────────────────────────┐
│            Header               │
│  ┌─────────────────────────────┐│
│  │ [←] Share Team Access       ││
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │    Awesome Dev Team         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │        Share Link           │ │
│ │                             │ │
│ │ Full URL                    │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ scrummaster.app/t/abc123│ │ │
│ │ │                  [📋]  │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ Short Code                  │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │   ABC123         [📋]  │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ [🔄 Generate New Code]      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │         QR Code             │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │                         │ │ │
│ │ │   ████  ██    ██  ████  │ │ │
│ │ │   █  █  ████  █  █ █  █  │ │ │
│ │ │   ████  █  █  ████ ████  │ │ │
│ │ │   █  █  █  █  █  █ █  █  │ │ │
│ │ │   ████  ████  ████ ████  │ │ │
│ │ │                         │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ [📱 Save to Photos]         │ │
│ │ [📤 Share QR Code]          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      Email Invitations      │ │
│ │                             │ │
│ │ Email addresses             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ alice@company.com       │ │ │
│ │ │ bob@company.com         │ │ │
│ │ │ carol@company.com       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ Message (optional)          │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Join our scrum rotation │ │ │
│ │ │ tool...                 │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ [📧 Send Invitations]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │       Statistics            │ │
│ │                             │ │
│ │ Created: Mar 15, 2025       │ │
│ │ Team members: 6             │ │
│ │ Active: 4                   │ │
│ │ Times shared: 12            │ │
│ │ Last access: 2h ago         │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

## Component Hierarchy

```
ShareTeam
├── Header
│   ├── BackButton
│   └── Title
├── TeamInfo
│   └── TeamName
├── ShareOptions
│   ├── ShareLinkCard
│   │   ├── FullURLField
│   │   │   ├── URLDisplay
│   │   │   └── CopyButton
│   │   ├── ShortCodeField
│   │   │   ├── CodeDisplay
│   │   │   └── CopyButton
│   │   └── GenerateNewButton
│   └── QRCodeCard
│       ├── QRCodeDisplay
│       ├── SaveQRButton
│       └── ShareQRButton (mobile)
├── EmailInvitation
│   ├── EmailListInput
│   ├── CustomMessageInput
│   └── SendInvitationsButton
└── AccessStatistics
    ├── CreationDate
    ├── MemberCounts
    ├── ShareCount
    └── LastAccess
```

## States and Variations

### Copy Success State
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ scrummaster.app/t/abc123    │ │
│ │                      [✓]   │ │
│ └─────────────────────────────┘ │
│         Copied to clipboard!   │
└─────────────────────────────────┘
```

### Generating New Code State
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │    Generating new code...   │ │
│ │         [spinner]           │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Email Sending State
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │   Sending invitations...    │ │
│ │         [progress bar]      │ │
│ │      2 of 3 sent            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Empty Statistics State
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │     Access Statistics       │ │
│ │                             │ │
│ │   No access data yet        │ │
│ │                             │ │
│ │ Share your team to start    │ │
│ │ tracking usage statistics   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Sharing Methods

### URL Formats
- **Full URL**: `https://scrummaster.app/t/abc123`
- **Short URL**: `scrummaster.app/abc123`
- **QR Code**: Contains full URL for mobile scanning

### Short Code Generation
- 6-character alphanumeric codes
- Case-insensitive for user entry
- Avoid confusing characters (0, O, 1, I)
- Regenerate option for security

### Email Templates
```
Subject: Join our Scrum Master Rotation - [Team Name]

Hi there!

You've been invited to join our scrum master rotation team: [Team Name]

[Custom Message]

To join, simply visit:
https://scrummaster.app/t/abc123

Or enter this short code: ABC123

This tool helps us fairly rotate who runs our daily standup, track availability,
and get daily tips for better standups.

Thanks!
[Inviter Name]
```

## Interactions

1. **Copy to Clipboard**
   - Click copy button next to URL/code
   - Show success feedback
   - Fallback for unsupported browsers

2. **QR Code Actions**
   - Generate on demand to reduce load time
   - Save to device photos (mobile)
   - Share via native sharing API (mobile)

3. **Email Validation**
   - Real-time validation of email format
   - Duplicate detection and removal
   - Bulk paste support (comma/line separated)

4. **Code Regeneration**
   - Confirm action (invalidates old links)
   - Update all displays immediately
   - Log security event

## Responsive Behavior

- **Mobile**: Single column, larger touch targets, native sharing
- **Tablet**: Compact layout, side-by-side cards
- **Desktop**: Full feature set, multi-column layout

## Security Considerations

- Rate limiting on code generation
- Access logging for audit trail
- Option to expire/revoke access codes
- No sensitive data in QR codes

## Analytics Tracking

- Track sharing method usage
- Monitor invitation success rates
- Measure team onboarding completion
- QR code scan statistics

## Accessibility

- QR code alternative text description
- High contrast mode for codes
- Screen reader support for copy actions
- Keyboard navigation for all functions