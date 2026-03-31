const mongoose = require('mongoose')

const dailyScoreSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    adherenceScore: { type: Number, default: 0 },
    punctualityScore: { type: Number, default: 0 },
    focusScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    plannedMins: { type: Number, default: 0 },
    actualMins: { type: Number, default: 0 },
  },
  { timestamps: true }
)

dailyScoreSchema.index({ userId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('DailyScore', dailyScoreSchema)