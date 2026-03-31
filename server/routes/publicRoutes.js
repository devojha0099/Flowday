const express = require('express')
const r = express.Router()
const { getLeaderboard, getPublicProfile } = require('../controllers/publicController')

r.get('/leaderboard', getLeaderboard)
r.get('/profile/:slug', getPublicProfile)

module.exports = r
