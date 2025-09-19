import api from './api'

export const teamService = {
  // Create a new team
  async createTeam(teamData) {
    const response = await api.post('/teams', teamData)

    // Store admin session ID for team management privileges
    if (response.data.adminSessionId) {
      localStorage.setItem('adminSessionId', response.data.adminSessionId)
    }

    return response
  },

  // Get team by ID
  async getTeam(teamId) {
    return api.get(`/teams/${teamId}`)
  },

  // Get team by short code
  async getTeamByShortCode(shortCode) {
    return api.get(`/teams/code/${shortCode}`)
  },

  // Update team settings (admin only)
  async updateTeam(teamId, updates) {
    return api.patch(`/teams/${teamId}`, updates)
  },

  // Add member to team
  async addMember(teamId, memberData) {
    return api.post(`/teams/${teamId}/members`, memberData)
  },

  // Update member information
  async updateMember(teamId, memberId, updates) {
    return api.patch(`/teams/${teamId}/members/${memberId}`, updates)
  },

  // Remove member from team (soft delete)
  async removeMember(teamId, memberId) {
    return api.delete(`/teams/${teamId}/members/${memberId}`)
  },

  // Reorder team members in rotation queue
  async reorderMembers(teamId, memberOrder) {
    return api.put(`/teams/${teamId}/members/order`, { memberOrder })
  },

  // Get today's scrum master selection
  async getTodaySelection(teamId) {
    return api.get(`/teams/${teamId}/rotation/today`)
  },

  // Get rotation queue information
  async getRotationQueue(teamId) {
    return api.get(`/teams/${teamId}/rotation/queue`)
  },

  // Manual override selection (admin only)
  async overrideSelection(teamId, memberId, reason) {
    return api.post(`/teams/${teamId}/rotation/override`, {
      memberId,
      reason
    })
  },

  // Regenerate rotation queue (admin only)
  async regenerateQueue(teamId) {
    return api.post(`/teams/${teamId}/rotation/regenerate`)
  },

  // Set member availability
  async setMemberAvailability(teamId, memberId, availabilityData) {
    return api.post(`/teams/${teamId}/members/${memberId}/availability`, availabilityData)
  },

  // Get member availability periods
  async getMemberAvailability(teamId, memberId) {
    return api.get(`/teams/${teamId}/members/${memberId}/availability`)
  },

  // Quick toggle availability for today
  async toggleTodayAvailability(teamId, memberId, isAvailable, reason) {
    return api.post(`/teams/${teamId}/members/${memberId}/availability/today`, {
      isAvailable,
      reason
    })
  },

  // Cancel availability period early
  async returnEarly(teamId, memberId, availabilityId) {
    return api.delete(`/teams/${teamId}/members/${memberId}/availability/${availabilityId}`)
  },

  // Get selection history
  async getSelectionHistory(teamId, params = {}) {
    const searchParams = new URLSearchParams()
    if (params.limit) searchParams.append('limit', params.limit)
    if (params.offset) searchParams.append('offset', params.offset)
    if (params.startDate) searchParams.append('startDate', params.startDate)
    if (params.endDate) searchParams.append('endDate', params.endDate)
    if (params.memberId) searchParams.append('memberId', params.memberId)

    const queryString = searchParams.toString()
    const url = `/teams/${teamId}/history/selections${queryString ? `?${queryString}` : ''}`

    return api.get(url)
  },

  // Get fairness analytics
  async getFairnessAnalytics(teamId) {
    return api.get(`/teams/${teamId}/analytics/fairness`)
  },

  // Export team data
  async exportTeamData(teamId, format = 'json', includeHistory = true) {
    const params = new URLSearchParams({ format, includeHistory })
    return api.get(`/teams/${teamId}/export?${params}`)
  },

  // Regenerate sharing URLs (admin only)
  async regenerateShareUrls(teamId) {
    return api.post(`/teams/${teamId}/sharing/regenerate`)
  },

  // Get sharing statistics (admin only)
  async getSharingStats(teamId) {
    return api.get(`/teams/${teamId}/sharing/stats`)
  }
}