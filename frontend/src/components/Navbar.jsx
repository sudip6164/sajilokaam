import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Navbar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Sajilo Kaam
          </Link>
          <div className="flex gap-6 items-center">
            {profile ? (
              <>
                <Link to="/jobs" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Jobs
                </Link>
                <Link to="/projects" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Projects
                </Link>
                <Link to="/jobs/new" className="btn btn-primary text-sm">
                  Post Job
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 font-medium">{profile.fullName}</span>
                  <button 
                    onClick={handleLogout} 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary text-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
