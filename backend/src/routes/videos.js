const express = require('express')
const router = express.Router()
const db = require('../config/db')
const { s3 } = require('../config/aws')
const { verifyToken, isAdmin, hasSubscription } = require('../middleware/auth')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

// ─── BROWSE VIDEOS (all logged in users) ────────────────────────────────────
router.get('/browse', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, description, genre, tier, duration, year, rating, thumbnail_url, cloudfront_url FROM videos ORDER BY created_at DESC'
    )

    // Map tier to required_plan for frontend compatibility
    const videos = result.rows.map(v => ({
      ...v,
      required_plan: v.tier,
      video_url: v.cloudfront_url || null,
      views: 0
    }))

    res.json({ videos })
  } catch (err) {
    console.error('Browse error:', err)
    res.status(500).json({ error: 'Failed to fetch videos' })
  }
})

// ─── GET SINGLE VIDEO ────────────────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query('SELECT * FROM videos WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' })
    }

    const video = result.rows[0]

    // Check if user has required subscription
    const tierLevel = { free: 0, basic: 1, premium: 2 }
    const userGroups = req.user.groups || []

    let userTier = 'free'
    if (userGroups.includes('premium')) userTier = 'premium'
    else if (userGroups.includes('basic')) userTier = 'basic'
    else if (userGroups.includes('admin') || userGroups.includes('superadmin')) userTier = 'premium'

    const requiredTier = video.tier || 'free'

    if (tierLevel[userTier] < tierLevel[requiredTier]) {
      return res.status(403).json({ error: `This video requires ${requiredTier} subscription` })
    }

    // Generate signed S3 URL if video has s3_key
    let videoUrl = video.cloudfront_url || null
    if (video.s3_key && !videoUrl) {
      videoUrl = s3.getSignedUrl('getObject', {
        Bucket: process.env.S3_VIDEOS_BUCKET,
        Key: video.s3_key,
        Expires: 3600
      })
    }

    // Update view count
    await db.query('UPDATE videos SET views = COALESCE(views, 0) + 1 WHERE id = $1', [id])

    res.json({
      video: {
        ...video,
        required_plan: video.tier,
        video_url: videoUrl,
        views: (video.views || 0) + 1
      }
    })
  } catch (err) {
    console.error('Get video error:', err)
    res.status(500).json({ error: 'Failed to fetch video' })
  }
})

// ─── UPLOAD VIDEO (admin only) ───────────────────────────────────────────────
router.post('/upload', verifyToken, isAdmin, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, required_plan, duration } = req.body
    const videoFile = req.files?.video?.[0]
    const thumbnailFile = req.files?.thumbnail?.[0]

    if (!videoFile) {
      return res.status(400).json({ error: 'Video file is required' })
    }

    // Upload video to S3
    const videoKey = `videos/${Date.now()}-${videoFile.originalname}`
    await s3.upload({
      Bucket: process.env.S3_VIDEOS_BUCKET,
      Key: videoKey,
      Body: videoFile.buffer,
      ContentType: videoFile.mimetype
    }).promise()

    // Upload thumbnail if provided
    let thumbnailUrl = ''
    if (thumbnailFile) {
      const thumbKey = `thumbnails/${Date.now()}-${thumbnailFile.originalname}`
      await s3.upload({
        Bucket: process.env.S3_VIDEOS_BUCKET,
        Key: thumbKey,
        Body: thumbnailFile.buffer,
        ContentType: thumbnailFile.mimetype
      }).promise()
      thumbnailUrl = `${process.env.CLOUDFRONT_URL}/${thumbKey}`
    }

    const cloudfrontUrl = `${process.env.CLOUDFRONT_URL}/${videoKey}`

    // Save to database
    const result = await db.query(
      `INSERT INTO videos (title, description, tier, duration, s3_key, cloudfront_url, thumbnail_url, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, required_plan || 'free', duration, videoKey, cloudfrontUrl, thumbnailUrl, req.user.id]
    )

    res.json({ message: 'Video uploaded successfully', video: result.rows[0] })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: 'Upload failed: ' + err.message })
  }
})

// ─── DELETE VIDEO (admin only) ───────────────────────────────────────────────
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query('SELECT * FROM videos WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' })
    }

    const video = result.rows[0]

    // Delete from S3
    if (video.s3_key) {
      await s3.deleteObject({
        Bucket: process.env.S3_VIDEOS_BUCKET,
        Key: video.s3_key
      }).promise()
    }

    await db.query('DELETE FROM videos WHERE id = $1', [id])
    res.json({ message: 'Video deleted successfully' })
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ error: 'Delete failed' })
  }
})

module.exports = router