const express = require('express')
const r = express.Router()
const { getGoals, createGoal, updateGoal, deleteGoal, getGoalProgress } = require('../controllers/goalController')
const { verifyToken } = require('../middleware/authMiddleware')

r.use(verifyToken)
r.get('/progress', getGoalProgress)
r.get('/', getGoals)
r.post('/', createGoal)
r.put('/:id', updateGoal)
r.delete('/:id', deleteGoal)

module.exports = r