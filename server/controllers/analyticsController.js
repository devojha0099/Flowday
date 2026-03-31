const Entry = require("../models/Entry");
const Plan = require("../models/Plan");

// @route GET /api/analytics/week
const getWeeklySummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    // Get all entries and plans for the week
    const entries = await Entry.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const plans = await Plan.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Build day-by-day breakdown
    const dayMap = {};
    const categoryMap = {};

    // Process plans to get planned minutes per day
    plans.forEach((plan) => {
      if (!dayMap[plan.date]) {
        dayMap[plan.date] = { date: plan.date, plannedMins: 0, actualMins: 0, score: 0 };
      }
      plan.blocks.forEach((block) => {
        const [sh, sm] = block.plannedStart.split(':').map(Number);
        const [eh, em] = block.plannedEnd.split(':').map(Number);
        const blockMins = eh * 60 + em - (sh * 60 + sm);
        dayMap[plan.date].plannedMins += blockMins;
      });
    });

    // Process entries to get actual minutes per day and categories
    entries.forEach((entry) => {
      if (!dayMap[entry.date]) {
        dayMap[entry.date] = { date: entry.date, plannedMins: 0, actualMins: 0, score: 0 };
      }

      if (entry.actualEnd) {
        const diff = new Date(entry.actualEnd) - new Date(entry.actualStart);
        const mins = diff / (1000 * 60);
        dayMap[entry.date].actualMins += mins;

        // Track by category
        if (!categoryMap[entry.category]) {
          categoryMap[entry.category] = { name: entry.category, mins: 0 };
        }
        categoryMap[entry.category].mins += mins;
      }
    });

    // Calculate score for each day (% of planned time completed)
    Object.values(dayMap).forEach((day) => {
      if (day.plannedMins > 0) {
        day.score = Math.round((day.actualMins / day.plannedMins) * 100);
        day.score = Math.min(100, day.score); // Cap at 100%
      }
    });

    // Convert to arrays and sort
    const days = Object.values(dayMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    const categories = Object.values(categoryMap);

    res.json({ success: true, days, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/analytics/heatmap
const getHeatmap = async (req, res) => {
  try {
    const { year } = req.query;
    const userId = req.user._id;

    // Get all entries and plans for the year
    const entries = await Entry.find({
      userId,
      date: { $regex: `^${year}` },
    });

    const plans = await Plan.find({
      userId,
      date: { $regex: `^${year}` },
    });

    // Build heatmap: { date: score }
    const dayMap = {};

    // Process plans to get planned minutes per day
    plans.forEach((plan) => {
      if (!dayMap[plan.date]) {
        dayMap[plan.date] = { plannedMins: 0, actualMins: 0 };
      }
      plan.blocks.forEach((block) => {
        const [sh, sm] = block.plannedStart.split(':').map(Number);
        const [eh, em] = block.plannedEnd.split(':').map(Number);
        const blockMins = eh * 60 + em - (sh * 60 + sm);
        dayMap[plan.date].plannedMins += blockMins;
      });
    });

    // Process entries to get actual minutes per day
    entries.forEach((entry) => {
      if (!dayMap[entry.date]) {
        dayMap[entry.date] = { plannedMins: 0, actualMins: 0 };
      }

      if (entry.actualEnd) {
        const diff = new Date(entry.actualEnd) - new Date(entry.actualStart);
        const mins = diff / (1000 * 60);
        dayMap[entry.date].actualMins += mins;
      }
    });

    // Calculate score for each day (% of planned completed)
    const heatmap = {};
    Object.entries(dayMap).forEach(([date, data]) => {
      if (data.plannedMins > 0) {
        heatmap[date] = Math.min(100, Math.round((data.actualMins / data.plannedMins) * 100));
      } else if (data.actualMins > 0) {
        // If no plan but has entries, give partial score
        heatmap[date] = 50;
      }
    });

    res.json({ success: true, heatmap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/analytics/month
const getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user._id;

    const monthStr = String(month).padStart(2, "0");
    const monthRegex = `^${year}-${monthStr}`;

    const entries = await Entry.find({
      userId,
      date: { $regex: monthRegex },
    });

    const plans = await Plan.find({
      userId,
      date: { $regex: monthRegex },
    });

    // Build day-by-day scores
    const dayMap = {};
    const categoryMap = {};

    // Process plans to get planned minutes per day
    plans.forEach((plan) => {
      if (!dayMap[plan.date]) {
        dayMap[plan.date] = { date: plan.date, plannedMins: 0, actualMins: 0, overallScore: 0 };
      }
      plan.blocks.forEach((block) => {
        const [sh, sm] = block.plannedStart.split(':').map(Number);
        const [eh, em] = block.plannedEnd.split(':').map(Number);
        const blockMins = eh * 60 + em - (sh * 60 + sm);
        dayMap[plan.date].plannedMins += blockMins;
      });
    });

    // Process entries to get actual minutes per day and categories
    entries.forEach((entry) => {
      if (!dayMap[entry.date]) {
        dayMap[entry.date] = { date: entry.date, plannedMins: 0, actualMins: 0, overallScore: 0 };
      }

      if (entry.actualEnd) {
        const diff = new Date(entry.actualEnd) - new Date(entry.actualStart);
        const mins = diff / (1000 * 60);
        dayMap[entry.date].actualMins += mins;

        // Track by category
        if (!categoryMap[entry.category]) {
          categoryMap[entry.category] = { name: entry.category, mins: 0 };
        }
        categoryMap[entry.category].mins += mins;
      }
    });

    // Calculate overall score for each day
    Object.values(dayMap).forEach((day) => {
      if (day.plannedMins > 0) {
        day.overallScore = Math.round((day.actualMins / day.plannedMins) * 100);
        day.overallScore = Math.min(100, day.overallScore); // Cap at 100%
      }
    });

    // Convert to arrays and sort
    const scores = Object.values(dayMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    const categories = Object.values(categoryMap);

    // Calculate summary stats
    const totalActualMins = Object.values(dayMap).reduce((sum, d) => sum + d.actualMins, 0);
    const totalPlannedMins = Object.values(dayMap).reduce((sum, d) => sum + d.plannedMins, 0);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((sum, d) => sum + d.overallScore, 0) / scores.filter(d => d.overallScore > 0).length || 0)
      : 0;
    const bestDay = scores.length > 0
      ? scores.reduce((best, d) => d.overallScore > best.overallScore ? d : best)
      : null;

    res.json({
      success: true,
      scores,
      categories,
      avgScore,
      totalActualMins,
      totalPlannedMins,
      totalDays: scores.filter(d => d.overallScore > 0).length,
      bestDay,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWeeklySummary, getHeatmap, getMonthlySummary };
