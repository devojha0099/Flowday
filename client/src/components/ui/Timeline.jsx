import { format } from 'date-fns'
import { useDispatch } from 'react-redux'
import { deleteEntry } from '../../features/entries/entrySlice'

const getDriftLabel = (mins) => {
  if (!mins || mins === 0) return null
  return mins > 0 ? `+${mins}m late` : `${Math.abs(mins)}m early`
}

const getEntryStyle = (entry) => {
  if (!entry.actualEnd)         return 'bg-sky-50 border-l-2 border-sky-400 text-sky-800'
  if (entry.isUnplanned)        return 'bg-red-50 border-l-2 border-red-400 text-red-800'
  if (entry.driftMinutes > 10)  return 'bg-amber-50 border-l-2 border-amber-400 text-amber-800'
  if (entry.driftMinutes < -5)  return 'bg-blue-50 border-l-2 border-blue-400 text-blue-800'
  return 'bg-green-50 border-l-2 border-green-400 text-green-800'
}

const Timeline = ({ plan, entries }) => {
  const dispatch = useDispatch()
  const now = new Date()
  const blocks = plan ? [...plan.blocks].sort((a, b) => a.plannedStart.localeCompare(b.plannedStart)) : []
  const sortedEntries = [...(entries || [])].sort((a, b) => new Date(a.actualStart) - new Date(b.actualStart))

  const activeHours = new Set()
  blocks.forEach(b => {
    const [sh] = b.plannedStart.split(':').map(Number)
    const [eh] = b.plannedEnd.split(':').map(Number)
    for (let h = sh; h <= Math.min(eh, 22); h++) activeHours.add(h)
  })
  sortedEntries.forEach(e => {
    activeHours.add(new Date(e.actualStart).getHours())
    if (e.actualEnd) activeHours.add(new Date(e.actualEnd).getHours())
  })
  activeHours.add(now.getHours())

  const visibleHours = Array.from(activeHours).sort((a, b) => a - b)

  const blocksForHour = (hour) => blocks.filter(b => Number(b.plannedStart.split(':')[0]) === hour)
  const entriesForHour = (hour) => sortedEntries.filter(e => new Date(e.actualStart).getHours() === hour)

  if (blocks.length === 0 && sortedEntries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-sm">No plan for today yet.</p>
        <p className="text-xs mt-1">Add some blocks on the left to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-hidden">
      <div className="grid grid-cols-[48px_1fr_1fr] gap-1 mb-2">
        <div />
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2">Planned</div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2">Actual</div>
      </div>

      {visibleHours.map((hour) => {
        const isNowHour = now.getHours() === hour
        const hourBlocks   = blocksForHour(hour)
        const hourEntries  = entriesForHour(hour)

        return (
          <div key={hour}>
            {isNowHour && (
              <div className="grid grid-cols-[48px_1fr_1fr] items-center my-1">
                <div className="text-xs text-red-500 font-semibold text-right pr-2">
                  {format(now, 'HH:mm')}
                </div>
                <div className="col-span-2 h-px bg-red-400 opacity-60 relative">
                  <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-400" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-[48px_1fr_1fr] gap-1 mb-1 min-h-[40px]">
              <div className="text-xs text-slate-400 text-right pr-3 pt-2 font-mono">
                {String(hour).padStart(2, '0')}:00
              </div>

              <div className="space-y-1">
                {hourBlocks.map((block) => (
                  <div key={block._id} className="rounded-md px-2 py-1.5 text-xs"
                    style={{ backgroundColor: block.color + '18', borderLeft: `3px solid ${block.color}`, color: block.color }}>
                    <p className="font-medium truncate">{block.title}</p>
                    <p className="opacity-70 text-[10px]">{block.plannedStart}–{block.plannedEnd}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                {hourEntries.map((entry) => {
                  const drift = getDriftLabel(entry.driftMinutes)
                  return (
                    <div key={entry._id} className={`rounded-md px-2 py-1.5 text-xs ${getEntryStyle(entry)}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate">{entry.title}</p>
                        <button
                          onClick={() => dispatch(deleteEntry(entry._id))}
                          className="text-[10px] text-red-600 hover:text-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="opacity-70 text-[10px]">
                        {format(new Date(entry.actualStart), 'HH:mm')}
                        {entry.actualEnd ? `–${format(new Date(entry.actualEnd), 'HH:mm')}` : ' – ongoing'}
                      </p>
                      {drift && (
                        <span className="inline-block mt-0.5 text-[9px] bg-amber-100 text-amber-700 rounded px-1 py-0.5">
                          {drift}
                        </span>
                      )}
                      {entry.isUnplanned && (
                        <span className="inline-block mt-0.5 text-[9px] bg-red-100 text-red-600 rounded px-1 py-0.5">
                          unplanned
                        </span>
                      )}
                      {!entry.actualEnd && (
                        <span className="inline-block mt-0.5 text-[9px] bg-sky-100 text-sky-600 rounded px-1 py-0.5 animate-pulse">
                          recording...
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Timeline
