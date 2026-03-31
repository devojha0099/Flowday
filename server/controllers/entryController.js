const Entry = require('../models/Entry')

// @route GET /api/entries/today
// @desc Get today's entries
const getTodayEntries = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const userId = req.user._id

    const entries = await Entry.find({ userId, date: today }).sort({ actualStart: 1 })
    res.json({ success: true, entries })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route GET /api/entries/:date
// @desc Get entries for a specific date
const getEntriesByDate = async (req, res) => {
  try {
    const { date } = req.params
    const userId = req.user._id

    const entries = await Entry.find({ userId, date }).sort({ actualStart: 1 })
    res.json({ success: true, entries })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route POST /api/entries
// @desc Create a manual entry
const createManualEntry = async (req, res) => {
  try {
    const { date, title, category, actualStart, actualEnd } = req.body
    const userId = req.user._id

    const entry = await Entry.create({
      userId,
      date,
      title,
      category,
      actualStart,
      actualEnd,
    })

    res.status(201).json({ success: true, entry })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route POST /api/entries/timer/start
// @desc Start a timer (create entry without actualEnd)
const startTimer = async (req, res) => {
  try {
    const { date, title, category, plannedBlockId, dayPlanId, isUnplanned } = req.body
    const userId = req.user._id

    console.log('Start timer request:', { date, title, category, plannedBlockId, dayPlanId, isUnplanned, userId })

    const entry = await Entry.create({
      userId,
      date,
      title,
      category,
      plannedBlockId,
      dayPlanId,
      isUnplanned,
      actualStart: new Date(),
    })

    console.log('Entry created:', entry)
    res.status(201).json({ success: true, entry })
  } catch (error) {
    console.error('Start timer error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route PATCH /api/entries/timer/:id/stop
// @desc Stop timer and add actualEnd + calculate drift
const stopTimer = async (req, res) => {
  try {
    const { id } = req.params

    const entry = await Entry.findById(id)
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' })
    }

    entry.actualEnd = new Date()
    await entry.save()

    res.json({ success: true, entry })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route DELETE /api/entries/:id
// @desc Delete an entry
const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params

    await Entry.findByIdAndDelete(id)
    res.json({ success: true, message: 'Entry deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getTodayEntries, getEntriesByDate, createManualEntry, startTimer, stopTimer, deleteEntry }
