import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadGoals, loadGoalProgress, createGoal, deleteGoal } from '../features/goals/goalSlice'
import Layout from '../components/layout/Layout'
import GoalRing from '../components/charts/GoalRing'

const CATEGORIES = ['Study', 'Work', 'Exercise', 'Break', 'Reading', 'Personal', 'Other']
const COLORS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Teal',   value: '#14b8a6' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Green',  value: '#22c55e' },
  { label: 'Pink',   value: '#ec4899' },
]

const Goals = () => {
  const dispatch = useDispatch()
  const { goals, progress, isLoading } = useSelector(state => state.goals)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'Study', targetHours: 10, period: 'weekly', color: '#6366f1' })

  useEffect(() => {
    dispatch(loadGoals())
    dispatch(loadGoalProgress())
  }, [dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(createGoal(form))
    setShowForm(false)
    setForm({ title: '', category: 'Study', targetHours: 10, period: 'weekly', color: '#6366f1' })
    setTimeout(() => dispatch(loadGoalProgress()), 500)
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Goals</h1>
          <p className="text-slate-500 text-sm mt-0.5">Weekly hour targets by category</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          + New goal
        </button>
      </div>

      {progress.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-5">This week's progress</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {progress.map(goal => <GoalRing key={goal._id} goal={goal} />)}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">All goals</h2>
        {goals.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No goals yet. Add one to start tracking.</p>
        ) : (
          <div className="space-y-3">
            {goals.map(goal => {
              const prog = progress.find(p => p._id === goal._id)
              return (
                <div key={goal._id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50"
                  style={{ borderLeft: `4px solid ${goal.color}` }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-700">{goal.title || goal.category}</p>
                      <span className="text-xs text-slate-400 bg-white border border-slate-200 rounded px-2 py-0.5">{goal.category}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Target: {goal.targetHours}h / week</p>
                    {prog && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${prog.completionPct}%`, backgroundColor: goal.color }} />
                        </div>
                        <span className="text-[10px] text-slate-400">{prog.actualHours}h / {goal.targetHours}h</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => { if (window.confirm('Delete this goal?')) dispatch(deleteGoal(goal._id)) }}
                    className="ml-4 text-xs text-red-400 hover:text-red-600 transition-colors">
                    Delete
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-md mx-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Create new goal</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="e.g. Daily coding practice" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Target hours / week</label>
                  <input type="number" min="0.5" max="80" step="0.5" value={form.targetHours}
                    onChange={e => setForm({ ...form, targetHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Colour</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c.value} type="button" onClick={() => setForm({ ...form, color: c.value })}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: c.value,
                        borderColor: form.color === c.value ? '#1e293b' : 'transparent',
                        transform: form.color === c.value ? 'scale(1.2)' : 'scale(1)',
                      }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  Create goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Goals