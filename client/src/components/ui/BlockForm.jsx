import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addBlock } from '../../features/plans/planSlice'
import { useToday } from '../../hooks/useToday'

const CATEGORIES = ['Study', 'Work', 'Exercise', 'Break', 'Reading', 'Personal', 'Other']
const COLORS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Teal',   value: '#14b8a6' },
  { label: 'Green',  value: '#22c55e' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Pink',   value: '#ec4899' },
  { label: 'Red',    value: '#ef4444' },
]

const BlockForm = () => {
  const dispatch = useDispatch()
  const today = useToday()
  const { isLoading } = useSelector((state) => state.plans)

  const [form, setForm] = useState({
    title: '', plannedStart: '08:00', plannedEnd: '09:00',
    category: 'Study', color: '#6366f1',
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    dispatch(addBlock({ ...form, date: today }))
    setForm({ ...form, title: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">What will you work on?</label>
        <input
          type="text" name="title" value={form.title} onChange={handleChange} required
          placeholder="e.g. Study — Data Structures"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Start time</label>
          <input type="time" name="plannedStart" value={form.plannedStart} onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">End time</label>
          <input type="time" name="plannedEnd" value={form.plannedEnd} onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
          <select name="category" value={form.category} onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Color</label>
          <select name="color" value={form.color} onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" disabled={isLoading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
        {isLoading ? 'Adding...' : 'Add block'}
      </button>
    </form>
  )
}

export default BlockForm