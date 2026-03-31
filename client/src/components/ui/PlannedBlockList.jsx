import { useDispatch } from 'react-redux'
import { deleteBlock } from '../../features/plans/planSlice'

const PlannedBlockList = ({ plan }) => {
  const dispatch = useDispatch()

  if (!plan || plan.blocks.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-4">
        No blocks yet — add one above
      </p>
    )
  }

  const sorted = [...plan.blocks].sort((a, b) => a.plannedStart.localeCompare(b.plannedStart))

  const handleDelete = (blockId) => {
    dispatch(deleteBlock({ planId: plan._id, blockId }))
  }

  return (
    <div className="space-y-2">
      {sorted.map((block) => (
        <div
          key={block._id}
          className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 group"
          style={{ borderLeft: `3px solid ${block.color}` }}
        >
          <div>
            <p className="text-sm font-medium text-slate-700">{block.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {block.plannedStart} – {block.plannedEnd} · {block.category}
            </p>
          </div>
          <button
            onClick={() => handleDelete(block._id)}
            className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}

export default PlannedBlockList