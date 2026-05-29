import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/hooks/useAuth'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Max's Athlete Tracker</h1>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        {user && (
          <div className="flex gap-2 text-sm flex-wrap">
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-4 py-2 rounded transition ${
                isActive('/dashboard')
                  ? 'bg-blue-700 font-semibold'
                  : 'hover:bg-blue-700'
              }`}
            >
              📗 Long Toss Program
            </button>
            <button
              onClick={() => navigate('/hitting')}
              className={`px-4 py-2 rounded transition ${
                location.pathname.startsWith('/hitting') && !isActive('/hitting/stats')
                  ? 'bg-blue-700 font-semibold'
                  : 'hover:bg-blue-700'
              }`}
            >
              ⚾ Live At Bats
            </button>
            <button
              onClick={() => navigate('/hitting/stats')}
              className={`px-4 py-2 rounded transition ${
                isActive('/hitting/stats')
                  ? 'bg-blue-700 font-semibold'
                  : 'hover:bg-blue-700'
              }`}
            >
              📈 Performance
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
