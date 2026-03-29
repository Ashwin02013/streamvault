import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth'
import { registerUser, confirmUser } from '../services/api'
import toast from 'react-hot-toast'
import './Auth.css'

const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp({
        username: form.email,
        password: form.password,
        options: { userAttributes: { email: form.email, name: form.username } }
      })

      await registerUser({ username: form.username, email: form.email })

      toast.success('Check your email for the verification code!')
      setStep(2)
    } catch (err) {
      toast.error(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await confirmSignUp({ username: form.email, confirmationCode: otp })

      await confirmUser({ email: form.email, code: otp })

      toast.success('Account verified! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🎬 StreamVault</div>

        {step === 1 ? (
          <>
            <h2>Create Account</h2>
            <p className="auth-subtitle">Start your free trial today.</p>

            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>

              <button type="submit" className="btn-primary btn-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>Verify Email</h2>
            <p className="auth-subtitle">Enter the 6-digit code sent to <strong>{form.email}</strong></p>

            <form onSubmit={handleConfirm} className="auth-form">
              <div className="form-group">
                <label>Verification Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  style={{ letterSpacing: '0.3rem', fontSize: '1.4rem', textAlign: 'center' }}
                />
              </div>

              <button type="submit" className="btn-primary btn-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <button
                type="button"
                className="btn-outline btn-full"
                style={{ marginTop: '10px' }}
                onClick={() => resendSignUpCode({ username: form.email }).then(() => toast.success('Code resent!'))}
              >
                Resend Code
              </button>
            </form>
          </>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  )
}

export default Register