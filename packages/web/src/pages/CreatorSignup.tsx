import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function CreatorSignup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(email, password, fullName, phone || undefined)
      navigate('/creator/dashboard')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center font-bold text-white text-xl mx-auto mb-4">C</div>
          <h1 className="text-3xl font-bold">Become a Creator</h1>
          <p className="text-dark-300 mt-2">Create your Camvo account and start taking bookings</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-dark-200 mb-2">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" placeholder="Your name (used for your public page)" required />
          </div>
          <div>
            <label className="block text-sm text-dark-200 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm text-dark-200 mb-2">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+1234567890" />
          </div>
          <div>
            <label className="block text-sm text-dark-200 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="At least 6 characters" minLength={6} required />
          </div>
          <div className="bg-dark-700 rounded-xl p-4 text-sm text-dark-200">
            <p>After signing up, you'll get a custom link like <span className="text-primary font-semibold">camvo.online/c/your-name</span> to share with clients.</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Creator Account'}
          </button>
        </form>

        <p className="text-center text-dark-300 mt-8 text-sm">
          Already a creator?{' '}
          <Link to="/creator/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}