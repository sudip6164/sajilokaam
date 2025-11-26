import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ClientOnboardingPage() {
  const { profile } = useAuth()

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  const isClient = profile.roles?.some(role => role.name === 'CLIENT')
  if (!isClient) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Client <span className="gradient-text">onboarding</span>
          </h1>
          <p className="text-white/70 text-lg">
            This client onboarding screen is temporarily simplified while we stabilize the build.
          </p>
        </div>
      </div>
    </div>
  )
}


