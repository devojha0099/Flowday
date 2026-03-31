const express = require('express')
const r = express.Router()
const {
  getTodayEntries, getEntriesByDate,
  createManualEntry, startTimer, stopTimer, deleteEntry,
} = require('../controllers/entryController')
const { verifyToken } = require('../middleware/authMiddleware')

r.use(verifyToken)
r.get('/today', getTodayEntries)
r.post('/', createManualEntry)
r.post('/timer/start', startTimer)
r.patch('/timer/:id/stop', stopTimer)
r.delete('/:id', deleteEntry)
r.get('/:date', getEntriesByDate)

module.exports = r