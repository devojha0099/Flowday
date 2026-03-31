const mongoose = require('mongoose')

const timeEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, default: 'Other' },
    actualStart: { type: Date, required: true },
    actualEnd: { type: Date, default: null },
    actualMins: { type: Number, default: 0 },
    plannedBlockId: { type: mongoose.Schema.Types.ObjectId, default: null },
    dayPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'DayPlan', default: null },
    driftMinutes: { type: Number, default: 0 },
    isUnplanned: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('TimeEntry', timeEntrySchema)