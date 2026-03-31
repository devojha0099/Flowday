import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'

const NAV_LINKS = [
  { path: '/dashboard',   label: 'Today' },
  { path: '/analytics',   label: 'Analytics' },
  { path: '/goals',       label: 'Goals' },
  { path: '/journal',     label: 'Journal' },
  { path: '/pomodoro',    label: 'Pomodoro' },
  { path: '/coach',       label: 'AI Coach' },
  { path: '/leaderboard', label: 'Leaderboard' },
]

const Navbar = () => {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/dashboard" className="font-bold text-indigo-600 text-lg tracking-tight flex-shrink-0">
          FlowDay
        </Link>

        <div className="hidden md:flex items-center gap-0.5 overflow-x-auto">
          {NAV_LINKS.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                location.pathname === path
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm text-slate-500 hidden lg:block truncate max-w-[120px]">
            {user?.name}
          </span>
          <Link
            to="/settings"
            className={`text-sm transition-colors ${
              location.pathname === '/settings'
                ? 'text-indigo-600'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar