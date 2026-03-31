import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addManualEntry } from '../../features/entries/entrySlice'
import { useToday } from '../../hooks/useToday'

const CATEGORIES = ['Study', 'Work', 'Exercise', 'Break', 'Reading', 'Personal', 'Other']

const ManualEntryForm = ({ plan, onClose }) => {
  const dispatch = useDispatch()
  const today = useToday()
  const { isLoading } = useSelector(state => state.entries)
  const [form, setForm] = useState({ title: '', category: 'Study', startTime: '', endTime: '', plannedBlockId: '', notes: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title || !form.startTime || !form.endTime) return
    dispatch(addManualEntry({
      title: form.title, category: form.category, date: today,
      actualStart: new Date(`${today}T${form.startTime}`).toISOString(),
      actualEnd:   new Date(`${today}T${form.endTime}`).toISOString(),
      plannedBlockId: form.plannedBlockId || null,
      dayPlanId: plan?._id || null,
      isUnplanned: !form.plannedBlockId,
      notes: form.notes,
    }))
    onClose()
  }

  const sortedBlocks = plan?.blocks
    ? [...plan.blocks].sort((a, b) => a.plannedStart.localeCompare(b.plannedStart))
    : []

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-md mx-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Add manual entry</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="What did you work on?" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} required
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Start time</label>
              <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">End time</label>
              <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Linked block</label>
              <select value={form.plannedBlockId} onChange={e => setForm({ ...form, plannedBlockId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Unplanned</option>
                {sortedBlocks.map(b => <option key={b._id} value={b._id}>{b.plannedStart} {b.title}</option>)}
              </select>
            </div>
          </div>
          <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={2} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              Save entry
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ManualEntryForm