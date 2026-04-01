const Journal = require('../models/Journal')

const normalizeDate = (date) => {
  return new Date(date).toISOString().split('T')[0]
}

const getJournalByDate = async (req, res) => {
  try {
    const date = normalizeDate(req.params.date)

    const journal = await Journal.findOne({
      userId: req.user.id,
      date,
    })

    res.json({ success: true, journal: journal || null })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const deleteJournal = async (req, res) => {
  try {
    const rawDate = req.params.date || req.body.date
    if (!rawDate)
      return res.status(400).json({ success: false, message: 'Date is required' })

    const date = normalizeDate(rawDate)

    const deleted = await Journal.findOneAndDelete({
      userId: req.user.id,
      date,
    })

    if (!deleted)
      return res.status(404).json({ success: false, message: 'Entry not found' })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const saveJournal = async (req, res) => {
  try {
    let { date, content = '', mood = 3, tags = [] } = req.body

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' })
    }

    date = normalizeDate(date)

    const journal = await Journal.findOneAndUpdate(
      { userId: req.user.id, date },
      { content, mood, tags },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    res.status(201).json({ success: true, journal })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getAllJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user.id }).sort({ date: -1 })
    res.json({ success: true, journals })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const searchJournals = async (req, res) => {
  try {
    const q = (req.query.q || '').trim()
    if (!q) {
      return res.json({ success: true, journals: [] })
    }

    const regex = new RegExp(q, 'i')
    const journals = await Journal.find({
      userId: req.user.id,
      $or: [{ content: regex }, { tags: regex }],
    }).sort({ date: -1 })

    res.json({ success: true, journals })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getJournalByDate, saveJournal, getAllJournals, searchJournals }
module.exports.deleteJournal = deleteJournal
