import { format } from 'date-fns'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6)

const getDriftLabel = (mins) => {
  if (!mins || mins === 0) return null
  if (mins > 0) return `+${mins}m late`
  return `${Math.abs(mins)}m early`
}

const getEntryStyle = (entry) => {
  if (!entry.actualEnd)
    return 'bg-sky-50 border-l-2 border-sky-400 text-sky-800'
  if (entry.isUnplanned)
    return 'bg-red-50 border-l-2 border-red-400 text-red-800'
  if (entry.driftMinutes > 10)
    return 'bg-amber-50 border-l-2 border-amber-400 text-amber-800'
  if (entry.driftMinutes < -5)
    return 'bg-blue-50 border-l-2 border-blue-400 text-blue-800'
  return 'bg-green-50 border-l-2 border-green-400 text-green-800'
}

const Timeline = ({ plan, entries = [] }) => {
  const now = new Date()

  const blocks = plan
    ? [...plan.blocks].sort((a, b) =>
        a.plannedStart.localeCompare(b.plannedStart)
      )
    : []

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.actualStart) - new Date(b.actualStart)
  )

  // Collect which hours have content
  const activeHours = new Set()

  blocks.forEach((b) => {
    const [sh] = b.plannedStart.split(':').map(Number)
    const [eh] = b.plannedEnd.split(':').map(Number)
    for (let h = sh; h <= Math.min(eh, 23); h++) activeHours.add(h)
  })

  sortedEntries.forEach((e) => {
    const startH = new Date(e.actualStart).getHours()
    activeHours.add(startH)
    if (e.actualEnd) {
      activeHours.add(new Date(e.actualEnd).getHours())
    } else {
      activeHours.add(now.getHours())
    }
  })

  // Always show current hour so "now" line is visible
  activeHours.add(now.getHours())

  const visibleHours = HOURS.filter((h) => activeHours.has(h))

  // Get planned blocks that START in this hour
  const blocksForHour = (hour) =>
    blocks.filter((b) => {
      const [sh] = b.plannedStart.split(':').map(Number)
      return sh === hour
    })

  // Get actual entries that START in this hour
  const entriesForHour = (hour) =>
    sortedEntries.filter(
      (e) => new Date(e.actualStart).getHours() === hour
    )

  if (blocks.length === 0 && sortedEntries.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-400">No plan for today yet.</p>
        <p className="text-xs text-slate-300 mt-1">
          Add some blocks on the left to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-[52px_1fr_1fr] gap-1 mb-3 border-b border-slate-100 pb-2">
        <div />
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2">
          Planned
        </div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2">
          Actual
        </div>
      </div>

      {visibleHours.map((hour) => {
        const isNowHour = now.getHours() === hour
        const hourBlocks = blocksForHour(hour)
        const hourEntries = entriesForHour(hour)
        const hasContent =
          hourBlocks.length > 0 || hourEntries.length > 0 || isNowHour

        if (!hasContent) return null

        return (
          <div key={hour}>
            {/* "Now" line rendered ABOVE the current hour row */}
            {isNowHour && (
              <div className="grid grid-cols-[52px_1fr_1fr] items-center my-1.5">
                <div className="text-[10px] text-red-500 font-semibold font-mono text-right pr-2">
                  {format(now, 'HH:mm')}
                </div>
                <div className="col-span-2 relative">
                  <div className="h-px bg-red-400 opacity-70 w-full" />
                  <div className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-red-400" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-[52px_1fr_1fr] gap-1 mb-1.5 min-h-[44px]">
              {/* Hour label */}
              <div className="text-[11px] text-slate-400 text-right pr-3 pt-2 font-mono leading-none">
                {String(hour).padStart(2, '0')}:00
              </div>

              {/* Planned column */}
              <div className="space-y-1">
                {hourBlocks.map((block) => (
                  <div
                    key={block._id}
                    className="rounded-md px-2 py-1.5 text-xs"
                    style={{
                      backgroundColor: block.color + '20',
                      borderLeft: `3px solid ${block.color}`,
                      color: block.color,
                    }}
                  >
                    <p className="font-semibold truncate leading-tight">
                      {block.title}
                    </p>
                    <p className="opacity-60 text-[10px] mt-0.5 font-mono">
                      {block.plannedStart}–{block.plannedEnd}
                    </p>
                    <p className="opacity-50 text-[10px]">{block.category}</p>
                  </div>
                ))}
              </div>

              {/* Actual column */}
              <div className="space-y-1">
                {hourEntries.map((entry) => {
                  const drift = getDriftLabel(entry.driftMinutes)
                  const isLive = !entry.actualEnd

                  return (
                    <div
                      key={entry._id}
                      className={`rounded-md px-2 py-1.5 text-xs ${getEntryStyle(entry)} ${
                        isLive ? 'animate-pulse' : ''
                      }`}
                    >
                      <p className="font-semibold truncate leading-tight">
                        {entry.title}
                      </p>
                      <p className="opacity-60 text-[10px] mt-0.5 font-mono">
                        {format(new Date(entry.actualStart), 'HH:mm')}
                        {entry.actualEnd
                          ? `–${format(new Date(entry.actualEnd), 'HH:mm')}`
                          : ' – now'}
                      </p>

                      {/* Drift badge */}
                      {drift && !isLive && (
                        <span className="inline-block mt-0.5 text-[9px] bg-amber-100 text-amber-700 rounded px-1 py-0.5 font-mono">
                          {drift}
                        </span>
                      )}

                      {/* Live badge */}
                      {isLive && (
                        <span className="inline-block mt-0.5 text-[9px] bg-sky-100 text-sky-600 rounded px-1 py-0.5">
                          recording…
                        </span>
                      )}

                      {/* Unplanned badge */}
                      {entry.isUnplanned && !isLive && (
                        <span className="inline-block mt-0.5 text-[9px] bg-red-100 text-red-600 rounded px-1 py-0.5 ml-1">
                          unplanned
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