import { useState } from 'react'
import Card from '../ui/card'
import Button from '../ui/button'
import { contentService } from '../../services/content-service'

function DailyQuizCard({ quiz, teamId }) {
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(quiz.hasBeenAnswered || false)
  const [submitting, setSubmitting] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return

    try {
      setSubmitting(true)
      const response = await contentService.submitQuizAnswer(
        teamId,
        quiz.id,
        selectedAnswer,
        memberName || null
      )

      setSubmitted(true)
      setShowAnswer(true)

      // Update quiz with response data
      quiz.teamStats = response.data.teamStats
      quiz.correctAnswer = response.data.correctAnswer
      quiz.isCorrect = response.data.isCorrect
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-success-600 bg-success-50'
      case 'medium': return 'text-warning-600 bg-warning-50'
      case 'hard': return 'text-red-600 bg-red-50'
      default: return 'text-neutral-600 bg-neutral-50'
    }
  }

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🧠</span>
          <Card.Title>Daily Quiz</Card.Title>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
            {quiz.difficulty}
          </span>
          <span className="text-xs text-neutral-500">
            {quiz.category?.replace('_', ' ')}
          </span>
        </div>
      </Card.Header>

      <Card.Content>
        <h3 className="font-semibold text-neutral-900 mb-4" data-testid="quiz-question">
          {quiz.question}
        </h3>

        {/* Answer Options */}
        <div className="space-y-2 mb-6">
          {quiz.options?.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                selectedAnswer === option
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
              } ${showAnswer ? 'cursor-default' : ''}`}
              data-testid={`quiz-option-${index}`}
            >
              <input
                type="radio"
                name="quiz-answer"
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => !showAnswer && setSelectedAnswer(e.target.value)}
                disabled={showAnswer}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                selectedAnswer === option
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-neutral-300'
              }`}>
                {selectedAnswer === option && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <span className={`${showAnswer && option === quiz.correctAnswer ? 'font-semibold text-success-700' : ''}`}>
                {option}
                {showAnswer && option === quiz.correctAnswer && ' ✓'}
              </span>
            </label>
          )) || <p className="text-neutral-500">No options available</p>}
        </div>

        {/* Answer Area */}
        {!showAnswer && !submitted && (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-neutral-700 block mb-1">
                Your name (optional)
              </label>
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Anonymous"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                data-testid="member-name-input"
              />
            </div>

            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || submitting}
              loading={submitting}
              className="w-full"
              data-testid="submit-answer-button"
            >
              Submit Answer
            </Button>
          </div>
        )}

        {!showAnswer && !submitted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnswer(true)}
            className="w-full mt-2"
            data-testid="show-answer-button"
          >
            Show Answer
          </Button>
        )}

        {/* Results */}
        {showAnswer && (
          <div className="space-y-4">
            {submitted && (
              <div className={`p-3 rounded-lg ${
                quiz.isCorrect ? 'bg-success-50 text-success-800' : 'bg-red-50 text-red-800'
              }`}>
                <p className="font-medium">
                  {quiz.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                </p>
                {!quiz.isCorrect && (
                  <p className="text-sm mt-1">
                    The correct answer is: {quiz.correctAnswer}
                  </p>
                )}
              </div>
            )}

            {quiz.explanation && (
              <div className="p-3 bg-neutral-50 rounded-lg">
                <h4 className="font-medium text-neutral-900 mb-2">Explanation</h4>
                <p className="text-sm text-neutral-700">{quiz.explanation}</p>
              </div>
            )}

            {quiz.teamStats && (
              <div className="text-sm text-neutral-600">
                <p>Team responses: {quiz.teamStats.totalResponses}</p>
                <p>Correct rate: {quiz.teamStats.correctPercentage}%</p>
                {quiz.teamStats.yourRank && (
                  <p>Your rank: #{quiz.teamStats.yourRank}</p>
                )}
              </div>
            )}
          </div>
        )}
      </Card.Content>
    </Card>
  )
}

export default DailyQuizCard