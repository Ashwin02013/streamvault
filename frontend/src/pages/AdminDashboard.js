import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminStats, getAllUsers } from '../services/api'
import toast from 'react-hot-toast'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        getAdminStats(),
        getAllUsers()
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data.users || [])
    } catch (err) {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="admin-loading">Loading dashboard...</div>

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>⚙️ Admin Dashboard</h1>
          <p>Manage your StreamVault platform</p>
        </div>
        <div className="admin-actions">
          <button onClick={() => navigate('/admin/upload')} className="btn-upload">
            + Upload Video
          </button>
          <button onClick={() => navigate('/home')} className="btn-back-home">
            ← Home
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎬</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalVideos || 0}</div>
            <div className="stat-label">Total Videos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalViews || 0}</div>
            <div className="stat-label">Total Views</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💎</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.premiumUsers || 0}</div>
            <div className="stat-label">Premium Users</div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-section">
        <h2>Recent Users</h2>
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 10).map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`plan-badge plan-${user.subscription_plan}`}>
                      {user.subscription_plan?.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard