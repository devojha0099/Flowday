const Plan = require('../models/Plan')

// @route GET /api/plans/:date
// @desc Get or create plan for a specific date
const getPlanByDate = async (req, res) => {
  try {
    const { date } = req.params
    const userId = req.user._id

    let plan = await Plan.findOne({ userId, date })

    // If no plan exists, create one
    if (!plan) {
      plan = await Plan.create({ userId, date, blocks: [] })
    }

    res.json({ success: true, plan })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route POST /api/plans/block
// @desc Add a block to today's plan
const addBlock = async (req, res) => {
  try {
    const { date, title, plannedStart, plannedEnd, category, color } = req.body
    const userId = req.user._id

    console.log('Add block request:', { date, title, plannedStart, plannedEnd, category, color, userId })

    // Find or create plan
    let plan = await Plan.findOne({ userId, date })
    if (!plan) {
      plan = await Plan.create({ userId, date, blocks: [] })
    }

    // Add block
    plan.blocks.push({ title, plannedStart, plannedEnd, category, color })
    await plan.save()

    console.log('Block added successfully:', plan)
    res.json({ success: true, plan })
  } catch (error) {
    console.error('Add block error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route PUT /api/plans/:planId/block/:blockId
// @desc Update a block
const updateBlock = async (req, res) => {
  try {
    const { planId, blockId } = req.params
    const { title, plannedStart, plannedEnd, category, color, actualStart, actualEnd, notes } = req.body

    const plan = await Plan.findById(planId)
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' })
    }

    const block = plan.blocks.id(blockId)
    if (!block) {
      return res.status(404).json({ success: false, message: 'Block not found' })
    }

    // Update block fields
    if (title) block.title = title
    if (plannedStart) block.plannedStart = plannedStart
    if (plannedEnd) block.plannedEnd = plannedEnd
    if (category) block.category = category
    if (color) block.color = color
    if (actualStart) block.actualStart = actualStart
    if (actualEnd) block.actualEnd = actualEnd
    if (notes) block.notes = notes

    await plan.save()
    res.json({ success: true, plan })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route DELETE /api/plans/:planId/block/:blockId
// @desc Delete a block from plan
const deleteBlock = async (req, res) => {
  try {
    const { planId, blockId } = req.params

    const plan = await Plan.findById(planId)
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' })
    }

    // Remove block
    plan.blocks = plan.blocks.filter((b) => b._id.toString() !== blockId)
    await plan.save()

    res.json({ success: true, plan })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route GET /api/plans/week
// @desc Get all plans for a date range (week/month)
const getWeekPlans = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const userId = req.user._id

    const plans = await Plan.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })

    res.json({ success: true, plans })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getPlanByDate, addBlock, updateBlock, deleteBlock, getWeekPlans }
