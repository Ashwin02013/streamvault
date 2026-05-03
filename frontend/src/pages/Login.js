import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, forgotPassword, resetPassword, forgotAccount } from '../services/api'
import toast from 'react-hot-toast'
import './Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState('login')
  const [form, setForm] = useState({ username: '', password: '' })
  const [forgotEmail, setForgotEmail] = useState('')
  const [foundUsername, setFoundUsername] = useState('')
  const [resetForm, setResetForm] = useState({ code: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleResetChange = (e) => {
    setResetForm({ ...resetForm, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await loginUser({ username: form.username, password: form.password })
      localStorage.setItem('token', data.idToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('refreshToken', data.refreshToken)
      toast.success('Welcome back!')
      navigate('/home')
      window.location.reload()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword({ username: forgotEmail })
      toast.success('Reset code sent to your email!')
      setStep('reset')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await resetPassword({
        username: forgotEmail,
        code: resetForm.code,
        newPassword: resetForm.newPassword
      })
      toast.success('Password reset! Please sign in.')
      setStep('login')
      setResetForm({ code: '', newPassword: '', confirmPassword: '' })
      setForgotEmail('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotAccount = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await forgotAccount({ email: forgotEmail })
      setFoundUsername(data.username)
    } catch (err) {
      toast.error(err.response?.data?.error || 'No account found with this email.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'forgot') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">🎬 StreamVault</div>
          <h2>Forgot Password</h2>
          <p className="auth-subtitle">Enter your email and we'll send a reset code.</p>
          <form onSubmit={handleForgotPassword} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
          <p className="auth-switch">
            <span onClick={() => setStep('login')} style={{ cursor: 'pointer', color: '#e50914' }}>← Back to Sign In</span>
          </p>
        </div>
      </div>
    )
  }

  if (step === 'reset') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">🎬 StreamVault</div>
          <h2>Reset Password</h2>
          <p className="auth-subtitle">Enter the code sent to <strong>{forgotEmail}</strong></p>
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                name="code"
                placeholder="Enter 6-digit code"
                value={resetForm.code}
                onChange={handleResetChange}
                required
                maxLength={6}
                style={{ letterSpacing: '0.3rem', fontSize: '1.2rem', textAlign: 'center' }}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="At least 8 characters"
                value={resetForm.newPassword}
                onChange={handleResetChange}
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={resetForm.confirmPassword}
                onChange={handleResetChange}
                required
                minLength={8}
              />
            </div>
            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p className="auth-switch">
            <span onClick={() => setStep('forgot')} style={{ cursor: 'pointer', color: '#e50914' }}>← Back</span>
          </p>
        </div>
      </div>
    )
  }

  if (step === 'account') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">🎬 StreamVault</div>
          <h2>Find Your Account</h2>
          <p className="auth-subtitle">Enter your email to find your username.</p>
          <form onSubmit={handleForgotAccount} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Searching...' : 'Find Account'}
            </button>
          </form>
          {foundUsername && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#1a1a2e',
              borderRadius: '8px',
              border: '1px solid #e50914',
              textAlign: 'center'
            }}>
              <p style={{ color: '#aaa', marginBottom: '8px' }}>Your username is:</p>
              <p style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold' }}>{foundUsername}</p>
              <button
                className="btn-primary btn-full"
                style={{ marginTop: '12px' }}
                onClick={() => {
                  setForm({ ...form, username: foundUsername })
                  setStep('login')
                  setFoundUsername('')
                  setForgotEmail('')
                }}
              >
                Login with this account
              </button>
            </div>
          )}
          <p className="auth-switch">
            <span onClick={() => setStep('login')} style={{ cursor: 'pointer', color: '#e50914' }}>← Back to Sign In</span>
          </p>
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
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                style={{ paddingRight: '44px', width: '100%' }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  userSelect: 'none'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <span onClick={() => setStep('forgot')} style={{ cursor: 'pointer', color: '#e50914', fontSize: '0.9rem' }}>
              Forgot password?
            </span>
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
        <p className="auth-switch" style={{ marginTop: '8px' }}>
          <span onClick={() => setStep('account')} style={{ cursor: 'pointer', color: '#aaa', fontSize: '0.9rem' }}>
            Forgot your username?
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login