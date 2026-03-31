import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { fetchMe } from './features/auth/authSlice'
import ProtectedRoute from './components/ProtectedRoute'

import Login        from './pages/auth/Login'
import Register     from './pages/auth/Register'
import Dashboard    from './pages/Dashboard'
import Analytics    from './pages/Analytics'
import Goals        from './pages/Goals'
import Journal      from './pages/Journal'
import Pomodoro     from './pages/Pomodoro'
import Leaderboard  from './pages/Leaderboard'
import Settings     from './pages/Settings'
import Coach        from './pages/Coach'
import PublicProfile from './pages/PublicProfile'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchMe())
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/u/:slug"  element={<PublicProfile />} />

        {/* Protected */}
        <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/analytics"   element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/goals"       element={<ProtectedRoute><Goals /></ProtectedRoute>} />
        <Route path="/journal"     element={<ProtectedRoute><Journal /></ProtectedRoute>} />
        <Route path="/pomodoro"    element={<ProtectedRoute><Pomodoro /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/settings"    element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/coach"       element={<ProtectedRoute><Coach /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App