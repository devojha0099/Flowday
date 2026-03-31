const express = require('express')
const r = express.Router()
const { getPlanByDate, addBlock, updateBlock, deleteBlock, getWeekPlans } = require('../controllers/planController')
const { verifyToken } = require('../middleware/authMiddleware')

r.use(verifyToken)
r.get('/week', getWeekPlans)          // specific routes FIRST
r.post('/block', addBlock)            // then actions
r.put('/:planId/block/:blockId', updateBlock)
r.delete('/:planId/block/:blockId', deleteBlock)
r.get('/:date', getPlanByDate)        // wildcard LAST

module.exports = r