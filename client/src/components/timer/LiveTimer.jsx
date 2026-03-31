import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { startTimer, stopTimer } from '../../features/entries/entrySlice'
import { useTimer } from '../../hooks/useTimer'

const CATEGORIES = ['Study', 'Work', 'Exercise', 'Break', 'Reading', 'Personal', 'Other']

const LiveTimer = ({ plan }) => {
  const dispatch = useDispatch()
  const { activeTimer, isLoading } = useSelector((state) => state.entries)
  const elapsed = useTimer(activeTimer?.startTime)

  const [form, setForm] = useState({
    title: '',
    category: 'Study',
    plannedBlockId: '',
  })
  const [showManual, setShowManual] = useState(false)

  const handleStart = () => {
    if (!form.title.trim()) return
    const today = new Date().toISOString().split('T')[0]

    // Find the matching planned block if selected
    const selectedBlock = plan?.blocks?.find(b => b._id === form.plannedBlockId)

    dispatch(startTimer({
      title: form.title,
      category: form.category,
      date: today,
      plannedBlockId: form.plannedBlockId || null,
      dayPlanId: plan?._id || null,
      isUnplanned: !form.plannedBlockId,
    }))
  }

  const handleStop = () => {
    if (activeTimer?.id) {
      dispatch(stopTimer(activeTimer.id))
    }
  }

  const sortedBlocks = plan?.blocks
    ? [...plan.blocks].sort((a, b) => a.plannedStart.localeCompare(b.plannedStart))
    : []

  return (
    <div className="space-y-3">
      {/* Timer display */}
      <div className={`rounded-lg p-4 text-center border ${
        activeTimer
          ? 'bg-green-50 border-green-200'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className={`text-3xl font-bold font-mono tracking-widest ${
          activeTimer ? 'text-green-600' : 'text-slate-400'
        }`}>
          {activeTimer ? elapsed : '00:00:00'}
        </div>
        {activeTimer && (
          <p className="text-xs text-green-600 mt-1 truncate">
            Tracking: {activeTimer.title}
          </p>
        )}
        {!activeTimer && (
          <p className="text-xs text-slate-400 mt-1">Timer not running</p>
        )}
      </div>

      {/* Active timer controls */}
      {activeTimer ? (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-700">{activeTimer.title}</p>
            <p className="text-xs text-indigo-400 mt-0.5">
              {activeTimer.category} · started {new Date(activeTimer.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={handleStop}
            disabled={isLoading}
            className="bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            Stop
          </button>
        </div>
      ) : (
        /* Start timer form */
        <div className="space-y-2">
          <input
            type="text"
            placeholder="What are you working on?"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            <select
              value={form.plannedBlockId}
              onChange={e => {
                const block = plan?.blocks?.find(b => b._id === e.target.value)
                setForm({
                  ...form,
                  plannedBlockId: e.target.value,
                  title: block ? block.title : form.title,
                  category: block ? block.category : form.category,
                })
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Unplanned</option>
              {sortedBlocks.map(b => (
                <option key={b._id} value={b._id}>
                  {b.plannedStart} {b.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStart}
            disabled={isLoading || !form.title.trim()}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Start timer
          </button>
        </div>
      )}
    </div>
  )
}

export default LiveTimer