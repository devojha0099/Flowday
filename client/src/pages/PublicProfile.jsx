import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import Heatmap from '../components/charts/Heatmap'
import StreakBadge from '../components/ui/StreakBadge'

const PublicProfile = () => {
  const { slug } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const year = new Date().getFullYear()

  useEffect(() => {
    api.get(`/profile/${slug}`)
      .then(res => setProfile(res.data.profile))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <p className="text-slate-600 font-medium">Profile not found or not public</p>
      <Link to="/" className="text-sm text-indigo-600 hover:underline">Go to FlowDay</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-indigo-600 text-lg">FlowDay</span>
        <Link to="/login" className="text-sm text-slate-500 hover:text-slate-700">Sign in</Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Profile header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{profile.name}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {profile.totalDays} days tracked · avg score{' '}
              <span className="font-semibold text-indigo-600">{profile.avgScore}%</span>
            </p>
          </div>
        </div>

        {/* Streaks */}
        {profile.streaks?.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Streaks</h2>
            <div className="grid grid-cols-3 gap-3">
              {profile.streaks.map(s => (
                <StreakBadge key={s._id} streak={s} />
              ))}
            </div>
          </div>
        )}

        {/* Heatmap */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Productivity heatmap — {year}
          </h2>
          <Heatmap heatmap={profile.heatmap || {}} year={year} />
        </div>
      </div>
    </div>
  )
}

export default PublicProfile