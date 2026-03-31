const GoalRing = ({ goal }) => {
  const radius = 42
  const strokeWidth = 7
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(goal.completionPct || 0, 100)
  const offset = circumference * (1 - pct / 100)

  const getColor = () => {
    if (pct >= 100) return '#22c55e'
    if (pct >= 70)  return '#6366f1'
    if (pct >= 40)  return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="100" height="100" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={goal.color || getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          {/* Percentage text */}
          <text
            x="50" y="46"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="15"
            fontWeight="700"
            fill="#1e293b"
          >
            {pct}%
          </text>
          {/* Actual hours */}
          <text
            x="50" y="63"
            textAnchor="middle"
            fontSize="9"
            fill="#94a3b8"
          >
            {goal.actualHours || 0}h
          </text>
        </svg>
        {/* 100% badge */}
        {pct >= 100 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">✓</span>
          </div>
        )}
      </div>
      <p className="text-xs font-semibold text-slate-700 mt-1 text-center truncate max-w-[90px]">
        {goal.title || goal.category}
      </p>
      <p className="text-[10px] text-slate-400">
        of {goal.targetHours}h / week
      </p>
    </div>
  )
}

export default GoalRing