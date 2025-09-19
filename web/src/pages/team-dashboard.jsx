import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTeam } from '../contexts/team-context'
import { teamService } from '../services/team-service'
import { contentService } from '../services/content-service'
import Button from '../components/ui/button'
import Card from '../components/ui/card'
import LoadingSpinner from '../components/ui/loading-spinner'
import TodaysMasterCard from '../components/dashboard/todays-master-card'
import TeamStatusCard from '../components/dashboard/team-status-card'
import DailyTipCard from '../components/dashboard/daily-tip-card'
import DailyQuizCard from '../components/dashboard/daily-quiz-card'

function TeamDashboard() {
  const { teamId, shortCode } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useTeam()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTeamData()
  }, [teamId, shortCode])

  const loadTeamData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load team data
      let teamResponse
      if (shortCode) {
        teamResponse = await teamService.getTeamByShortCode(shortCode)
      } else {
        teamResponse = await teamService.getTeam(teamId)
      }

      dispatch({ type: 'SET_TEAM', payload: teamResponse.data })

      // Load today's selection, daily content in parallel
      const [selectionResponse, tipResponse, quizResponse] = await Promise.allSettled([
        teamService.getTodaySelection(teamResponse.data.id),
        contentService.getDailyTip(teamResponse.data.id),
        contentService.getDailyQuiz(teamResponse.data.id)
      ])

      if (selectionResponse.status === 'fulfilled') {
        dispatch({ type: 'SET_TODAY_SELECTION', payload: selectionResponse.value.data })
      }

      if (tipResponse.status === 'fulfilled' && quizResponse.status === 'fulfilled') {
        dispatch({
          type: 'SET_DAILY_CONTENT',
          payload: {
            tip: tipResponse.value.data,
            quiz: quizResponse.value.data
          }
        })
      }

    } catch (err) {
      setError(err.message)
      if (err.message.includes('not found')) {
        setTimeout(() => navigate('/'), 3000)
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshSelection = async () => {
    try {
      const response = await teamService.getTodaySelection(state.currentTeam.id)
      dispatch({ type: 'SET_TODAY_SELECTION', payload: response.data })
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <p className="text-neutral-600">Loading team dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <Card className="text-center max-w-md w-full">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Team Not Found
          </h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Card>
      </div>
    )
  }

  const { currentTeam, todaySelection, dailyTip, dailyQuiz } = state
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: currentTeam?.timezone
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🎯</div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900" data-testid="team-name">
                  {currentTeam?.name || 'Scrum Team'}
                </h1>
                <p className="text-sm text-neutral-600">{today}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/team/${currentTeam.id}/share`)}
                data-testid="share-button"
              >
                Share
              </Button>

              {/* Show manage button if user has admin privileges */}
              {localStorage.getItem('adminSessionId') && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/team/${currentTeam.id}/manage`)}
                  data-testid="manage-button"
                >
                  Manage
                </Button>
              )}

              {/* Mobile menu button */}
              <div className="sm:hidden">
                <button className="p-2 text-neutral-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Today's Master */}
            <TodaysMasterCard
              selection={todaySelection}
              team={currentTeam}
              onRefresh={refreshSelection}
            />

            {/* Daily Tip */}
            {dailyTip && (
              <DailyTipCard tip={dailyTip} teamId={currentTeam.id} />
            )}

            {/* Daily Quiz */}
            {dailyQuiz && (
              <DailyQuizCard quiz={dailyQuiz} teamId={currentTeam.id} />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Team Status */}
            <TeamStatusCard team={currentTeam} onMemberUpdate={loadTeamData} />

            {/* Quick Actions */}
            <Card>
              <Card.Header>
                <Card.Title>Quick Actions</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/team/${currentTeam.id}/manage`)}
                    data-testid="manage-team-button"
                  >
                    ⚙️ Manage Team
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.location.reload()}
                    data-testid="refresh-button"
                  >
                    🔄 Refresh
                  </Button>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TeamDashboard