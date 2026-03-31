const express = require('express')
const r = express.Router()
const {
  startPomodoroSession,
  completeCycle,
  getTodayPomodoros,
} = require('../controllers/pomodoroController')
const { verifyToken } = require('../middleware/authMiddleware')

r.use(verifyToken)
r.post('/start', startPomodoroSession)
r.patch('/:id/complete', completeCycle)
r.get('/today', getTodayPomodoros)

module.exports = r
