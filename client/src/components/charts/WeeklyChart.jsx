import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format } from 'date-fns'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {Math.round(p.value * 10) / 10}h</p>)}
    </div>
  )
}

const WeeklyChart = ({ days }) => {
  if (!days || days.length === 0) {
    return <div className="flex items-center justify-center h-48 text-sm text-slate-400">No data yet for this week</div>
  }

  const chartData = days.map(d => ({
    name: format(new Date(d.date + 'T12:00:00'), 'EEE'),
    Planned: Math.round((d.plannedMins / 60) * 10) / 10,
    Actual:  Math.round((d.actualMins  / 60) * 10) / 10,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} barGap={3} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="h" width={28} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" iconSize={8} />
        <Bar dataKey="Planned" fill="#e0e7ff" radius={[3,3,0,0]} />
        <Bar dataKey="Actual"  fill="#6366f1" radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default WeeklyChart