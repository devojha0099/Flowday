const mongoose = require("mongoose");

const streakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String, required: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: String, default: null },
    startDate: { type: String, required: true },
    icon: { type: String, default: "🔥" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Streak", streakSchema);
