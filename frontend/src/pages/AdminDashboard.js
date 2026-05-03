import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminStats, getAllUsers, updateUserPlan, deleteVideo } from '../services/api'
import API from '../services/api'
import toast from 'react-hot-toast'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [updatingUser, setUpdatingUser] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, videosRes] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        API.get('/videos/browse')
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data.users || [])
      setVideos(videosRes.data.videos || [])
    } catch (err) {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePlan = async (userId, newPlan) => {
    setUpdatingUser(userId)
    try {
      await updateUserPlan(userId, { plan: newPlan })
      toast.success(`Plan updated to ${newPlan}!`)
      fetchData()
    } catch (err) {
      toast.error('Failed to update plan')
    } finally {
      setUpdatingUser(null)
    }
  }

  const handleDeleteVideo = async (videoId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await deleteVideo(videoId)
      toast.success('Video deleted!')
      fetchData()
    } catch (err) {
      toast.error('Failed to delete video')
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
            <div className="stat-label">Paid Users</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['overview', 'users', 'videos'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 24px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === tab ? '#e50914' : '#1a1a2e',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'overview' ? '📊 Overview' : tab === 'users' ? '👥 Users' : '🎬 Videos'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="admin-section">
          <h2>Platform Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '10px' }}>
              <h3 style={{ color: '#aaa', marginBottom: '15px' }}>User Plans</h3>
              {['free', 'basic', 'premium'].map(plan => {
                const count = users.filter(u => u.plan === plan).length
                const pct = users.length ? Math.round((count / users.length) * 100) : 0
                return (
                  <div key={plan} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#fff', textTransform: 'capitalize' }}>{plan}</span>
                      <span style={{ color: '#aaa' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ background: '#333', borderRadius: '4px', height: '8px' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: '4px',
                        background: plan === 'premium' ? '#ffd700' : plan === 'basic' ? '#4a9eff' : '#aaa'
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '10px' }}>
              <h3 style={{ color: '#aaa', marginBottom: '15px' }}>Video Tiers</h3>
              {['free', 'basic', 'premium'].map(tier => {
                const count = videos.filter(v => (v.required_plan || 'free') === tier).length
                return (
                  <div key={tier} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #333' }}>
                    <span style={{ color: '#fff', textTransform: 'capitalize' }}>{tier}</span>
                    <span style={{ color: '#aaa' }}>{count} videos</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-section">
          <h2>All Users ({users.length})</h2>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`plan-badge plan-${user.plan}`}>
                        {user.plan?.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={user.plan}
                        disabled={updatingUser === user.id}
                        onChange={(e) => handleUpdatePlan(user.id, e.target.value)}
                        style={{
                          background: '#333',
                          color: '#fff',
                          border: '1px solid #555',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div className="admin-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2>All Videos ({videos.length})</h2>
            <button onClick={() => navigate('/admin/upload')} className="btn-upload">
              + Upload New
            </button>
          </div>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Tier</th>
                  <th>Duration</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map(video => (
                  <tr key={video.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} alt={video.title}
                            style={{ width: '50px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '50px', height: '30px', background: '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎬</div>
                        )}
                        {video.title}
                      </div>
                    </td>
                    <td>
                      <span className={`plan-badge plan-${video.required_plan || 'free'}`}>
                        {(video.required_plan || 'free').toUpperCase()}
                      </span>
                    </td>
                    <td>{video.duration || '--:--'}</td>
                    <td>{video.views || 0}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/watch/${video.id}`)}
                        style={{ background: '#333', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', marginRight: '5px' }}
                      >
                        ▶
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id, video.title)}
                        style={{ background: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer' }}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard