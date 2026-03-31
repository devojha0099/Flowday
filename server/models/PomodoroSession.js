const mongoose = require('mongoose')

const pomodoroSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    lastCompletedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    workMins: { type: Number, default: 25 },
    breakMins: { type: Number, default: 5 },
    targetCycles: { type: Number, default: 4 },
    cyclesCompleted: { type: Number, default: 0 },
    label: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('PomodoroSession', pomodoroSessionSchema)
