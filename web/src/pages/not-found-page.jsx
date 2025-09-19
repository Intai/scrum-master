import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/button'
import Card from '../components/ui/card'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <Card className="text-center max-w-md w-full">
        <div className="text-6xl mb-6">🤔</div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-neutral-600 mb-6">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default NotFoundPage