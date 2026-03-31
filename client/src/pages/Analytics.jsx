import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadWeeklyAnalytics, loadHeatmap, loadMonthlyAnalytics } from '../features/analytics/analyticsSlice'
import { loadGoalProgress } from '../features/goals/goalSlice'
import { getWeekStart, getTodayStr, fmtMins } from '../hooks/useToday'
import Layout from '../components/layout/Layout'
import WeeklyChart from '../components/charts/WeeklyChart'
import CategoryChart from '../components/charts/CategoryChart'
import Heatmap from '../components/charts/Heatmap'
import GoalRing from '../components/charts/GoalRing'

const TABS = ['Week', 'Month', 'Heatmap', 'Goals']

const StatCard = ({ label, value, sub, valueColor }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-2xl font-bold ${valueColor || 'text-slate-800'}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
  </div>
)

const Analytics = () => {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('Week')
  const { weekly, monthly, heatmap, isLoading } = useSelector(state => state.analytics)
  const { progress } = useSelector(state => state.goals)
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1

  useEffect(() => {
    const startDate = getWeekStart()
    const endDate = getTodayStr()
    dispatch(loadWeeklyAnalytics({ startDate, endDate }))
    dispatch(loadHeatmap(year))
    dispatch(loadMonthlyAnalytics({ month, year }))
    dispatch(loadGoalProgress())
  }, [dispatch])

  // Summary stats derived from weekly data
  const weeklyStats = weekly ? {
    avgScore: weekly.days.length
      ? Math.round(weekly.days.reduce((s, d) => s + d.score, 0) / weekly.days.filter(d => d.score > 0).length || 0)
      : 0,
    totalActual: weekly.days.reduce((s, d) => s + d.actualMins, 0),
    totalPlanned: weekly.days.reduce((s, d) => s + d.plannedMins, 0),
  } : null

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Your productivity patterns</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── WEEK TAB ── */}
      {!isLoading && activeTab === 'Week' && (
        <div className="space-y-5">
          {/* Summary stats */}
          {weeklyStats && (
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Avg score"
                value={`${weeklyStats.avgScore || 0}%`}
                sub="This week"
                valueColor={weeklyStats.avgScore >= 70 ? 'text-green-600' : 'text-amber-500'}
              />
              <StatCard
                label="Tracked"
                value={fmtMins(weeklyStats.totalActual)}
                sub={`of ${fmtMins(weeklyStats.totalPlanned)} planned`}
              />
              <StatCard
                label="Completion"
                value={weeklyStats.totalPlanned > 0
                  ? `${Math.round((weeklyStats.totalActual / weeklyStats.totalPlanned) * 100)}%`
                  : '—'}
                sub="Planned hours done"
              />
            </div>
          )}

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Planned vs actual (hours)
              </h3>
              <WeeklyChart days={weekly?.days || []} />
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Time by category
              </h3>
              <CategoryChart categories={weekly?.categories || []} />
            </div>
          </div>

          {/* Day-by-day table */}
          {weekly?.days && weekly.days.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Day breakdown</h3>
              <div className="space-y-2">
                {weekly.days.map((day) => (
                  <div
                    key={day.date}
                    className="grid grid-cols-[80px_1fr_64px_64px_64px] gap-3 items-center py-1"
                  >
                    <span className="text-xs font-medium text-slate-600">
                      {new Date(day.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {/* Progress bar */}
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{
                          width: day.plannedMins > 0
                            ? `${Math.min(100, Math.round((day.actualMins / day.plannedMins) * 100))}%`
                            : '0%'
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 text-right">{fmtMins(day.actualMins)}</span>
                    <span className="text-xs text-slate-300 text-right">{fmtMins(day.plannedMins)}</span>
                    <span className={`text-xs font-semibold text-right ${
                      day.score >= 70 ? 'text-green-600' : day.score >= 40 ? 'text-amber-500' : 'text-red-400'
                    }`}>
                      {day.score > 0 ? `${day.score}%` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MONTH TAB ── */}
      {!isLoading && activeTab === 'Month' && (
        <div className="space-y-5">
          {monthly ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Avg score" value={`${monthly.avgScore}%`} sub="This month" />
                <StatCard label="Active days" value={monthly.totalDays} sub="Days with data" />
                <StatCard label="Total tracked" value={fmtMins(monthly.totalActualMins)} sub="This month" />
                <StatCard
                  label="Best day"
                  value={monthly.bestDay
                    ? `${monthly.bestDay.overallScore}%`
                    : '—'}
                  sub={monthly.bestDay
                    ? new Date(monthly.bestDay.date + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })
                    : ''}
                  valueColor="text-green-600"
                />
              </div>

              {/* Score trend */}
              {monthly.scores && monthly.scores.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Daily score trend</h3>
                  <div className="flex items-end gap-1 h-24">
                    {monthly.scores.map((s) => (
                      <div
                        key={s.date}
                        title={`${s.date}: ${s.overallScore}%`}
                        className="flex-1 rounded-t transition-all"
                        style={{
                          height: `${s.overallScore}%`,
                          minHeight: '3px',
                          backgroundColor: s.overallScore >= 70 ? '#6366f1'
                            : s.overallScore >= 40 ? '#f59e0b' : '#ef4444',
                          opacity: 0.85,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1st</span>
                    <span>{new Date().toLocaleDateString('en', { month: 'long' })}</span>
                    <span>Today</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              No monthly data yet
            </div>
          )}
        </div>
      )}

      {/* ── HEATMAP TAB ── */}
      {!isLoading && activeTab === 'Heatmap' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-700">
              Productivity heatmap — {year}
            </h3>
            <span className="text-xs text-slate-400">
              {Object.keys(heatmap).length} days tracked
            </span>
          </div>
          <Heatmap heatmap={heatmap} year={year} />
        </div>
      )}

      {/* ── GOALS TAB ── */}
      {!isLoading && activeTab === 'Goals' && (
        <div className="space-y-5">
          {progress.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-500 mb-1">No goals set yet</p>
              <p className="text-xs text-slate-400">Go to the Goals page to add weekly targets</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-6">
                This week's goal progress
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {progress.map((goal) => (
                  <GoalRing key={goal._id} goal={goal} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}

export default Analytics