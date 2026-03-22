
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVideo } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import './VideoPlayer.css'

const VideoPlayer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPlan } = useAuth()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    fetchVideo()
  }, [id])

  const fetchVideo = async () => {
    try {
      const res = await getVideo(id)
      setVideo(res.data.video)
    } catch (err) {
      if (err.response?.status === 403) {
        setLocked(true)
      } else {
        toast.error('Failed to load video')
        navigate('/home')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="player-loading">Loading...</div>

  if (locked) return (
    <div className="player-locked">
      <div className="locked-card">
        <span>🔒</span>
        <h2>Premium Content</h2>
        <p>Upgrade your plan to watch this video</p>
        <button onClick={() => navigate('/plans')} className="btn-primary">View Plans</button>
        <button onClick={() => navigate('/home')} className="btn-back">Go Back</button>
      </div>
    </div>
  )

  return (
    <div className="player-page">
      {/* Back button */}
      <button onClick={() => navigate('/home')} className="back-btn">
        ← Back to Browse
      </button>

      {/* Video Player */}
      <div className="player-container">
        {video?.video_url ? (
          <video
            controls
            autoPlay
            className="video-element"
            src={video.video_url}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="no-video-placeholder">
            <span>🎬</span>
            <p>Video not available</p>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="video-details">
        <div className="video-header">
          <h1>{video?.title}</h1>
          <span className={`tier-badge tier-${video?.required_plan || 'free'}`}>
            {video?.required_plan?.toUpperCase() || 'FREE'}
          </span>
        </div>
        <p className="video-desc">{video?.description}</p>
        <div className="video-stats">
          <span>👁 {video?.views || 0} views</span>
          <span>⏱ {video?.duration || 'Unknown duration'}</span>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer