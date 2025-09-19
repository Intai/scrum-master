import { useState } from 'react'
import Card from '../ui/card'
import Button from '../ui/button'
import { contentService } from '../../services/content-service'

function DailyTipCard({ tip, teamId }) {
  const [expanded, setExpanded] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleSubmitFeedback = async () => {
    if (rating === 0) return

    try {
      await contentService.submitTipFeedback(teamId, tip.id, rating, feedback)
      setFeedbackSubmitted(true)
      setShowFeedback(false)
    } catch (err) {
      alert(err.message)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-success-600 bg-success-50'
      case 'intermediate': return 'text-warning-600 bg-warning-50'
      case 'advanced': return 'text-red-600 bg-red-50'
      default: return 'text-neutral-600 bg-neutral-50'
    }
  }

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">💡</span>
          <Card.Title>Daily Standup Tip</Card.Title>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tip.difficulty)}`}>
            {tip.difficulty}
          </span>
          <span className="text-xs text-neutral-500">
            {tip.category?.replace('_', ' ')}
          </span>
        </div>
      </Card.Header>

      <Card.Content>
        <h3 className="font-semibold text-neutral-900 mb-3" data-testid="tip-title">
          {tip.title}
        </h3>

        <div className={`text-neutral-700 ${!expanded ? 'line-clamp-3' : ''}`} data-testid="tip-content">
          {tip.content}
        </div>

        {tip.content && tip.content.length > 150 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 px-0"
            data-testid="expand-tip-button"
          >
            {expanded ? 'Show less' : 'Read more'}
          </Button>
        )}

        {/* Feedback Section */}
        {tip.canProvideFeedback && !feedbackSubmitted && (
          <div className="mt-6 pt-4 border-t border-neutral-200">
            {!showFeedback ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Was this helpful?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFeedback(true)}
                  data-testid="rate-tip-button"
                >
                  Rate this tip
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-neutral-700 block mb-2">Rating</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${
                          star <= rating ? 'text-yellow-400' : 'text-neutral-300'
                        } hover:text-yellow-400 transition-colors`}
                        data-testid={`rating-star-${star}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-neutral-700 block mb-1">
                    Comment (optional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="How did this tip help your team?"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm resize-none"
                    rows={2}
                    data-testid="feedback-comment"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFeedback(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitFeedback}
                    disabled={rating === 0}
                    data-testid="submit-feedback-button"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {feedbackSubmitted && (
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center space-x-2 text-success-600">
              <span>✅</span>
              <span className="text-sm">Thanks for your feedback!</span>
            </div>
          </div>
        )}

        {tip.helpfulnessRating && (
          <div className="mt-4 text-xs text-neutral-500">
            Community rating: {tip.helpfulnessRating.toFixed(1)}/5
          </div>
        )}
      </Card.Content>
    </Card>
  )
}

export default DailyTipCard