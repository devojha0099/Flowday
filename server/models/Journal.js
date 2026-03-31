const mongoose = require('mongoose')

const journalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    content: { type: String, default: '' },
    mood: { type: Number, default: 3, min: 1, max: 5 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
)

journalSchema.index({ userId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('Journal', journalSchema)
