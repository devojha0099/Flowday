const TimeEntry = require('../models/TimeEntry')
const DayPlan = require('../models/DayPlan')
const DailyScore = require('../models/DailyScore')

const getWeeklyAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const userId = req.user.id

    // Get all entries in range
    const entries = await TimeEntry.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
      actualEnd: { $ne: null },
    })

    // Get all plans in range
    const plans = await DayPlan.find({ userId, date: { $gte: startDate, $lte: endDate } })

    // Get scores
    const scores = await DailyScore.find({ userId, date: { $gte: startDate, $lte: endDate } })

    // Build day-by-day breakdown
    const dayMap = {}
    for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const plan = plans.find(p => p.date === dateStr)
      const dayEntries = entries.filter(e => e.date === dateStr)
      const score = scores.find(s => s.date === dateStr)

      const plannedMins = plan ? plan.blocks.reduce((sum, b) => {
        const [sh, sm] = b.plannedStart.split(':').map(Number)
        const [eh, em] = b.plannedEnd.split(':').map(Number)
        return sum + ((eh * 60 + em) - (sh * 60 + sm))
      }, 0) : 0

      dayMap[dateStr] = {
        date: dateStr,
        plannedMins,
        actualMins: dayEntries.reduce((s, e) => s + (e.actualMins || 0), 0),
        score: score?.overallScore || 0,
      }
    }

    // Category breakdown
    const categoryMap = {}
    entries.forEach(e => {
      if (!categoryMap[e.category]) categoryMap[e.category] = 0
      categoryMap[e.category] += e.actualMins || 0
    })
    const categories = Object.entries(categoryMap)
      .map(([name, mins]) => ({ name, mins }))
      .sort((a, b) => b.mins - a.mins)

    res.json({
      success: true,
      days: Object.values(dayMap),
      categories,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getHeatmap = async (req, res) => {
  try {
    const { year } = req.query
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    const scores = await DailyScore.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate },
    })

    const heatmap = {}
    scores.forEach(s => { heatmap[s.date] = s.overallScore })

    res.json({ success: true, heatmap })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getMonthlyAnalytics = async (req, res) => {
  try {
    const { month, year } = req.query
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

    const scores = await DailyScore.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 })

    const entries = await TimeEntry.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate },
      actualEnd: { $ne: null },
    })

    const totalActualMins = entries.reduce((s, e) => s + (e.actualMins || 0), 0)
    const avgScore = scores.length
      ? Math.round(scores.reduce((s, d) => s + d.overallScore, 0) / scores.length)
      : 0

    const bestDay = scores.length
      ? scores.reduce((best, d) => d.overallScore > best.overallScore ? d : best)
      : null

    res.json({
      success: true,
      avgScore,
      totalDays: scores.length,
      totalActualMins,
      bestDay,
      scores,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getWeeklyAnalytics, getHeatmap, getMonthlyAnalytics }