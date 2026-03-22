import React, { useState } from 'react'
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
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
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
              onChange={(e) => setVideoFile(e.target.files[0])}
            />
          </div>

          <div className="form-group">
            <label>Thumbnail (optional)</label>
            <div className="file-drop small" onClick={() => document.getElementById('thumbInput').click()}>
              {thumbnailFile ? (
                <p>✅ {thumbnailFile.name}</p>
              ) : (
                <p>🖼 Click to select thumbnail image</p>
              )}
            </div>
            <input
              id="thumbInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => setThumbnailFile(e.target.files[0])}
            />
          </div>

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
              <label>Duration (e.g. 1:30:00)</label>
              <input
                type="text"
                name="duration"
                placeholder="HH:MM:SS"
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