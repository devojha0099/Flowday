const express = require('express')
const r = express.Router()
const {
  getJournalByDate,
  saveJournal,
  getAllJournals,
  searchJournals,
  deleteJournal,
} = require('../controllers/journalController')
const { verifyToken } = require('../middleware/authMiddleware')

r.use(verifyToken)
r.get('/all', getAllJournals)
r.get('/search', searchJournals)
r.post('/delete', deleteJournal)
r.delete('/:date', deleteJournal)
r.get('/:date', getJournalByDate)
r.post('/', saveJournal)

module.exports = r
