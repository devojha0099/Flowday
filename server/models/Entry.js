const mongoose = require('mongoose')

const entrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    title: { type: String, required: true },
    category: String,
    plannedBlockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    dayPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    actualStart: { type: Date, required: true },
    actualEnd: Date,
    notes: String,
    isUnplanned: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Entry', entrySchema)
