import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/button'
import Card from '../components/ui/card'
import Input from '../components/ui/input'

function LandingPage() {
  const navigate = useNavigate()
  const [shortCode, setShortCode] = useState('')
  const [error, setError] = useState('')

  const handleJoinTeam = (e) => {
    e.preventDefault()
    if (!shortCode.trim()) {
      setError('Please enter a team code')
      return
    }

    if (shortCode.length !== 4) {
      setError('Team codes are exactly 4 characters')
      return
    }

    setError('')
    navigate(`/code/${shortCode.toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-6 animate-bounce">🎯</div>
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
            Daily Scrum Master
            <br />
            <span className="text-primary-600">Selector</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Fairly rotate scrum master duties through your team.
            No accounts required. Just create, share, and go.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={() => navigate('/create')}
              data-testid="create-team-button"
            >
              Create New Team
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => document.getElementById('join-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join Existing Team
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Quick Setup</h3>
            <p className="text-neutral-600">
              Add team members and start rotating in under a minute. No complex configuration needed.
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold mb-2">Fair Rotation</h3>
            <p className="text-neutral-600">
              Mathematical fairness ensures everyone gets equal opportunities to lead standups.
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">Daily Learning</h3>
            <p className="text-neutral-600">
              Get daily standup tips and team quiz questions to improve meeting quality.
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-3xl mb-4">🏖️</div>
            <h3 className="text-lg font-semibold mb-2">Out of Office</h3>
            <p className="text-neutral-600">
              Mark yourself unavailable and the rotation automatically skips to the next person.
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-3xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold mb-2">Easy Sharing</h3>
            <p className="text-neutral-600">
              Share with team via URL, 4-character code, or QR code. No accounts or logins required.
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Mobile Ready</h3>
            <p className="text-neutral-600">
              Works perfectly on phones, tablets, and desktops. Check today's master on the go.
            </p>
          </Card>
        </div>

        {/* Join Team Section */}
        <div id="join-section" className="max-w-md mx-auto">
          <Card>
            <Card.Header>
              <Card.Title>Join Your Team</Card.Title>
            </Card.Header>
            <Card.Content>
              <form onSubmit={handleJoinTeam}>
                <Input
                  label="Team Code"
                  placeholder="Enter 4-character code"
                  value={shortCode}
                  onChange={(e) => {
                    setShortCode(e.target.value.toUpperCase())
                    setError('')
                  }}
                  error={error}
                  maxLength={4}
                  className="mb-4"
                  data-testid="team-code-input"
                />
                <Button type="submit" className="w-full" data-testid="join-team-button">
                  Join Team
                </Button>
              </form>
            </Card.Content>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-neutral-500">
          <p>Simple. Fair. Effective.</p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage