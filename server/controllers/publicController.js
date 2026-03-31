const User = require('../models/User')
const DailyScore = require('../models/DailyScore')
const Streak = require('../models/Streak')

const getWeekRange = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  const startDate = monday.toISOString().split('T')[0]
  const endDate = now.toISOString().split('T')[0]
  return { startDate, endDate }
}

const getLeaderboard = async (req, res) => {
  try {
    const publicUsers = await User.find({ isPublic: true }).select('name profileSlug')
    if (!publicUsers.length) {
      return res.json({ success: true, leaderboard: [] })
    }

    const { startDate, endDate } = getWeekRange()
    const userIds = publicUsers.map(u => u._id)

    const scores = await DailyScore.find({
      userId: { $in: userIds },
      date: { $gte: startDate, $lte: endDate },
    }).select('userId overallScore')

    const scoreMap = new Map()
    scores.forEach(s => {
      const key = String(s.userId)
      const entry = scoreMap.get(key) || { sum: 0, count: 0 }
      entry.sum += s.overallScore || 0
      entry.count += 1
      scoreMap.set(key, entry)
    })

    const userMap = new Map(publicUsers.map(u => [String(u._id), u]))
    const leaderboard = []

    scoreMap.forEach((val, userId) => {
      const user = userMap.get(userId)
      if (!user) return
      const avgScore = val.count ? Math.round(val.sum / val.count) : 0
      leaderboard.push({
        userId,
        name: user.name,
        profileSlug: user.profileSlug,
        avgScore,
        activeDays: val.count,
      })
    })

    leaderboard.sort((a, b) => {
      if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore
      return b.activeDays - a.activeDays
    })

    res.json({ success: true, leaderboard })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ profileSlug: req.params.slug, isPublic: true })
    if (!user) {
      return res.status(404).json({ success: false, message: 'Profile not found' })
    }

    const scores = await DailyScore.find({ userId: user._id }).select('overallScore date')
    const totalDays = scores.length
    const avgScore = totalDays
      ? Math.round(scores.reduce((s, d) => s + (d.overallScore || 0), 0) / totalDays)
      : 0

    const year = new Date().getFullYear()
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`
    const yearScores = scores.filter(s => s.date >= startDate && s.date <= endDate)

    const heatmap = {}
    yearScores.forEach(s => { heatmap[s.date] = s.overallScore || 0 })

    const streaks = await Streak.find({ userId: user._id })

    res.json({
      success: true,
      profile: {
        name: user.name,
        totalDays,
        avgScore,
        heatmap,
        streaks,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getLeaderboard, getPublicProfile }
