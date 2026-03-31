import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadCoachSuggestions } from '../features/ai/aiSlice'
import { loadStreaks } from '../features/streaks/streakSlice'
import Layout from '../components/layout/Layout'
import StreakBadge from '../components/ui/StreakBadge'

const Coach = () => {
  const dispatch = useDispatch()
  const { suggestions, coachLoading } = useSelector(state => state.ai)
  const { streaks } = useSelector(state => state.streaks)

  useEffect(() => {
    dispatch(loadStreaks())
    if (suggestions.length === 0) dispatch(loadCoachSuggestions())
  }, [dispatch])

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">AI Coach</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Personalized suggestions based on your last 30 days
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Suggestions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-slate-700">
                Your improvement areas
              </h2>
              <button
                onClick={() => dispatch(loadCoachSuggestions())}
                disabled={coachLoading}
                className="text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
              >
                {coachLoading ? 'Analysing...' : 'Refresh'}
              </button>
            </div>

            {coachLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-3">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400 mb-3">
                  Need at least a few days of tracking to generate suggestions.
                </p>
                <button
                  onClick={() => dispatch(loadCoachSuggestions())}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Try anyway
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Streaks sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Your streaks</h2>
            {streaks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Streaks update at midnight each day
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {streaks.map(s => (
                  <StreakBadge key={s._id} streak={s} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-indigo-700 mb-2 uppercase tracking-wide">
              How it works
            </h3>
            <p className="text-xs text-indigo-600 leading-relaxed">
              The AI analyses your last 30 days of tracking data — including average drift by day of week,
              unplanned activities, category distribution, and daily scores — then generates specific,
              data-backed suggestions. Results are cached for 24 hours.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Coach