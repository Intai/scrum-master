import { useState } from 'react'
import Card from '../ui/card'
import Button from '../ui/button'
import Modal from '../ui/modal'
import { teamService } from '../../services/team-service'

function TodaysMasterCard({ selection, team, onRefresh }) {
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [overrideLoading, setOverrideLoading] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [overrideReason, setOverrideReason] = useState('')

  if (!selection) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>Today's Scrum Master</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🤔</div>
            <p className="text-neutral-600">No selection available today</p>
            <p className="text-sm text-neutral-500 mt-2">
              Check team member availability
            </p>
          </div>
        </Card.Content>
      </Card>
    )
  }

  const handleOverride = async () => {
    if (!selectedMemberId) return

    try {
      setOverrideLoading(true)
      await teamService.overrideSelection(team.id, selectedMemberId, overrideReason)
      setShowOverrideModal(false)
      setSelectedMemberId('')
      setOverrideReason('')
      onRefresh()
    } catch (err) {
      alert(err.message)
    } finally {
      setOverrideLoading(false)
    }
  }

  const availableMembers = team.members?.filter(member =>
    member.isActive && member.isAvailable
  ) || []

  return (
    <>
      <Card>
        <Card.Header>
          <Card.Title>Today's Scrum Master</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center">
            {/* Master Display */}
            <div className="bg-primary-50 rounded-2xl p-8 mb-6">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-primary-900 mb-2" data-testid="selected-master-name">
                {selection.selectedMember?.name || 'Unknown'}
              </h2>
              <p className="text-primary-700 font-medium">
                Scrum Master for {selection.selectedDate}
              </p>

              {selection.rotationMetrics && (
                <div className="mt-4 text-sm text-primary-600">
                  <p>Days since last turn: {selection.rotationMetrics.daysSinceLastSelection}</p>
                  <p>Total selections: {selection.rotationMetrics.totalSelectionsCount}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {localStorage.getItem('adminSessionId') && availableMembers.length > 1 && (
                <Button
                  variant="secondary"
                  onClick={() => setShowOverrideModal(true)}
                  data-testid="pick-new-master-button"
                >
                  🔄 Pick New Master
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                data-testid="refresh-selection-button"
              >
                🔄 Refresh
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Override Modal */}
      <Modal
        isOpen={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
        title="Manual Override Selection"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Select a different team member to be today's scrum master.
          </p>

          <div>
            <label className="label">Select Member</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="input"
              data-testid="override-member-select"
            >
              <option value="">Choose a member...</option>
              {availableMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Reason (optional)</label>
            <input
              type="text"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g., Emergency coverage needed"
              className="input"
              data-testid="override-reason-input"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowOverrideModal(false)}
              disabled={overrideLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleOverride}
              disabled={!selectedMemberId || overrideLoading}
              loading={overrideLoading}
              data-testid="confirm-override-button"
            >
              Update Selection
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default TodaysMasterCard