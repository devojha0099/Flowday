const TodayStats = ({ entries, plan }) => {
  const totalActualMins = entries.filter(e => e.actualMins).reduce((sum, e) => sum + e.actualMins, 0)
  const totalPlannedMins = plan?.blocks?.reduce((sum, b) => sum + (b.estimatedMins || 0), 0) || 0

  const driftValues = entries.filter(e => e.driftMinutes && e.driftMinutes !== 0).map(e => e.driftMinutes)
  const avgDrift = driftValues.length
    ? Math.round(driftValues.reduce((a, b) => a + b, 0) / driftValues.length)
    : 0

  const formatMins = (mins) => {
    if (mins < 60) return `${mins}m`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  const stats = [
    { label: 'Tracked',  value: formatMins(totalActualMins),  color: 'text-slate-800' },
    { label: 'Planned',  value: formatMins(totalPlannedMins), color: 'text-slate-800' },
    {
      label: 'Avg drift',
      value: avgDrift === 0 ? 'On time' : avgDrift > 0 ? `+${avgDrift}m` : `${avgDrift}m`,
      color: avgDrift === 0 ? 'text-green-600' : avgDrift > 15 ? 'text-red-500' : 'text-amber-500',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, color }) => (
        <div key={label} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <p className={`text-base font-bold ${color}`}>{value}</p>
          <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}

export default TodayStats