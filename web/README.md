# Daily Scrum Master Selector - Frontend

React application for fair scrum master rotation and team management.

## Features

- **Team Creation**: Create teams without authentication
- **Fair Rotation**: Mathematical fairness in scrum master selection
- **Availability Management**: Mark members as out of office
- **Daily Content**: Tips and quiz questions for team engagement
- **Easy Sharing**: URL links, short codes, and QR codes
- **Mobile First**: Responsive design for all devices
- **Accessibility**: WCAG 2.1 AA compliant

## Tech Stack

- React 18 with hooks
- Vite for fast development and building
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- JavaScript (no TypeScript)

## Development

```bash
# Install dependencies
npm install

# Start development server (port 8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   └── dashboard/      # Dashboard-specific components
├── contexts/           # React context providers
├── pages/              # Page components
├── services/           # API service layer
├── utils/              # Utility functions
└── App.jsx            # Main app component
```

## Testing

Components include `data-testid` attributes for Playwright testing:

- `create-team-button`
- `team-name-input`
- `add-member-button`
- `selected-master-name`
- `member-status-{id}`
- And many more...

## API Integration

The frontend connects to the backend API at `http://localhost:3000/api/v1`.

Key API endpoints:
- `POST /teams` - Create team
- `GET /teams/{id}` - Get team data
- `GET /teams/{id}/rotation/today` - Today's selection
- `GET /teams/{id}/content/tip` - Daily tip
- `GET /teams/{id}/content/quiz` - Daily quiz

## Accessibility

- Keyboard navigation support
- Screen reader compatibility
- High contrast design
- Focus management
- ARIA labels and roles
- Auto-announcements for dynamic updates

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Mobile 90+