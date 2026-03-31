const Streak = require("../models/Streak");
const TimeEntry = require("../models/TimeEntry");

const getTodayStr = () => new Date().toISOString().split("T")[0];
const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

const getStreaks = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStr = getTodayStr();
    const yesterdayStr = getYesterdayStr();

    // Get all categories from today's or recent entries
    const recentEntries = await TimeEntry.find({
      userId,
      date: { $gte: yesterdayStr },
    }).distinct("category");

    let streaks = await Streak.find({ userId });

    // Update streaks based on today's activity
    streaks = await Promise.all(
      streaks.map(async (streak) => {
        const hasActivityToday = await TimeEntry.findOne({
          userId,
          category: streak.category,
          date: todayStr,
          actualEnd: { $ne: null },
        });

        const lastDate = streak.lastActivityDate;

        if (hasActivityToday) {
          // Has activity today
          if (lastDate === todayStr) {
            // Already counted today, no change
          } else if (lastDate === yesterdayStr) {
            // Continuing streak
            streak.currentStreak += 1;
            streak.longestStreak = Math.max(
              streak.longestStreak,
              streak.currentStreak,
            );
          } else {
            // Streak broken, restart at 1
            streak.currentStreak = 1;
          }
          streak.lastActivityDate = todayStr;
        } else {
          // No activity today
          if (lastDate === yesterdayStr) {
            // Streak broken
            streak.currentStreak = 0;
          }
        }

        await streak.save();
        return streak;
      }),
    );

    // Create streaks for new categories if they don't exist
    for (const category of recentEntries) {
      const exists = streaks.find((s) => s.category === category);
      if (!exists) {
        const hasActivityToday = await TimeEntry.findOne({
          userId,
          category,
          date: todayStr,
          actualEnd: { $ne: null },
        });

        const newStreak = await Streak.create({
          userId,
          category,
          currentStreak: hasActivityToday ? 1 : 0,
          longestStreak: hasActivityToday ? 1 : 0,
          lastActivityDate: hasActivityToday ? todayStr : null,
          startDate: todayStr,
        });
        streaks.push(newStreak);
      }
    }

    res.json({ success: true, streaks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStreaks };
