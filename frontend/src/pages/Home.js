import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { browseVideos } from '../services/api'
import toast from 'react-hot-toast'
import './Home.css'

const Home = () => {
  const navigate = useNavigate()
  const { user, logout, isAdmin, getPlan } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await browseVideos()
      setVideos(res.data.videos || [])
    } catch (err) {
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.description?.toLowerCase().includes(search.toLowerCase())
  )

  const plan = getPlan()

  return (
    <div className="home">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="logo">🎬 StreamVault</div>
        <div className="nav-search">
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="nav-right">
          {isAdmin() && (
            <button onClick={() => navigate('/admin')} className="btn-admin">
              Admin
            </button>
          )}
          <span className={`plan-badge plan-${plan}`}>{plan.toUpperCase()}</span>
          <button onClick={() => navigate('/plans')} className="btn-upgrade">
            {plan === 'free' ? 'Upgrade' : 'Plans'}
          </button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="home-hero">
        <h1>Welcome back! 👋</h1>
        <p>Continue watching or discover something new</p>
      </div>

      {/* Videos Grid */}
      <div className="videos-section">
        <h2>
          {search ? `Results for "${search}"` : 'All Videos'}
          <span className="video-count">{filteredVideos.length} videos</span>
        </h2>

        {loading ? (
          <div className="videos-loading">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="video-skeleton" />
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="no-videos">
            <span>🎬</span>
            <p>No videos found</p>
          </div>
        ) : (
          <div className="videos-grid">
            {filteredVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                userPlan={plan}
                onClick={() => navigate(`/watch/${video.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Video Card Component
const VideoCard = ({ video, userPlan, onClick }) => {
  const tierLevel = { free: 0, basic: 1, premium: 2 }
  const canWatch = tierLevel[userPlan] >= tierLevel[video.required_plan || 'free']

  return (
    <div className={`video-card ${!canWatch ? 'locked' : ''}`} onClick={onClick}>
      <div className="video-thumbnail">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} />
        ) : (
          <div className="thumbnail-placeholder">🎬</div>
        )}
        {!canWatch && (
          <div className="locked-overlay">
            <span>🔒</span>
            <p>{video.required_plan?.toUpperCase()}</p>
          </div>
        )}
        <div className="video-duration">{video.duration || '00:00'}</div>
      </div>
      <div className="video-info">
        <h3>{video.title}</h3>
        <p>{video.description?.substring(0, 80)}...</p>
        <div className="video-meta">
          <span className={`tier-badge tier-${video.required_plan || 'free'}`}>
            {video.required_plan?.toUpperCase() || 'FREE'}
          </span>
          <span className="video-views">{video.views || 0} views</span>
        </div>
      </div>
    </div>
  )
}

export default Home