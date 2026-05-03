import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { browseVideos, getWatchHistory } from '../services/api'
import API from '../services/api'
import toast from 'react-hot-toast'
import './Home.css'

const Home = () => {
  const navigate = useNavigate()
  const { logout, isAdmin, getPlan } = useAuth()
  const [videos, setVideos] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchVideos()
    fetchHistory()
  }, [])

  const detectDurations = (videosList) => {
    videosList.forEach(video => {
      if ((!video.duration || video.duration === '00:00') && video.video_url) {
        const vid = document.createElement('video')
        vid.src = video.video_url
        vid.onloadedmetadata = async () => {
          const mins = Math.floor(vid.duration / 60)
          const secs = Math.floor(vid.duration % 60)
          const durationStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
          try {
            await API.put(`/videos/${video.id}/duration`, { duration: durationStr })
            setVideos(prev => prev.map(v =>
              v.id === video.id ? { ...v, duration: durationStr } : v
            ))
          } catch (err) {}
        }
      }
    })
  }

  const fetchVideos = async () => {
    try {
      const res = await browseVideos()
      const videosList = res.data.videos || []
      setVideos(videosList)
      detectDurations(videosList)
    } catch (err) {
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await getWatchHistory()
      setHistory(res.data.history || [])
    } catch (err) {}
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
        <div className="nav-top-row">
          <div className="logo">🎬 StreamVault</div>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <div className="nav-search">
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={`nav-right ${menuOpen ? 'open' : ''}`}>
          {isAdmin() && (
            <button onClick={() => { navigate('/admin'); setMenuOpen(false) }} className="btn-admin">
              Admin
            </button>
          )}
          <span className={`plan-badge plan-${plan}`}>{plan.toUpperCase()}</span>
          <button onClick={() => { navigate('/plans'); setMenuOpen(false) }} className="btn-upgrade">
            {plan === 'free' ? 'Upgrade' : 'Plans'}
          </button>
          <button onClick={() => { navigate('/profile'); setMenuOpen(false) }} className="btn-logout">
            Profile
          </button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="home-hero">
        <h1>Welcome back! 👋</h1>
        <p>Continue watching or discover something new</p>
      </div>

      {/* Watch History Section */}
      {!search && history.length > 0 && (
        <div className="videos-section">
          <h2>
            Continue Watching
            <span className="video-count">{history.length} videos</span>
          </h2>
          <div className="videos-grid">
            {history.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                userPlan={plan}
                onClick={() => navigate(`/watch/${video.id}`)}
                showWatchedTime={true}
              />
            ))}
          </div>
        </div>
      )}

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

const VideoCard = ({ video, userPlan, onClick, showWatchedTime }) => {
  const tierLevel = { free: 0, basic: 1, premium: 2 }
  const canWatch = tierLevel[userPlan] >= tierLevel[video.required_plan || 'free']

  const formatWatchedTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000 / 60)
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

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
        <div className="video-duration">{video.duration || '--:--'}</div>
      </div>
      <div className="video-info" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3>{video.title}</h3>
        <p style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.8em'
        }}>{video.description || ''}</p>
        <div className="video-meta" style={{ marginTop: 'auto' }}>
          <span className={`tier-badge tier-${video.required_plan || 'free'}`}>
            {video.required_plan?.toUpperCase() || 'FREE'}
          </span>
          {showWatchedTime && video.watched_at ? (
            <span className="video-views">Watched {formatWatchedTime(video.watched_at)}</span>
          ) : (
            <span className="video-views">{video.views || 0} views</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home