const mongoose = require('mongoose')

const blockSchema = new mongoose.Schema({
  title: { type: String, required: true },
  plannedStart: { type: String, required: true },
  plannedEnd: { type: String, required: true },
  actualStart: { type: String },
  actualEnd: { type: String },
  category: { type: String, default: 'Other' },
  color: { type: String, default: '#6366f1' },
  notes: { type: String },
})

const planSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    blocks: [blockSchema],
  },
  { timestamps: true }
)

planSchema.index({ userId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('Plan', planSchema)
