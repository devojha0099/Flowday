import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadPlan } from '../features/plans/planSlice'
import { loadTodayEntries } from '../features/entries/entrySlice'
import { useToday, formatDisplayDate } from '../hooks/useToday'
import Layout from '../components/layout/Layout'
import BlockForm from '../components/ui/BlockForm'
import PlannedBlockList from '../components/ui/PlannedBlockList'
import Timeline from '../components/ui/Timeline'
import LiveTimer from '../components/timer/LiveTimer'
import ManualEntryForm from '../components/ui/ManualEntryForm'
import TodayStats from '../components/ui/TodayStats'

const Dashboard = () => {
  const dispatch = useDispatch()
  const today = useToday()
  const { todayPlan, isLoading: planLoading } = useSelector(state => state.plans)
  const { todayEntries, isLoading: entryLoading } = useSelector(state => state.entries)
  const { user } = useSelector(state => state.auth)
  const [showManual, setShowManual] = useState(false)

  useEffect(() => {
    dispatch(loadPlan(today))
    dispatch(loadTodayEntries())
  }, [dispatch, today])

  // Refresh entries every 30 seconds if timer is running
  const { activeTimer } = useSelector(state => state.entries)
  useEffect(() => {
    if (!activeTimer) return
    const interval = setInterval(() => dispatch(loadTodayEntries()), 30000)
    return () => clearInterval(interval)
  }, [activeTimer, dispatch])

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Good {getGreeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{formatDisplayDate(today)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

        {/* Left column */}
        <div className="space-y-4">

          {/* Live timer card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700">Live timer</h2>
              <button
                onClick={() => setShowManual(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                + Manual entry
              </button>
            </div>
            <LiveTimer plan={todayPlan} />
          </div>

          {/* Stats card */}
          {todayEntries.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Today's stats</h2>
              <TodayStats entries={todayEntries} plan={todayPlan} />
            </div>
          )}

          {/* Plan builder card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Plan your day</h2>
            <BlockForm />
          </div>

          {/* Planned blocks list */}
          {todayPlan && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Today's blocks
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({todayPlan.blocks.length} planned)
                </span>
              </h2>
              <PlannedBlockList plan={todayPlan} />
            </div>
          )}
        </div>

        {/* Right column — Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">
              Planned vs actual timeline
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Live
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> On time
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Late
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Unplanned
              </span>
            </div>
          </div>

          {planLoading || entryLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Timeline plan={todayPlan} entries={todayEntries} />
          )}
        </div>
      </div>

      {/* Manual entry modal */}
      {showManual && (
        <ManualEntryForm
          plan={todayPlan}
          onClose={() => setShowManual(false)}
        />
      )}
    </Layout>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default Dashboard