const Goal = require('../models/Goal')
const TimeEntry = require('../models/TimeEntry')

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id, isActive: true })
    res.json({ success: true, goals })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.user.id })
    res.status(201).json({ success: true, goal })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    )
    res.json({ success: true, goal })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const deleteGoal = async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getGoalProgress = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id, isActive: true })

    // Get the current week's start (Monday)
    const now = new Date()
    const day = now.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    const startDate = monday.toISOString().split('T')[0]
    const endDate = now.toISOString().split('T')[0]

    const entries = await TimeEntry.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate },
      actualEnd: { $ne: null },
    })

    // Group actual minutes by category
    const categoryMins = {}
    entries.forEach(e => {
      if (!categoryMins[e.category]) categoryMins[e.category] = 0
      categoryMins[e.category] += e.actualMins || 0
    })

    const progress = goals.map(goal => {
      const actualMins = categoryMins[goal.category] || 0
      const actualHours = Math.round((actualMins / 60) * 10) / 10
      const completionPct = Math.round((actualHours / goal.targetHours) * 100)
      return {
        ...goal.toObject(),
        actualHours,
        completionPct: Math.min(completionPct, 100),
      }
    })

    res.json({ success: true, progress })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getGoals, createGoal, updateGoal, deleteGoal, getGoalProgress }