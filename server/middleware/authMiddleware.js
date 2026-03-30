const jwt = require('jsonwebtoken')
const User = require('../models/User')

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' })
  }
}

module.exports = { verifyToken }