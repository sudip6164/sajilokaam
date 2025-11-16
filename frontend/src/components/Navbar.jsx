import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Navbar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container-custom">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-black text-xl">SK</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent font-display">
                Sajilo Kaam
              </span>
              <span className="text-[10px] text-gray-500 font-medium -mt-1">Freelance Marketplace</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {profile ? (
              <>
                <Link 
                  to="/jobs" 
                  className={`relative px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    isActive('/jobs') 
                      ? 'text-violet-700 bg-violet-50/80' 
                      : 'text-gray-700 hover:text-violet-700 hover:bg-violet-50/50'
                  }`}
                >
                  {isActive('/jobs') && (
                    <span className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl"></span>
                  )}
                  <span className="relative">Jobs</span>
                </Link>
                <Link 
                  to="/projects" 
                  className={`relative px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    isActive('/projects') 
                      ? 'text-violet-700 bg-violet-50/80' 
                      : 'text-gray-700 hover:text-violet-700 hover:bg-violet-50/50'
                  }`}
                >
                  {isActive('/projects') && (
                    <span className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl"></span>
                  )}
                  <span className="relative">Projects</span>
                </Link>
                {profile?.roles?.some(r => r.name === 'FREELANCER') && (
                  <Link 
                    to="/my-bids" 
                    className={`relative px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      isActive('/my-bids') 
                        ? 'text-violet-700 bg-violet-50/80' 
                        : 'text-gray-700 hover:text-violet-700 hover:bg-violet-50/50'
                    }`}
                  >
                    {isActive('/my-bids') && (
                      <span className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl"></span>
                    )}
                    <span className="relative">My Bids</span>
                  </Link>
                )}
                {profile?.roles?.some(r => r.name === 'CLIENT') && (
                  <>
                    <Link 
                      to="/my-jobs" 
                      className={`relative px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        isActive('/my-jobs') 
                          ? 'text-violet-700 bg-violet-50/80' 
                          : 'text-gray-700 hover:text-violet-700 hover:bg-violet-50/50'
                      }`}
                    >
                      {isActive('/my-jobs') && (
                        <span className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl"></span>
                      )}
                      <span className="relative">My Jobs</span>
                    </Link>
                    <Link 
                      to="/jobs/new" 
                      className="btn btn-primary text-sm ml-2 relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Post Job
                      </span>
                    </Link>
                  </>
                )}
              </>
            ) : null}
          </div>

          {/* User Menu */}
          {profile ? (
            <div className="flex items-center gap-3">
              <Link 
                to="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100/80 transition-all duration-300 group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/30">
                    {profile.fullName?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-violet-700 transition-colors">{profile.fullName}</p>
                  <p className="text-xs text-gray-500">{profile.email}</p>
                </div>
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-ghost text-sm px-4 hidden sm:flex"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary text-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
