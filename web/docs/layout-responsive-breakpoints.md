# Responsive Breakpoints Guide

Comprehensive guide for responsive design across all screen sizes for the scrum master application.

## Breakpoint System

### Breakpoint Definitions
```css
/* Mobile First Approach */
$mobile:     320px - 767px   /* Smartphones */
$tablet:     768px - 1023px  /* Tablets, small laptops */
$desktop:    1024px - 1439px /* Desktop, laptops */
$large:      1440px+         /* Large screens, monitors */

/* Common Breakpoints */
$xs: 320px   /* Extra small mobile */
$sm: 576px   /* Small mobile */
$md: 768px   /* Medium tablets */
$lg: 1024px  /* Large desktop */
$xl: 1440px  /* Extra large screens */
```

## Mobile-First Strategy

### Design Principles
1. **Start with mobile layout** - Design for smallest screen first
2. **Progressive enhancement** - Add features as screen size increases
3. **Touch-first interactions** - Optimize for finger navigation
4. **Content prioritization** - Most important content visible first

## Screen Size Adaptations

### Extra Small Mobile (320px - 575px)
```
Layout Characteristics:
- Single column only
- Full-width components
- Minimal margins (8px-16px)
- Large touch targets (44px min)
- Collapsible sections
- Bottom navigation

Team Creation Screen:
┌─────────────────────────┐
│      [Header]           │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │   Team Setup        │ │
│ │                     │ │
│ │ [Team Name Input]   │ │
│ │ [Member Input]      │ │
│ │ [+ Add Button]      │ │
│ │                     │ │
│ │ [Member List]       │ │
│ │ • Alice        [×]  │ │
│ │ • Bob          [×]  │ │
│ │                     │ │
│ │ [Create Team]       │ │
│ └─────────────────────┘ │
└─────────────────────────┘

Dashboard Layout:
┌─────────────────────────┐
│ [Team Name]    [☰ Menu]│
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │   Today's Master    │ │
│ │      Alice 🎯       │ │
│ │  [Pick New Master]  │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │    Team Status      │ │
│ │ [Alice] [Bob]       │ │
│ │ [Carol] [David]     │ │
│ │ [Manage Team]       │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │    Daily Tip        │ │
│ │ [Tip content...]    │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │    Daily Quiz       │ │
│ │ [Quiz content...]   │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Small Mobile (576px - 767px)
```
Layout Characteristics:
- Single column with more breathing room
- Wider content area
- Medium margins (16px-24px)
- Larger typography
- More content visible at once

Changes from XS:
- Wider input fields
- 3-column member grid
- Expanded card content
- Larger touch targets
```

### Medium Tablet (768px - 1023px)
```
Layout Characteristics:
- Two-column layouts possible
- Sidebar navigation option
- Comfortable margins (24px-32px)
- Mixed touch/mouse interaction
- Modal dialogs instead of full-screen

Dashboard Layout:
┌─────────────────────────────────────────────────┐
│ [Team Name - Daily Scrum]     [Settings] [Menu] │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────┐ │
│ │     Today's Master      │ │   Team Status   │ │
│ │        Alice 🎯         │ │ [Alice] [Bob]   │ │
│ │    [Pick New Master]    │ │ [Carol] [David] │ │
│ └─────────────────────────┘ │ [Manage Team]   │ │
│                             └─────────────────┘ │
│ ┌─────────────────────────┐                     │
│ │      Daily Tip          │                     │
│ │ [Expanded tip content]  │                     │
│ └─────────────────────────┘                     │
│ ┌─────────────────────────┐                     │
│ │      Daily Quiz         │                     │
│ │ [Quiz with options]     │                     │
│ └─────────────────────────┘                     │
└─────────────────────────────────────────────────┘

Team Management:
┌─────────────────────────────────────────────────┐
│ [← Back] Team Management           [Save]       │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────┐ │
│ │     Team Members        │ │   Team Settings │ │
│ │                         │ │                 │ │
│ │ [Member list with       │ │ [Settings form] │ │
│ │  detailed cards]        │ │                 │ │
│ │                         │ │ [Action buttons]│ │
│ │ [Add member form]       │ │                 │ │
│ └─────────────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Large Desktop (1024px - 1439px)
```
Layout Characteristics:
- Full three-column layouts
- Sidebar + main content + details
- Generous margins (32px-48px)
- Mouse-optimized interactions
- Hover states and tooltips
- Multiple content areas visible

Dashboard Layout:
┌───────────────────────────────────────────────────────────┐
│ [Team Name - Daily Scrum Master] [Settings] [Share] [Menu]│
├───────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│ │  Today's Master │ │   Team Status   │ │  Quick Actions│ │
│ │                 │ │                 │ │               │ │
│ │     Alice 🎯    │ │ [Alice] [Bob]   │ │ [Share Team]  │ │
│ │  Mar 20, 2025   │ │ [Carol] [David] │ │ [View History]│ │
│ │                 │ │ [Eve]   [Frank] │ │ [Settings]    │ │
│ │ [Pick New]      │ │                 │ │               │ │
│ └─────────────────┘ │ [Manage Team]   │ └───────────────┘ │
│                     └─────────────────┘                   │
│ ┌─────────────────┐ ┌─────────────────┐                   │
│ │    Daily Tip    │ │   Daily Quiz    │                   │
│ │                 │ │                 │                   │
│ │ [Full tip with  │ │ [Quiz question  │                   │
│ │  detailed       │ │  with multiple  │                   │
│ │  content and    │ │  choice options │                   │
│ │  formatting]    │ │  and answer]    │                   │
│ │                 │ │                 │                   │
│ └─────────────────┘ └─────────────────┘                   │
└───────────────────────────────────────────────────────────┘
```

### Extra Large (1440px+)
```
Layout Characteristics:
- Centered max-width content (1200px-1400px)
- Wide margins for focus
- Multiple sidebars possible
- Rich interactions and animations
- Advanced features visible

Dashboard Layout:
┌─────────────────────────────────────────────────────────────────┐
│         [Team Name - Daily Scrum Master]    [Settings] [Share]  │
├─────────────────────────────────────────────────────────────────┤
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐  │
│    │ Today's     │ │ Team Status │ │ Daily Tip   │ │ Actions │  │
│    │ Master      │ │             │ │             │ │         │  │
│    │    Alice    │ │ [6 members  │ │ [Detailed   │ │ [Share] │  │
│    │     🎯      │ │  in 3x2     │ │  tip with   │ │ [Stats] │  │
│    │ Mar 20,2025 │ │  grid]      │ │  examples]  │ │ [Help]  │  │
│    │ [Pick New]  │ │ [Manage]    │ │             │ │         │  │
│    └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘  │
│                                                                 │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│    │ Daily Quiz  │ │ Recent      │ │ Upcoming    │             │
│    │             │ │ History     │ │ Schedule    │             │
│    │ [Question   │ │ [Last 5     │ │ [Next 3     │             │
│    │  with       │ │  selections │ │  scheduled  │             │
│    │  detailed   │ │  with dates │ │  masters]   │             │
│    │  options]   │ │  and notes] │ │             │             │
│    └─────────────┘ └─────────────┘ └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## Component Responsive Behavior

### Navigation
```css
/* Mobile: Hamburger menu */
@media (max-width: 767px) {
  .navigation {
    position: fixed;
    bottom: 0;
    transform: translateY(100%);
    transition: transform 0.3s;
  }
  .navigation.open {
    transform: translateY(0);
  }
}

/* Tablet+: Horizontal nav */
@media (min-width: 768px) {
  .navigation {
    position: static;
    display: flex;
    justify-content: space-between;
  }
}
```

### Cards and Content
```css
/* Mobile: Full width, minimal padding */
@media (max-width: 767px) {
  .card {
    margin: 8px;
    padding: 16px;
    border-radius: 8px;
  }
}

/* Tablet: Comfortable spacing */
@media (min-width: 768px) and (max-width: 1023px) {
  .card {
    margin: 16px;
    padding: 24px;
    border-radius: 12px;
  }
}

/* Desktop: Generous spacing */
@media (min-width: 1024px) {
  .card {
    margin: 24px;
    padding: 32px;
    border-radius: 16px;
  }
}
```

### Typography Scale
```css
/* Mobile typography */
@media (max-width: 767px) {
  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.25rem; }
  h3 { font-size: 1.125rem; }
  body { font-size: 0.875rem; }
}

/* Tablet typography */
@media (min-width: 768px) and (max-width: 1023px) {
  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  body { font-size: 1rem; }
}

/* Desktop typography */
@media (min-width: 1024px) {
  h1 { font-size: 2.5rem; }
  h2 { font-size: 2rem; }
  h3 { font-size: 1.5rem; }
  body { font-size: 1.125rem; }
}
```

## Touch vs Mouse Interactions

### Touch Targets (Mobile/Tablet)
```css
/* Minimum 44px touch targets */
.button, .link, .input {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* Increased spacing between interactive elements */
.button + .button {
  margin-left: 16px;
}

/* No hover states on touch devices */
@media (hover: none) {
  .button:hover {
    /* Remove hover effects */
  }
}
```

### Mouse Interactions (Desktop)
```css
/* Hover states for mouse users */
@media (hover: hover) {
  .button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
}

/* Smaller, precise controls */
.button {
  min-height: 36px;
  padding: 8px 16px;
}
```

## Grid Systems

### Mobile Grid (1-2 columns max)
```css
.team-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 576px) {
  .team-grid {
    grid-template-columns: 1fr 1fr;
  }
}
```

### Tablet Grid (2-4 columns)
```css
@media (min-width: 768px) {
  .team-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 2fr 1fr;
  }
}
```

### Desktop Grid (3-6 columns)
```css
@media (min-width: 1024px) {
  .team-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr 2fr 1fr;
  }
}
```

## Performance Considerations

### Image Optimization
```html
<!-- Responsive images -->
<img
  src="qr-code-small.png"
  srcset="qr-code-small.png 320w,
          qr-code-medium.png 768w,
          qr-code-large.png 1024w"
  sizes="(max-width: 767px) 280px,
         (max-width: 1023px) 400px,
         500px"
  alt="Team QR Code"
/>
```

### Conditional Loading
```css
/* Hide complex features on mobile */
@media (max-width: 767px) {
  .advanced-features {
    display: none;
  }
}

/* Progressive enhancement */
@media (min-width: 1024px) {
  .enhanced-animations {
    animation: slideIn 0.3s ease-out;
  }
}
```

## Testing Breakpoints

### Device Testing Matrix
```
iPhone SE (375px)     - Smallest modern mobile
iPhone 12 (390px)     - Common mobile size
iPad (768px)          - Standard tablet
iPad Pro (1024px)     - Large tablet
MacBook Air (1440px)  - Common laptop
Desktop (1920px)      - Standard monitor
```

### Browser Testing
- Safari Mobile (iOS)
- Chrome Mobile (Android)
- Safari Desktop
- Chrome Desktop
- Firefox Desktop
- Edge Desktop

### Responsive Testing Tools
- Browser DevTools device emulation
- Responsive design mode
- Physical device testing
- Browserstack for cross-device testing