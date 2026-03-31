const mongoose = require('mongoose')

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    targetHours: { type: Number, required: true },
    period: { type: String, default: 'weekly', enum: ['weekly', 'monthly'] },
    color: { type: String, default: '#6366f1' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Goal', goalSchema)