import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { register, clearError } from '../../features/auth/authSlice'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isLoading, error } = useSelector((state) => state.auth)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  useEffect(() => { if (user) navigate('/dashboard') }, [user, navigate])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(clearError())
    dispatch(register(form))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Create account</h1>
        <p className="text-gray-500 text-sm mb-6">Start tracking your day with FlowDay</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'email', 'password'].map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field}</label>
              <input type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                name={field} value={form[field]} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={field === 'name' ? 'Your name' : field === 'email' ? 'you@email.com' : 'Min 6 characters'} />
            </div>
          ))}
          <button type="submit" disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register