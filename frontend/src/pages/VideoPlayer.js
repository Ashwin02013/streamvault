import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVideo } from '../services/api'
import { useAuth } from '../context/AuthContext'
import API from '../services/api'
import toast from 'react-hot-toast'
import './VideoPlayer.css'

const VideoPlayer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)
  const [showThumbEditor, setShowThumbEditor] = useState(false)
  const [thumbPreview, setThumbPreview] = useState(null)
  const [savingThumb, setSavingThumb] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)
  const [captureTime, setCaptureTime] = useState(0)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

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

  const handleLoadedMetadata = async () => {
    const videoEl = videoRef.current
    if (!videoEl) return

    setVideoDuration(Math.floor(videoEl.duration))

    const duration = videoEl.duration
    if (duration && video) {
      const mins = Math.floor(duration / 60)
      const secs = Math.floor(duration % 60)
      const durationStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      try {
        await API.put(`/videos/${id}/duration`, { duration: durationStr })
      } catch (err) {}
    }

    const savedTime = localStorage.getItem(`video_progress_${id}`)
    if (savedTime && parseFloat(savedTime) > 0) {
      videoEl.currentTime = parseFloat(savedTime)
      toast(`Resuming from ${Math.floor(savedTime / 60)}:${String(Math.floor(savedTime % 60)).padStart(2, '0')}`, { icon: '▶️' })
    }
  }

  const handleTimeUpdate = () => {
    const videoEl = videoRef.current
    if (videoEl) {
      localStorage.setItem(`video_progress_${id}`, videoEl.currentTime)
    }
  }

  const handleEnded = () => {
    localStorage.removeItem(`video_progress_${id}`)
  }

  const captureFrame = (time) => {
    const videoEl = videoRef.current
    const canvas = canvasRef.current
    if (!videoEl || !canvas) return

    videoEl.currentTime = time
    videoEl.onseeked = () => {
      canvas.width = videoEl.videoWidth
      canvas.height = videoEl.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setThumbPreview(dataUrl)
    }
  }

  const handleCaptureTimeChange = (e) => {
    const time = parseInt(e.target.value)
    setCaptureTime(time)
    captureFrame(time)
  }

  const handleThumbUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setThumbPreview(url)
  }

  const handleSaveThumbnail = async () => {
    if (!thumbPreview) return toast.error('No thumbnail to save')
    setSavingThumb(true)
    try {
      const canvas = canvasRef.current
      if (canvas && canvas.width > 0) {
        canvas.toBlob(async (blob) => {
          const formData = new FormData()
          formData.append('thumbnail', new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }))
          await API.put(`/videos/${id}/thumbnail`, formData)
          toast.success('Thumbnail updated!')
          setShowThumbEditor(false)
          fetchVideo()
        }, 'image/jpeg', 0.8)
      } else {
        // Uploaded image
        const input = document.getElementById('adminThumbInput')
        if (input?.files[0]) {
          const formData = new FormData()
          formData.append('thumbnail', input.files[0])
          await API.put(`/videos/${id}/thumbnail`, formData)
          toast.success('Thumbnail updated!')
          setShowThumbEditor(false)
          fetchVideo()
        }
      }
    } catch (err) {
      toast.error('Failed to save thumbnail')
    } finally {
      setSavingThumb(false)
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
      <button onClick={() => navigate('/home')} className="back-btn">
        ← Back to Browse
      </button>

      <div className="player-container">
        {video?.video_url ? (
          <video
            ref={videoRef}
            controls
            autoPlay
            className="video-element"
            src={video.video_url}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
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

      <canvas ref={canvasRef} style={{ display: 'none' }} />

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

        {/* Admin Thumbnail Editor */}
        {isAdmin() && (
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => setShowThumbEditor(!showThumbEditor)}
              style={{
                padding: '10px 20px',
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🖼️ {showThumbEditor ? 'Hide' : 'Edit Thumbnail'}
            </button>

            {showThumbEditor && (
              <div style={{
                marginTop: '15px',
                padding: '20px',
                background: '#1a1a2e',
                borderRadius: '10px',
                border: '1px solid #333'
              }}>
                <h3 style={{ color: '#fff', marginBottom: '15px' }}>Edit Thumbnail</h3>

                {/* Capture from video */}
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '8px' }}>
                    🎞️ Capture frame from video:
                  </p>
                  <input
                    type="range"
                    min="0"
                    max={videoDuration}
                    value={captureTime}
                    onChange={handleCaptureTimeChange}
                    style={{ width: '100%', marginBottom: '5px' }}
                  />
                  <p style={{ color: '#aaa', fontSize: '0.85rem' }}>
                    Time: {Math.floor(captureTime / 60)}:{String(captureTime % 60).padStart(2, '0')}
                  </p>
                </div>

                {/* Or upload image */}
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '8px' }}>
                    🖼️ Or upload an image:
                  </p>
                  <input
                    id="adminThumbInput"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbUpload}
                    style={{ color: '#aaa' }}
                  />
                </div>

                {/* Preview */}
                {thumbPreview && (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '5px' }}>Preview:</p>
                    <img
                      src={thumbPreview}
                      alt="Thumbnail preview"
                      style={{ width: '240px', height: '135px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #444' }}
                    />
                  </div>
                )}

                <button
                  onClick={handleSaveThumbnail}
                  disabled={savingThumb || !thumbPreview}
                  style={{
                    padding: '10px 24px',
                    background: '#e50914',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {savingThumb ? 'Saving...' : '💾 Save Thumbnail'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoPlayer