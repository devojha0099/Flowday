import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/layout/Layout'

const Leaderboard = () => {
  const { user } = useSelector(state => state.auth)
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leaderboard')
      .then(res => setBoard(res.data.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Leaderboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Weekly productivity scores — public profiles only
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[48px_1fr_80px_80px] gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50">
            <div className="text-xs font-semibold text-slate-400 text-center">#</div>
            <div className="text-xs font-semibold text-slate-400">User</div>
            <div className="text-xs font-semibold text-slate-400 text-right">Score</div>
            <div className="text-xs font-semibold text-slate-400 text-right">Active days</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : board.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-slate-400">No public profiles yet.</p>
              <p className="text-xs text-slate-300 mt-1">
                Enable your public profile in Settings to appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {board.map((entry, idx) => {
                const isCurrentUser = entry.userId === user?.id
                return (
                  <div
                    key={entry.userId}
                    className={`grid grid-cols-[48px_1fr_80px_80px] gap-3 px-5 py-3.5 items-center transition-colors ${
                      isCurrentUser ? 'bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-center">
                      {idx < 3
                        ? <span className="text-lg">{medals[idx]}</span>
                        : <span className="text-sm font-semibold text-slate-400">{idx + 1}</span>
                      }
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-indigo-700' : 'text-slate-700'}`}>
                            {entry.name}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[10px] text-indigo-400 bg-indigo-100 rounded px-1.5 py-0.5 flex-shrink-0">
                              you
                            </span>
                          )}
                        </div>
                        {entry.profileSlug && (
                          <Link
                            to={`/u/${entry.profileSlug}`}
                            className="text-[11px] text-slate-400 hover:text-indigo-500 transition-colors"
                          >
                            View profile →
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${
                        entry.avgScore >= 80 ? 'text-green-600' :
                        entry.avgScore >= 60 ? 'text-indigo-600' :
                        entry.avgScore >= 40 ? 'text-amber-500' : 'text-red-400'
                      }`}>
                        {entry.avgScore}%
                      </span>
                    </div>
                    <div className="text-right text-sm text-slate-400">
                      {entry.activeDays}d
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">How it works</h2>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex gap-2">
                <span className="text-indigo-400 mt-0.5">→</span>
                Rankings are based on average productivity score this week
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 mt-0.5">→</span>
                Score = adherence (50%) + punctuality (50%)
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 mt-0.5">→</span>
                Only users with public profiles appear here
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 mt-0.5">→</span>
                Resets every Monday at midnight
              </li>
            </ul>
          </div>

          {!user?.isPublic && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <p className="text-xs font-semibold text-amber-700 mb-1">
                You're not on the leaderboard
              </p>
              <p className="text-xs text-amber-600 mb-3">
                Enable your public profile in Settings to join the rankings.
              </p>
              <Link
                to="/settings"
                className="text-xs font-semibold text-amber-700 underline hover:no-underline"
              >
                Go to Settings →
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Leaderboard