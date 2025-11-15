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
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Sajilo Kaam</Link>
        <div className="flex gap-4 items-center">
          {profile ? (
            <>
              <Link to="/jobs" className="hover:underline">Jobs</Link>
              <Link to="/jobs/new" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100">
                Post Job
              </Link>
              <span>{profile.fullName}</span>
              <button onClick={handleLogout} className="hover:underline">Logout</button>
            </>
          ) : (
            <Link to="/login" className="hover:underline">Login</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

