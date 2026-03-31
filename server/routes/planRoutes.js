const express = require('express')
const r = express.Router()
const { getPlanByDate, addBlock, updateBlock, deleteBlock, getWeekPlans } = require('../controllers/planController')
const { verifyToken } = require('../middleware/authMiddleware')

r.use(verifyToken)
r.get('/week', getWeekPlans)
r.post('/block', addBlock)
r.put('/:planId/block/:blockId', updateBlock)
r.delete('/:planId/block/:blockId', deleteBlock)
r.get('/:date', getPlanByDate)

module.exports = r