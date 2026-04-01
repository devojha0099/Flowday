const TimeEntry = require('../models/TimeEntry')
const DayPlan = require('../models/DayPlan')
const DailyScore = require('../models/DailyScore')

// Helper — compute and save daily score
const computeAndSaveScore = async (userId, date) => {
  try {
    const plan = await DayPlan.findOne({ userId, date })
    const entries = await TimeEntry.find({ userId, date, actualEnd: { $ne: null } })

    const plannedMins = plan ? plan.blocks.reduce((s, b) => {
      const [sh, sm] = b.plannedStart.split(':').map(Number)
      const [eh, em] = b.plannedEnd.split(':').map(Number)
      return s + ((eh * 60 + em) - (sh * 60 + sm))
    }, 0) : 0

    const actualMins = entries.reduce((s, e) => s + (e.actualMins || 0), 0)

    const matchedBlocks = plan ? plan.blocks.filter(b =>
      entries.some(e => String(e.plannedBlockId) === String(b._id))
    ).length : 0

    const totalPlanned = plan?.blocks?.length || 0
    const adherenceScore = totalPlanned > 0 ? Math.round((matchedBlocks / totalPlanned) * 100) : 0

    const driftValues = entries.filter(e => e.driftMinutes).map(e => e.driftMinutes)
    const avgDrift = driftValues.length
      ? driftValues.reduce((a, b) => a + b, 0) / driftValues.length
      : 0
    const punctualityScore = Math.round(100 - Math.min(Math.abs(avgDrift) / 2, 50))

    const focusScore = 80 // placeholder until pomodoro is wired

    const overallScore = Math.round(
      adherenceScore * 0.4 + punctualityScore * 0.4 + focusScore * 0.2
    )

    await DailyScore.findOneAndUpdate(
      { userId, date },
      { adherenceScore, punctualityScore, focusScore, overallScore, plannedMins, actualMins },
      { upsert: true, new: true }
    )
  } catch (err) {
    console.error('Score compute error:', err.message)
  }
}

const getTodayEntries = async (req, res) => {
  try {
    const today = req.query.date || new Date().toISOString().split('T')[0]
    const entries = await TimeEntry.find({ userId: req.user.id, date: today })
      .sort({ actualStart: 1 })
    res.json({ success: true, entries })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getEntriesByDate = async (req, res) => {
  try {
    const entries = await TimeEntry.find({ userId: req.user.id, date: req.params.date })
      .sort({ actualStart: 1 })
    res.json({ success: true, entries })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const createManualEntry = async (req, res) => {
  try {
    const { title, category, date, actualStart, actualEnd, plannedBlockId, dayPlanId, isUnplanned, notes } = req.body

    const start = new Date(actualStart)
    const end = new Date(actualEnd)
    const actualMins = Math.round((end - start) / 60000)

    // Calculate drift if linked to a block
    let driftMinutes = 0
    if (plannedBlockId && dayPlanId) {
      const plan = await DayPlan.findById(dayPlanId)
      const block = plan?.blocks?.id(plannedBlockId)
      if (block) {
        const [ph, pm] = block.plannedStart.split(':').map(Number)
        const plannedStartMins = ph * 60 + pm
        const actualStartMins = start.getHours() * 60 + start.getMinutes()
        driftMinutes = actualStartMins - plannedStartMins
      }
    }

    const entry = await TimeEntry.create({
      userId: req.user.id, title, category, date,
      actualStart: start, actualEnd: end, actualMins,
      plannedBlockId: plannedBlockId || null,
      dayPlanId: dayPlanId || null,
      driftMinutes, isUnplanned: isUnplanned || false, notes,
    })

    await computeAndSaveScore(req.user.id, date)
    res.status(201).json({ success: true, entry })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const startTimer = async (req, res) => {
  try {
    const { title, category, date, plannedBlockId, dayPlanId, isUnplanned } = req.body

    const entry = await TimeEntry.create({
      userId: req.user.id, title, category, date,
      actualStart: new Date(),
      plannedBlockId: plannedBlockId || null,
      dayPlanId: dayPlanId || null,
      isUnplanned: isUnplanned || false,
    })

    res.status(201).json({ success: true, entry })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const stopTimer = async (req, res) => {
  try {
    const entry = await TimeEntry.findOne({ _id: req.params.id, userId: req.user.id })
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' })

    const end = new Date()
    entry.actualEnd = end
    entry.actualMins = Math.round((end - entry.actualStart) / 60000)

    // Calculate drift
    if (entry.plannedBlockId && entry.dayPlanId) {
      const plan = await DayPlan.findById(entry.dayPlanId)
      const block = plan?.blocks?.id(entry.plannedBlockId)
      if (block) {
        const [ph, pm] = block.plannedStart.split(':').map(Number)
        const plannedStartMins = ph * 60 + pm
        const actualStartMins = entry.actualStart.getHours() * 60 + entry.actualStart.getMinutes()
        entry.driftMinutes = actualStartMins - plannedStartMins
      }
    }

    await entry.save()
    await computeAndSaveScore(req.user.id, entry.date)
    res.json({ success: true, entry })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const deleteEntry = async (req, res) => {
  try {
    await TimeEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getTodayEntries, getEntriesByDate, createManualEntry, startTimer, stopTimer, deleteEntry }
