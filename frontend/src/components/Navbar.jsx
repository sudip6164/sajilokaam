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
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">SK</span>
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sajilo Kaam
            </span>
          </Link>
          <div className="flex gap-2 items-center">
            {profile ? (
              <>
                <Link 
                  to="/jobs" 
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors rounded-lg hover:bg-blue-50"
                >
                  Jobs
                </Link>
                <Link 
                  to="/projects" 
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors rounded-lg hover:bg-blue-50"
                >
                  Projects
                </Link>
                {profile?.roles?.some(r => r.name === 'FREELANCER') && (
                  <Link 
                    to="/my-bids" 
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors rounded-lg hover:bg-blue-50"
                  >
                    My Bids
                  </Link>
                )}
                {profile?.roles?.some(r => r.name === 'CLIENT') && (
                  <Link to="/jobs/new" className="btn btn-primary text-sm ml-2">
                    + Post Job
                  </Link>
                )}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <Link 
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {profile.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{profile.fullName}</p>
                      <p className="text-xs text-gray-500">{profile.email}</p>
                    </div>
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-ghost text-sm px-4"
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
