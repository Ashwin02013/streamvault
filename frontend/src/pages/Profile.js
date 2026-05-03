import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile, updateMyProfile } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import './Auth.css'

const Profile = () => {
  const navigate = useNavigate()
  const { logout, getPlan } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ username: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const currentPlan = getPlan()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await getMyProfile()
      setProfile(data.user)
      setForm({ username: data.user.username || '', phone: data.user.phone || '' })
    } catch (err) {
      toast.error('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateMyProfile({ username: form.username, phone: form.phone })
      toast.success('Profile updated!')
      fetchProfile()
    } catch (err) {
      toast.error('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="auth-page" style={{ minHeight: '100vh', paddingTop: '40px' }}>
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-logo">🎬 StreamVault</div>
        <h2>My Profile</h2>

        <div style={{
          background: '#1a1a2e',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>Current Plan</p>
            <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>
              {currentPlan.toUpperCase()}
            </p>
          </div>
          <button
            onClick={() => navigate('/plans')}
            style={{
              background: '#e50914',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Upgrade
          </button>
        </div>

        <div style={{
          background: '#1a1a2e',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ color: '#aaa', fontSize: '0.85rem', margin: '0 0 4px 0' }}>Email</p>
            <p style={{ color: '#fff', margin: 0 }}>
              {showEmail ? profile?.email : '••••••••••••••••'}
            </p>
          </div>
          <span
            onClick={() => setShowEmail(!showEmail)}
            style={{ cursor: 'pointer', fontSize: '1.3rem' }}
            title={showEmail ? 'Hide email' : 'Show email'}
          >
            {showEmail ? '🙈' : '👁️'}
          </span>
        </div>

        <form onSubmit={handleSave} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="form-group">
            <label>Phone (optional)</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <button
          onClick={() => navigate('/home')}
          style={{
            width: '100%',
            marginTop: '10px',
            padding: '12px',
            background: 'transparent',
            border: '1px solid #444',
            color: '#aaa',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          ← Back to Home
        </button>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            marginTop: '10px',
            padding: '12px',
            background: 'transparent',
            border: '1px solid #e50914',
            color: '#e50914',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Profile