const express = require('express')
const r = express.Router()
const {
  getWeeklyAnalytics,
  getHeatmap,
  getMonthlyAnalytics,
} = require('../controllers/analyticsController')
const { verifyToken } = require('../middleware/authMiddleware')

r.use(verifyToken)
r.get('/week', getWeeklyAnalytics)
r.get('/heatmap', getHeatmap)
r.get('/month', getMonthlyAnalytics)

module.exports = r
