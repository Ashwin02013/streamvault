import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadVideo } from '../services/api'
import toast from 'react-hot-toast'
import './UploadVideo.css'

const UploadVideo = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    required_plan: 'free',
    duration: ''
  })
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [thumbnailMode, setThumbnailMode] = useState('auto') // auto | upload | capture
  const [captureTime, setCaptureTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleVideoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setVideoPreviewUrl(url)
  }

  const handleVideoLoaded = () => {
    const vid = videoRef.current
    if (vid) {
      setVideoDuration(Math.floor(vid.duration))
      // Auto capture thumbnail at 1 second
      captureThumbnailAt(1)
    }
  }

  const captureThumbnailAt = (time) => {
    const vid = videoRef.current
    const canvas = canvasRef.current
    if (!vid || !canvas) return

    vid.currentTime = time
    vid.onseeked = () => {
      canvas.width = vid.videoWidth
      canvas.height = vid.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setThumbnailPreview(dataUrl)

      // Convert to blob/file
      canvas.toBlob((blob) => {
        const thumbFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' })
        setThumbnailFile(thumbFile)
      }, 'image/jpeg', 0.8)
    }
  }

  const handleCaptureTimeChange = (e) => {
    const time = parseInt(e.target.value)
    setCaptureTime(time)
    captureThumbnailAt(time)
  }

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setThumbnailFile(file)
    const url = URL.createObjectURL(file)
    setThumbnailPreview(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!videoFile) return toast.error('Please select a video file')

    setUploading(true)
    setProgress(10)

    try {
      const formData = new FormData()
      formData.append('video', videoFile)
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile)
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('required_plan', form.required_plan)
      formData.append('duration', form.duration)

      setProgress(40)
      await uploadVideo(formData)
      setProgress(100)

      toast.success('Video uploaded successfully!')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-page">
      <button onClick={() => navigate('/admin')} className="back-btn">← Back to Dashboard</button>

      <div className="upload-card">
        <h1>📤 Upload Video</h1>
        <p>Add new content to StreamVault</p>

        <form onSubmit={handleSubmit} className="upload-form">
          {/* Video File */}
          <div className="form-group">
            <label>Video File *</label>
            <div className="file-drop" onClick={() => document.getElementById('videoInput').click()}>
              {videoFile ? (
                <p>✅ {videoFile.name}</p>
              ) : (
                <>
                  <span>🎬</span>
                  <p>Click to select video file</p>
                  <small>MP4, MOV, AVI supported</small>
                </>
              )}
            </div>
            <input
              id="videoInput"
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={handleVideoSelect}
            />
          </div>

          {/* Hidden video for thumbnail capture */}
          {videoPreviewUrl && (
            <video
              ref={videoRef}
              src={videoPreviewUrl}
              style={{ display: 'none' }}
              onLoadedMetadata={handleVideoLoaded}
              crossOrigin="anonymous"
            />
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Thumbnail Section */}
          <div className="form-group">
            <label>Thumbnail</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => setThumbnailMode('auto')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: thumbnailMode === 'auto' ? '2px solid #e50914' : '1px solid #444',
                  background: thumbnailMode === 'auto' ? '#e50914' : 'transparent',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                🤖 Auto
              </button>
              <button
                type="button"
                onClick={() => setThumbnailMode('capture')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: thumbnailMode === 'capture' ? '2px solid #e50914' : '1px solid #444',
                  background: thumbnailMode === 'capture' ? '#e50914' : 'transparent',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                🎞️ Capture Frame
              </button>
              <button
                type="button"
                onClick={() => setThumbnailMode('upload')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: thumbnailMode === 'upload' ? '2px solid #e50914' : '1px solid #444',
                  background: thumbnailMode === 'upload' ? '#e50914' : 'transparent',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                🖼️ Upload Image
              </button>
            </div>

            {/* Auto mode */}
            {thumbnailMode === 'auto' && (
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                ✅ Thumbnail will be auto-captured from the video at 1 second.
              </p>
            )}

            {/* Capture frame mode */}
            {thumbnailMode === 'capture' && videoFile && (
              <div>
                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '8px' }}>
                  Drag to select frame time:
                </p>
                <input
                  type="range"
                  min="0"
                  max={videoDuration}
                  value={captureTime}
                  onChange={handleCaptureTimeChange}
                  style={{ width: '100%', marginBottom: '10px' }}
                />
                <p style={{ color: '#aaa', fontSize: '0.85rem' }}>
                  Selected: {Math.floor(captureTime / 60)}:{String(captureTime % 60).padStart(2, '0')}
                </p>
              </div>
            )}

            {thumbnailMode === 'capture' && !videoFile && (
              <p style={{ color: '#e50914', fontSize: '0.9rem' }}>
                Please select a video file first.
              </p>
            )}

            {/* Upload image mode */}
            {thumbnailMode === 'upload' && (
              <div className="file-drop small" onClick={() => document.getElementById('thumbInput').click()}>
                {thumbnailFile && thumbnailMode === 'upload' ? (
                  <p>✅ {thumbnailFile.name}</p>
                ) : (
                  <p>🖼 Click to select thumbnail image</p>
                )}
              </div>
            )}
            <input
              id="thumbInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleThumbnailUpload}
            />

            {/* Thumbnail preview */}
            {thumbnailPreview && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '5px' }}>Preview:</p>
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  style={{ width: '200px', height: '112px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #444' }}
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              placeholder="Enter video title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Enter video description"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Required Plan</label>
              <select name="required_plan" value={form.required_plan} onChange={handleChange}>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div className="form-group">
              <label>Duration (auto-detected)</label>
              <input
                type="text"
                name="duration"
                placeholder="Auto-detected on upload"
                value={form.duration}
                onChange={handleChange}
              />
            </div>
          </div>

          {uploading && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
              <span>{progress}%</span>
            </div>
          )}

          <button type="submit" className="btn-upload-submit" disabled={uploading}>
            {uploading ? 'Uploading...' : '📤 Upload Video'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UploadVideo