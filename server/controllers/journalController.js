const Journal = require('../models/Journal')

const getJournalByDate = async (req, res) => {
  try {
    const journal = await Journal.findOne({ userId: req.user.id, date: req.params.date })
    res.json({ success: true, journal: journal || null })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const saveJournal = async (req, res) => {
  try {
    const { date, content = '', mood = 3, tags = [] } = req.body

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' })
    }

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
