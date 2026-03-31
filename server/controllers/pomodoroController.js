const PomodoroSession = require('../models/PomodoroSession')

const getTodayString = () => new Date().toISOString().split('T')[0]

const startPomodoroSession = async (req, res) => {
  try {
    const { workMins = 25, breakMins = 5, targetCycles = 4, label = '' } = req.body || {}

    const session = await PomodoroSession.create({
      userId: req.user.id,
      date: getTodayString(),
      workMins,
      breakMins,
      targetCycles,
      label,
      cyclesCompleted: 0,
      isActive: true,
      startedAt: new Date(),
    })

    res.status(201).json({ success: true, session })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const completeCycle = async (req, res) => {
  try {
    const session = await PomodoroSession.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' })
    }

    session.cyclesCompleted += 1
    session.lastCompletedAt = new Date()

    if (session.targetCycles && session.cyclesCompleted >= session.targetCycles) {
      session.isActive = false
      session.completedAt = new Date()
    }

    await session.save()

    res.json({ success: true, session })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getTodayPomodoros = async (req, res) => {
  try {
    const today = getTodayString()
    const sessions = await PomodoroSession.find({ userId: req.user.id, date: today }).sort({ createdAt: -1 })

    const totalCycles = sessions.reduce((sum, s) => sum + (s.cyclesCompleted || 0), 0)
    const totalMins = sessions.reduce((sum, s) => {
      const mins = (s.cyclesCompleted || 0) * (s.workMins || 25)
      return sum + mins
    }, 0)

    res.json({ sessions, totalCycles, totalMins })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { startPomodoroSession, completeCycle, getTodayPomodoros }
