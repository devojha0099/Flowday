import { format, eachDayOfInterval, startOfYear, endOfYear, getDay } from 'date-fns'

const getColor = (score) => {
  if (!score || score === 0) return '#f1f5f9'
  if (score < 30) return '#e0e7ff'
  if (score < 50) return '#c7d2fe'
  if (score < 65) return '#a5b4fc'
  if (score < 80) return '#818cf8'
  if (score < 90) return '#6366f1'
  return '#4338ca'
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS = ['S','M','T','W','T','F','S']

const Heatmap = ({ heatmap, year }) => {
  const startDate = startOfYear(new Date(year, 0, 1))
  const endDate   = endOfYear(new Date(year, 0, 1))
  const allDays   = eachDayOfInterval({ start: startDate, end: endDate })

  const firstDayOfWeek = getDay(startDate)
  const paddedDays = [...Array(firstDayOfWeek).fill(null), ...allDays]

  const weeks = []
  for (let i = 0; i < paddedDays.length; i += 7) weeks.push(paddedDays.slice(i, i + 7))

  const monthPositions = {}
  allDays.forEach((day) => {
    const m = day.getMonth()
    if (!monthPositions[m]) {
      const weekIdx = Math.floor((getDay(startDate) + allDays.indexOf(day)) / 7)
      monthPositions[m] = weekIdx
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex mb-1" style={{ paddingLeft: '24px' }}>
          {weeks.map((_, wi) => {
            const monthEntry = Object.entries(monthPositions).find(([, pos]) => pos === wi)
            return (
              <div key={wi} style={{ width: '13px', flexShrink: 0 }}>
                {monthEntry && <span className="text-[9px] text-slate-400">{MONTH_LABELS[Number(monthEntry[0])]}</span>}
              </div>
            )
          })}
        </div>
        <div className="flex gap-0">
          <div className="flex flex-col mr-1">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="text-[9px] text-slate-400 flex items-center justify-center" style={{ width: '12px', height: '11px' }}>
                {i % 2 === 1 ? label : ''}
              </div>
            ))}
          </div>
          <div className="flex gap-[2px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) => {
                  if (!day) return <div key={di} style={{ width: '11px', height: '11px' }} />
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const score = heatmap[dateStr] || 0
                  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
                  return (
                    <div key={di} title={`${dateStr}: ${score > 0 ? score + '/100' : 'No data'}`}
                      style={{
                        width: '11px', height: '11px', borderRadius: '2px',
                        backgroundColor: getColor(score),
                        outline: isToday ? '1.5px solid #6366f1' : 'none',
                        outlineOffset: '1px', cursor: 'default',
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2 justify-end">
          <span className="text-[9px] text-slate-400">Less</span>
          {['#f1f5f9','#c7d2fe','#818cf8','#6366f1','#4338ca'].map(color => (
            <div key={color} style={{ width: '11px', height: '11px', borderRadius: '2px', backgroundColor: color }} />
          ))}
          <span className="text-[9px] text-slate-400">More</span>
        </div>
      </div>
    </div>
  )
}

export default Heatmap