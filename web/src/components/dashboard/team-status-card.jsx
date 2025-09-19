import { useState } from 'react'
import Card from '../ui/card'
import Button from '../ui/button'
import Modal from '../ui/modal'
import { teamService } from '../../services/team-service'

function TeamStatusCard({ team, onMemberUpdate }) {
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

  const getStatusIcon = (member) => {
    if (!member.isAvailable) {
      if (member.unavailableUntil) {
        const today = new Date()
        const until = new Date(member.unavailableUntil)
        if (until <= today) {
          return { icon: '🏖️', text: 'Out of office', color: 'status-out' }
        }
      }
      return { icon: '🏖️', text: 'Out of office', color: 'status-out' }
    }

    return { icon: '✅', text: 'Available', color: 'status-available' }
  }

  const handleMemberClick = (member) => {
    setSelectedMember(member)
    setShowAvailabilityModal(true)
  }

  const handleToggleAvailability = async (isAvailable, reason = '') => {
    if (!selectedMember) return

    try {
      setAvailabilityLoading(true)
      await teamService.toggleTodayAvailability(
        team.id,
        selectedMember.id,
        isAvailable,
        reason
      )
      setShowAvailabilityModal(false)
      onMemberUpdate()
    } catch (err) {
      alert(err.message)
    } finally {
      setAvailabilityLoading(false)
    }
  }

  if (!team.members || team.members.length === 0) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>Team Status</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-neutral-600">No team members</p>
            <Button size="sm" className="mt-4">
              Add Members
            </Button>
          </div>
        </Card.Content>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <Card.Header>
          <Card.Title>Team Status</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {team.members.filter(member => member.isActive).map(member => {
              const status = getStatusIcon(member)
              return (
                <button
                  key={member.id}
                  onClick={() => handleMemberClick(member)}
                  className="p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
                  data-testid={`member-status-${member.id}`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`${status.color} text-lg`} title={status.text}>
                      {status.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {status.text}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200">
            <div className="flex justify-between items-center text-sm text-neutral-600">
              <span>
                {team.members.filter(m => m.isActive && m.isAvailable).length} available
              </span>
              <span>
                {team.members.filter(m => m.isActive).length} total
              </span>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Availability Modal */}
      <Modal
        isOpen={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        title={`Update ${selectedMember?.name}'s Availability`}
        maxWidth="md"
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">👤</div>
              <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
              <p className="text-neutral-600">
                Current status: {getStatusIcon(selectedMember).text}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={selectedMember.isAvailable ? 'success' : 'secondary'}
                onClick={() => handleToggleAvailability(true)}
                disabled={availabilityLoading}
                loading={availabilityLoading && selectedMember.isAvailable}
                className="h-16 flex-col"
                data-testid="mark-available-button"
              >
                <span className="text-2xl mb-1">✅</span>
                <span className="text-sm">Available</span>
              </Button>

              <Button
                variant={!selectedMember.isAvailable ? 'warning' : 'secondary'}
                onClick={() => handleToggleAvailability(false, 'Marked as out of office')}
                disabled={availabilityLoading}
                loading={availabilityLoading && !selectedMember.isAvailable}
                className="h-16 flex-col"
                data-testid="mark-out-button"
              >
                <span className="text-2xl mb-1">🏖️</span>
                <span className="text-sm">Out Today</span>
              </Button>
            </div>

            <div className="text-center pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAvailabilityModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default TeamStatusCard