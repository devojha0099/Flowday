import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#6366f1','#8b5cf6','#14b8a6','#f97316','#ec4899','#22c55e','#f59e0b']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  const hours = Math.floor(value / 60)
  const mins  = value % 60
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm text-xs">
      <p className="font-semibold text-slate-700">{name}</p>
      <p className="text-slate-500 mt-0.5">{hours > 0 ? `${hours}h ` : ''}{mins > 0 ? `${mins}m` : ''}</p>
    </div>
  )
}

const CategoryChart = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return <div className="flex items-center justify-center h-48 text-sm text-slate-400">No entries yet this week</div>
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={categories} dataKey="mins" nameKey="name" cx="50%" cy="45%" innerRadius={45} outerRadius={75} paddingAngle={2}>
          {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default CategoryChart