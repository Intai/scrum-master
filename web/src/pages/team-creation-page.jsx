import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/button'
import Card from '../components/ui/card'
import Input from '../components/ui/input'
import LoadingSpinner from '../components/ui/loading-spinner'
import { teamService } from '../services/team-service'

function TeamCreationPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [teamName, setTeamName] = useState('')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [members, setMembers] = useState([''])
  const [newMemberName, setNewMemberName] = useState('')

  const addMember = () => {
    if (newMemberName.trim()) {
      // Check for duplicates
      if (members.some(member => member.toLowerCase() === newMemberName.trim().toLowerCase())) {
        setError('This name is already in the team')
        return
      }

      setMembers([...members.filter(m => m.trim()), newMemberName.trim()])
      setNewMemberName('')
      setError('')
    }
  }

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const updateMember = (index, name) => {
    const newMembers = [...members]
    newMembers[index] = name
    setMembers(newMembers)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    const validMembers = members.filter(m => m.trim())
    if (validMembers.length < 2) {
      setError('Please add at least 2 team members')
      return
    }

    // Check for duplicate names
    const memberNames = validMembers.map(m => m.trim().toLowerCase())
    const hasDuplicates = memberNames.length !== new Set(memberNames).size
    if (hasDuplicates) {
      setError('All team member names must be unique')
      return
    }

    try {
      setLoading(true)

      const teamData = {
        name: teamName.trim() || 'Scrum Team',
        timezone,
        members: validMembers.map(name => ({ name: name.trim() }))
      }

      const response = await teamService.createTeam(teamData)

      // Redirect to the new team's dashboard
      navigate(`/team/${response.data.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addMember()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Create Your Team
          </h1>
          <p className="text-neutral-600">
            Set up your scrum team and start fair rotation
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <form onSubmit={handleSubmit}>
              {/* Team Name */}
              <div className="mb-6">
                <Input
                  label="Team Name"
                  placeholder="My Scrum Team (optional)"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  helperText="Leave blank to use 'Scrum Team'"
                  data-testid="team-name-input"
                />
              </div>

              {/* Timezone */}
              <div className="mb-6">
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
                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                    {Intl.DateTimeFormat().resolvedOptions().timeZone} (Detected)
                  </option>
                </select>
              </div>

              {/* Team Members */}
              <div className="mb-6">
                <label className="label">Team Members *</label>
                <p className="text-sm text-neutral-600 mb-3">
                  Add at least 2 team members to get started
                </p>

                {/* Add Member Input */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter member name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                    data-testid="add-member-input"
                  />
                  <Button
                    type="button"
                    onClick={addMember}
                    disabled={!newMemberName.trim()}
                    data-testid="add-member-button"
                  >
                    Add
                  </Button>
                </div>

                {/* Members List */}
                <div className="space-y-2">
                  {members.filter(m => m.trim()).map((member, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg">
                      <span className="text-2xl">👤</span>
                      <input
                        type="text"
                        value={member}
                        onChange={(e) => updateMember(index, e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-neutral-900"
                        data-testid={`member-input-${index}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="text-neutral-400 hover:text-red-600 transition-colors"
                        data-testid={`remove-member-${index}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {members.filter(m => m.trim()).length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    <p>No team members added yet</p>
                    <p className="text-sm">Add at least 2 members to continue</p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/')}
                  data-testid="back-button"
                >
                  Back to Home
                </Button>

                <Button
                  type="submit"
                  disabled={loading || members.filter(m => m.trim()).length < 2}
                  loading={loading}
                  data-testid="create-team-submit"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating Team...
                    </>
                  ) : (
                    'Create Team'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TeamCreationPage