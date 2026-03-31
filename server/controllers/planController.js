const DayPlan = require('../models/DayPlan')

const getPlanByDate = async (req, res) => {
  try {
    const { date } = req.params
    let plan = await DayPlan.findOne({ userId: req.user.id, date })
    if (!plan) {
      plan = await DayPlan.create({ userId: req.user.id, date, blocks: [] })
    }
    res.json({ success: true, plan })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getWeekPlans = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const plans = await DayPlan.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate },
    })
    res.json({ success: true, plans })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const addBlock = async (req, res) => {
  try {
    const { date, title, plannedStart, plannedEnd, category, color } = req.body

    // Calculate estimatedMins from time strings
    const [sh, sm] = plannedStart.split(':').map(Number)
    const [eh, em] = plannedEnd.split(':').map(Number)
    const estimatedMins = (eh * 60 + em) - (sh * 60 + sm)

    let plan = await DayPlan.findOne({ userId: req.user.id, date })
    if (!plan) {
      plan = await DayPlan.create({ userId: req.user.id, date, blocks: [] })
    }

    plan.blocks.push({ title, plannedStart, plannedEnd, category, color, estimatedMins })
    await plan.save()

    res.json({ success: true, plan })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const updateBlock = async (req, res) => {
  try {
    const { planId, blockId } = req.params
    const plan = await DayPlan.findOne({ _id: planId, userId: req.user.id })
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' })

    const block = plan.blocks.id(blockId)
    if (!block) return res.status(404).json({ success: false, message: 'Block not found' })

    Object.assign(block, req.body)
    await plan.save()
    res.json({ success: true, plan })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const deleteBlock = async (req, res) => {
  try {
    const { planId, blockId } = req.params
    const plan = await DayPlan.findOne({ _id: planId, userId: req.user.id })
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' })

    plan.blocks.pull({ _id: blockId })
    await plan.save()
    res.json({ success: true, plan })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getPlanByDate, getWeekPlans, addBlock, updateBlock, deleteBlock }