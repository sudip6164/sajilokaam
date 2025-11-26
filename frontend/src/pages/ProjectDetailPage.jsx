import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProjectDetailPage() {
  const { profile } = useAuth()
  const { id } = useParams()

  if (!profile) {
    return <div className="page-shell bg-pattern"><div className="container-custom">Please log in.</div></div>
  }

  return (
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Project <span className="gradient-text">details</span>
          </h1>
          <p className="text-white/70 text-lg">
            The rich project detail workspace is temporarily disabled while we stabilize the frontend build.
          </p>
          <p className="text-white/60 text-sm">
            Project ID: <span className="font-mono">{id}</span>
          </p>
          <Link to="/projects" className="btn btn-secondary mt-4">
            Back to projects
          </Link>
        </div>
      </div>
    </div>
  )
}


