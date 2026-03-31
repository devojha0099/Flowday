const User = require('../models/User')
const jwt = require('jsonwebtoken')

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      isPublic: user.isPublic,
      profileSlug: user.profileSlug,
      createdAt: user.createdAt,
    },
  })
}

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' })
    const user = await User.create({ name, email, password })
    sendTokenResponse(user, 201, res)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' })
    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' })
    const isMatch = await user.matchPassword(password)
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' })
    sendTokenResponse(user, 200, res)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const logout = (req, res) => {
  res.cookie('token', '', { maxAge: 1 }).json({ success: true, message: 'Logged out' })
}

const getMe = async (req, res) => {
  const user = await User.findById(req.user.id)
  res.json({ success: true, user })
}

const updateSettings = async (req, res) => {
  try {
    const { name, timezone, isPublic } = req.body

    const updates = {}
    if (typeof name === 'string' && name.trim()) updates.name = name.trim()
    if (typeof timezone === 'string' && timezone.trim()) updates.timezone = timezone.trim()
    if (typeof isPublic === 'boolean') updates.isPublic = isPublic

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    Object.assign(user, updates)
    await user.save()

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { register, login, logout, getMe, updateSettings }
