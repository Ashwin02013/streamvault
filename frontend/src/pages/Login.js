import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn, confirmSignIn, fetchAuthSession } from 'aws-amplify/auth'
import toast from 'react-hot-toast'
import './Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [newPassword, setNewPassword] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState('login')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn({ username: form.email, password: form.password })
      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setStep('newpassword')
        toast('Please set a new password to continue.', { icon: '🔐' })
      } else if (result.isSignedIn) {
        await handlePostLogin()
      }
    } catch (err) {
      toast.error(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleNewPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await confirmSignIn({
        challengeResponse: newPassword,
        options: { userAttributes: { name: name || form.email } }
      })
      await handlePostLogin()
    } catch (err) {
      toast.error(err.message || 'Failed to set new password.')
    } finally {
      setLoading(false)
    }
  }

  const handlePostLogin = async () => {
    const session = await fetchAuthSession({ forceRefresh: true })
    const idToken = session?.tokens?.idToken?.toString()
    if (idToken) {
      localStorage.setItem('token', idToken)
      toast.success('Welcome back!')
      navigate('/home')
      window.location.reload()
    } else {
      toast.error('Could not get token. Please try again.')
    }
  }

  if (step === 'newpassword') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">🎬 StreamVault</div>
          <h2>Set New Password</h2>
          <p className="auth-subtitle">You need to set a new password to continue.</p>
          <form onSubmit={handleNewPassword} className="auth-form">
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Min 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
            </div>
            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Setting password...' : 'Set New Password'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🎬 StreamVault</div>
        <h2>Sign In</h2>
        <p className="auth-subtitle">Welcome back! Please sign in to continue.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login