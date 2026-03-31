const express = require('express')
const router = express.Router()
const { getTodayEntries, getEntriesByDate, createManualEntry, startTimer, stopTimer, deleteEntry } = require('../controllers/entryController')
const { verifyToken } = require('../middleware/authMiddleware')

router.use(verifyToken)

router.get('/today', getTodayEntries)
router.post('/timer/start', startTimer)
router.patch('/timer/:id/stop', stopTimer)
router.post('/', createManualEntry)
router.get('/:date', getEntriesByDate)
router.delete('/:id', deleteEntry)

module.exports = router
