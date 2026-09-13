import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-sm">C</div>
            <span className="font-bold text-xl gradient-text">Camvo</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/creator/dashboard" className="text-dark-200 hover:text-white transition-colors text-sm font-medium">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                  Log Out
                </button>
              </>
            ) : (
              <Link to="/creator/login" className="btn-primary text-sm py-2 px-4">
                Creator Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}