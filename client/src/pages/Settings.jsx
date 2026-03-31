import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateSettings } from '../features/auth/authSlice'
import Layout from '../components/layout/Layout'

const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Australia/Sydney', 'Pacific/Auckland',
]

const Settings = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [form, setForm] = useState({ name: '', timezone: 'Asia/Kolkata', isPublic: false })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        timezone: user.timezone || 'Asia/Kolkata',
        isPublic: user.isPublic || false,
      })
    }
  }, [user])

  const handleSave = (e) => {
    e.preventDefault()
    dispatch(updateSettings(form))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account preferences</p>
      </div>

      <div className="max-w-xl space-y-5">
        {/* Profile settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-5">Profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Display name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-400"
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Timezone</label>
              <select
                value={form.timezone}
                onChange={e => setForm({ ...form, timezone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <input
                type="checkbox"
                id="isPublic"
                checked={form.isPublic}
                onChange={e => setForm({ ...form, isPublic: e.target.checked })}
                className="mt-0.5 accent-indigo-600 w-4 h-4"
              />
              <div>
                <label htmlFor="isPublic" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Public profile
                </label>
                <p className="text-xs text-slate-400 mt-0.5">
                  Show your heatmap and streaks at{' '}
                  <code className="text-indigo-500">/u/{user?.profileSlug}</code>{' '}
                  and appear on the leaderboard.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                saved
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {saved ? 'Saved!' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Public profile link */}
        {user?.isPublic && user?.profileSlug && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
            <p className="text-xs font-semibold text-indigo-700 mb-1">Your public profile</p>
            <a
              href={`/u/${user.profileSlug}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-indigo-600 hover:underline break-all"
            >
              {window.location.origin}/u/{user.profileSlug}
            </a>
          </div>
        )}

        {/* Danger zone */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Account</h2>
          <p className="text-xs text-slate-400 mb-4">
            Logged in as <strong>{user?.email}</strong>
          </p>
          <div className="text-xs text-slate-400 space-y-1">
            <p>Profile slug: <code className="text-slate-600">{user?.profileSlug}</code></p>
            <p>Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Settings