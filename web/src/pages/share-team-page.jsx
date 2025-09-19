import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTeam } from '../contexts/team-context'
import { teamService } from '../services/team-service'
import Button from '../components/ui/button'
import Card from '../components/ui/card'
import LoadingSpinner from '../components/ui/loading-spinner'

function ShareTeamPage() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useTeam()
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(null)
  const [shareStats, setShareStats] = useState(null)

  useEffect(() => {
    loadTeamData()
    loadShareStats()
  }, [teamId])

  const loadTeamData = async () => {
    try {
      setLoading(true)
      const response = await teamService.getTeam(teamId)
      dispatch({ type: 'SET_TEAM', payload: response.data })
    } catch (err) {
      console.error('Failed to load team:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadShareStats = async () => {
    try {
      if (localStorage.getItem('adminSessionId')) {
        const response = await teamService.getSharingStats(teamId)
        setShareStats(response.data)
      }
    } catch (err) {
      // Stats not available or no admin access
      console.error('Failed to load share stats:', err)
    }
  }

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const generateQRCodeUrl = (data) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  const { currentTeam } = state
  const baseUrl = window.location.origin
  const teamUrl = `${baseUrl}/team/${currentTeam?.id}`
  const shortCodeUrl = `${baseUrl}/code/${currentTeam?.shortCode}`

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/team/${teamId}`)}
                data-testid="back-to-dashboard"
              >
                ← Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900">
                  Share Your Team
                </h1>
                <p className="text-sm text-neutral-600">
                  {currentTeam?.name || 'Scrum Team'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Direct URL */}
          <Card>
            <Card.Header>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔗</span>
                <Card.Title>Direct Link</Card.Title>
              </div>
            </Card.Header>
            <Card.Content>
              <p className="text-neutral-600 mb-4">
                Share this link directly with your team members.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={teamUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-sm"
                  data-testid="direct-url"
                />
                <Button
                  onClick={() => copyToClipboard(teamUrl, 'url')}
                  variant={copied === 'url' ? 'success' : 'secondary'}
                  data-testid="copy-url-button"
                >
                  {copied === 'url' ? '✓ Copied' : 'Copy'}
                </Button>
              </div>
            </Card.Content>
          </Card>

          {/* Short Code */}
          <Card>
            <Card.Header>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔤</span>
                <Card.Title>Team Code</Card.Title>
              </div>
            </Card.Header>
            <Card.Content>
              <p className="text-neutral-600 mb-4">
                Use this 4-character code for easy verbal sharing.
              </p>
              <div className="text-center">
                <div className="text-6xl font-bold text-primary-600 mb-4 tracking-wider" data-testid="short-code">
                  {currentTeam?.shortCode}
                </div>
                <p className="text-sm text-neutral-600 mb-4">
                  Team members can enter this code at {baseUrl}
                </p>
                <Button
                  onClick={() => copyToClipboard(currentTeam?.shortCode, 'code')}
                  variant={copied === 'code' ? 'success' : 'secondary'}
                  data-testid="copy-code-button"
                >
                  {copied === 'code' ? '✓ Copied' : 'Copy Code'}
                </Button>
              </div>
            </Card.Content>
          </Card>

          {/* QR Code */}
          <Card>
            <Card.Header>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📱</span>
                <Card.Title>QR Code</Card.Title>
              </div>
            </Card.Header>
            <Card.Content>
              <p className="text-neutral-600 mb-4">
                Scan with a mobile device to quickly access the team.
              </p>
              <div className="text-center">
                <img
                  src={generateQRCodeUrl(teamUrl)}
                  alt="QR Code for team access"
                  className="mx-auto mb-4 border border-neutral-200 rounded-lg"
                  data-testid="qr-code"
                />
                <div className="space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = generateQRCodeUrl(teamUrl)
                      link.download = `team-${currentTeam?.shortCode}-qr.png`
                      link.click()
                    }}
                    data-testid="download-qr-button"
                  >
                    Download QR
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyToClipboard(generateQRCodeUrl(teamUrl), 'qr')}
                    data-testid="copy-qr-button"
                  >
                    {copied === 'qr' ? '✓ Copied' : 'Copy QR URL'}
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Share Template */}
          <Card>
            <Card.Header>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💬</span>
                <Card.Title>Message Template</Card.Title>
              </div>
            </Card.Header>
            <Card.Content>
              <p className="text-neutral-600 mb-4">
                Use this template to invite team members.
              </p>
              <textarea
                value={`Hi team! 👋

I've set up our daily scrum master rotation. Check today's scrum master and mark your availability:

🔗 Direct link: ${teamUrl}
🔤 Team code: ${currentTeam?.shortCode}

Just visit the link or enter the code at ${baseUrl} to get started.

Thanks!`}
                readOnly
                className="w-full h-40 px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-sm resize-none"
                data-testid="message-template"
              />
              <Button
                className="mt-3"
                onClick={() => copyToClipboard(`Hi team! 👋

I've set up our daily scrum master rotation. Check today's scrum master and mark your availability:

🔗 Direct link: ${teamUrl}
🔤 Team code: ${currentTeam?.shortCode}

Just visit the link or enter the code at ${baseUrl} to get started.

Thanks!`, 'template')}
                variant={copied === 'template' ? 'success' : 'secondary'}
                data-testid="copy-template-button"
              >
                {copied === 'template' ? '✓ Copied' : 'Copy Message'}
              </Button>
            </Card.Content>
          </Card>

          {/* Sharing Statistics (Admin only) */}
          {shareStats && (
            <Card>
              <Card.Header>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📊</span>
                  <Card.Title>Sharing Statistics</Card.Title>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      {shareStats.totalViews}
                    </div>
                    <div className="text-sm text-neutral-600">Total Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      {shareStats.uniqueVisitors}
                    </div>
                    <div className="text-sm text-neutral-600">Unique Visitors</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-neutral-500">
                  Last accessed: {shareStats.lastAccessed ? new Date(shareStats.lastAccessed).toLocaleDateString() : 'Never'}
                </div>
              </Card.Content>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default ShareTeamPage