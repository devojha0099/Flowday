const mongoose = require('mongoose')

const plannedBlockSchema = new mongoose.Schema({
  title: { type: String, required: true },
  plannedStart: { type: String, required: true },
  plannedEnd: { type: String, required: true },
  category: { type: String, default: 'Other' },
  color: { type: String, default: '#6366f1' },
  estimatedMins: { type: Number, default: 0 },
})

const dayPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    blocks: [plannedBlockSchema],
    aiQuote: { type: String, default: null },
  },
  { timestamps: true }
)

dayPlanSchema.index({ userId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('DayPlan', dayPlanSchema)