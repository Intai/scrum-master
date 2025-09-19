import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTeam } from '../contexts/team-context'
import { teamService } from '../services/team-service'
import Button from '../components/ui/button'
import Card from '../components/ui/card'
import Input from '../components/ui/input'
import LoadingSpinner from '../components/ui/loading-spinner'

function TeamManagementPage() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useTeam()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Team settings
  const [teamName, setTeamName] = useState('')
  const [timezone, setTimezone] = useState('')

  // Member management
  const [newMemberName, setNewMemberName] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  useEffect(() => {
    loadTeamData()
  }, [teamId])

  useEffect(() => {
    if (state.currentTeam) {
      setTeamName(state.currentTeam.name || '')
      setTimezone(state.currentTeam.timezone || '')
    }
  }, [state.currentTeam])

  const loadTeamData = async () => {
    try {
      setLoading(true)
      const response = await teamService.getTeam(teamId)
      dispatch({ type: 'SET_TEAM', payload: response.data })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTeam = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const updates = {
        name: teamName.trim() || 'Scrum Team',
        timezone
      }
      await teamService.updateTeam(teamId, updates)

      // Update local state
      dispatch({
        type: 'SET_TEAM',
        payload: { ...state.currentTeam, ...updates }
      })

      alert('Team settings updated successfully!')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberName.trim()) return

    // Check for duplicates
    const existingNames = state.currentTeam.members
      .filter(m => m.isActive)
      .map(m => m.name.toLowerCase())

    if (existingNames.includes(newMemberName.trim().toLowerCase())) {
      setError('This name is already in the team')
      return
    }

    try {
      setAddingMember(true)
      const response = await teamService.addMember(teamId, {
        name: newMemberName.trim()
      })

      dispatch({ type: 'ADD_MEMBER', payload: response.data })
      setNewMemberName('')
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      await teamService.removeMember(teamId, memberId)
      dispatch({ type: 'REMOVE_MEMBER', payload: memberId })
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  if (!localStorage.getItem('adminSessionId')) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <Card className="text-center max-w-md w-full">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Access Denied
          </h2>
          <p className="text-neutral-600 mb-6">
            You need admin privileges to manage this team.
          </p>
          <Button onClick={() => navigate(`/team/${teamId}`)}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

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
                  Team Management
                </h1>
                <p className="text-sm text-neutral-600">
                  {state.currentTeam?.name || 'Scrum Team'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Team Settings */}
          <Card>
            <Card.Header>
              <Card.Title>Team Settings</Card.Title>
            </Card.Header>
            <Card.Content>
              <form onSubmit={handleUpdateTeam} className="space-y-4">
                <Input
                  label="Team Name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="My Scrum Team"
                  data-testid="team-name-input"
                />

                <div>
                  <label className="label">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="input"
                    data-testid="timezone-select"
                  >
                    <option value="America/New_York">Eastern Time (US & Canada)</option>
                    <option value="America/Chicago">Central Time (US & Canada)</option>
                    <option value="America/Denver">Mountain Time (US & Canada)</option>
                    <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Europe/Berlin">Berlin</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Shanghai">Shanghai</option>
                    <option value="Australia/Sydney">Sydney</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  loading={saving}
                  data-testid="save-settings-button"
                >
                  Save Changes
                </Button>
              </form>
            </Card.Content>
          </Card>

          {/* Member Management */}
          <Card>
            <Card.Header>
              <Card.Title>Team Members</Card.Title>
            </Card.Header>
            <Card.Content>
              {/* Add New Member */}
              <div className="mb-6">
                <label className="label">Add New Member</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter member name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                    className="flex-1"
                    data-testid="new-member-input"
                  />
                  <Button
                    onClick={handleAddMember}
                    disabled={!newMemberName.trim() || addingMember}
                    loading={addingMember}
                    data-testid="add-member-button"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {state.currentTeam?.members
                  ?.filter(member => member.isActive)
                  ?.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">👤</span>
                        <div>
                          <p className="font-medium text-neutral-900">{member.name}</p>
                          <p className="text-sm text-neutral-600">
                            Position {member.position + 1} in rotation
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        data-testid={`remove-member-${member.id}`}
                      >
                        Remove
                      </Button>
                    </div>
                  )) || []}

                {(!state.currentTeam?.members?.filter(m => m.isActive)?.length) && (
                  <div className="text-center py-8 text-neutral-500">
                    <p>No team members yet</p>
                    <p className="text-sm">Add members to get started</p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Danger Zone */}
          <Card>
            <Card.Header>
              <Card.Title className="text-red-600">Danger Zone</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Regenerate Sharing URLs</h4>
                  <p className="text-sm text-neutral-600 mb-3">
                    Generate new sharing URLs for security. Old links will stop working.
                  </p>
                  <Button variant="warning" size="sm">
                    Regenerate URLs
                  </Button>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <h4 className="font-medium text-red-600 mb-2">Reset Rotation Queue</h4>
                  <p className="text-sm text-neutral-600 mb-3">
                    Reset the rotation queue to ensure fairness. This cannot be undone.
                  </p>
                  <Button variant="danger" size="sm">
                    Reset Queue
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default TeamManagementPage