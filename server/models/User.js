const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'] },
    timezone: { type: String, default: 'Asia/Kolkata' },
    isPublic: { type: Boolean, default: false },
    profileSlug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
)

const makeSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', function (next) {
  if (!this.profileSlug && this.name) {
    const base = makeSlug(this.name)
    const suffix = String(this._id).slice(-6)
    this.profileSlug = `${base}-${suffix}`
  }
  next()
})

module.exports = mongoose.model('User', userSchema)
