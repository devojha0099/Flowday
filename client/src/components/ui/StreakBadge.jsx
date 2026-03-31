const STREAK_META = {
  daily_plan: { label: 'Daily planner', icon: '📅', color: 'indigo' },
  on_time:    { label: 'On time',       icon: '⚡', color: 'amber' },
  goal_hit:   { label: 'Goal hit',      icon: '🎯', color: 'green' },
}

const StreakBadge = ({ streak }) => {
  const meta = STREAK_META[streak.type] || { label: streak.type, icon: '🔥', color: 'indigo' }
  const current = streak.currentStreak || 0
  const longest = streak.longestStreak || 0

  const colorMap = {
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', sub: 'text-indigo-400' },
    amber:  { bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700',  sub: 'text-amber-400' },
    green:  { bg: 'bg-green-50',  border: 'border-green-100',  text: 'text-green-700',  sub: 'text-green-400' },
  }
  const c = colorMap[meta.color]

  return (
    <div className={`rounded-xl border ${c.bg} ${c.border} p-4 flex flex-col items-center text-center`}>
      <span className="text-2xl mb-1">{meta.icon}</span>
      <p className={`text-2xl font-bold ${c.text}`}>{current}</p>
      <p className={`text-[11px] font-medium ${c.text} mt-0.5`}>{meta.label}</p>
      <p className={`text-[10px] ${c.sub} mt-1`}>Best: {longest} days</p>
    </div>
  )
}

export default StreakBadge