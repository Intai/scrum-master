import api from './api'

export const contentService = {
  // Get daily tip for team
  async getDailyTip(teamId) {
    return api.get(`/teams/${teamId}/content/tip`)
  },

  // Get daily quiz for team
  async getDailyQuiz(teamId) {
    return api.get(`/teams/${teamId}/content/quiz`)
  },

  // Submit quiz answer
  async submitQuizAnswer(teamId, quizId, answer, memberName = null) {
    return api.post(`/teams/${teamId}/content/quiz/${quizId}/answer`, {
      answer,
      memberName
    })
  },

  // Submit tip feedback
  async submitTipFeedback(teamId, tipId, rating, comment = null, memberName = null) {
    return api.post(`/teams/${teamId}/content/tip/${tipId}/feedback`, {
      rating,
      comment,
      memberName
    })
  }
}