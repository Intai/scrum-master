import { Routes, Route } from 'react-router-dom'
import { TeamProvider } from './contexts/team-context'
import LandingPage from './pages/landing-page'
import TeamCreationPage from './pages/team-creation-page'
import TeamDashboard from './pages/team-dashboard'
import TeamManagementPage from './pages/team-management-page'
import ShareTeamPage from './pages/share-team-page'
import NotFoundPage from './pages/not-found-page'

function App() {
  return (
    <TeamProvider>
      <div className="min-h-screen bg-neutral-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<TeamCreationPage />} />
          <Route path="/team/:teamId" element={<TeamDashboard />} />
          <Route path="/team/:teamId/manage" element={<TeamManagementPage />} />
          <Route path="/team/:teamId/share" element={<ShareTeamPage />} />
          <Route path="/code/:shortCode" element={<TeamDashboard />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </TeamProvider>
  )
}

export default App