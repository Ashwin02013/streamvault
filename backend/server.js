const express = require('express')
const cors = require('cors')
require('dotenv').config()

// Import routes
const authRoutes = require('./src/routes/auth')
const videoRoutes = require('./src/routes/videos')
const userRoutes = require('./src/routes/users')

// Import database connection (runs the connection test on startup)
const pool = require('./src/config/db')

// Import AWS config (runs the S3 connection test on startup)
require('./src/config/aws')

const app = express()

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

// CORS — allows our React frontend to talk to this backend
// Without this, the browser blocks all requests from React to our API
app.use(cors({
  origin: [
    'http://localhost:3000',                          // React dev server
    'http://localhost:3001',                          // alternate dev port
    `https://${process.env.CLOUDFRONT_URL}`,          // production CloudFront
    'd2hr465hlafi8g.cloudfront.net'                   // CloudFront domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Parse JSON — allows us to read req.body as JSON
app.use(express.json())

// Parse URL encoded data — for form submissions
app.use(express.urlencoded({ extended: true }))

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Health check — used to verify the server is running
// Visit http://localhost:5000/health to test
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'StreamVault API is running!',
    timestamp: new Date().toISOString()
  })
})

// Mount all routes with their base paths
app.use('/api/auth', authRoutes)     // /api/auth/login, /api/auth/register etc
app.use('/api/videos', videoRoutes)  // /api/videos, /api/videos/:id etc
app.use('/api/users', userRoutes)    // /api/users/me, /api/users etc

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────

// 404 handler — catches any route that doesn't exist
app.use((req, res) => {
  res.status(404).json({ 
    error: `Route ${req.method} ${req.url} not found` 
  })
})

// Global error handler — catches any unhandled errors
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  })
})

// ─── START SERVER ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log('─────────────────────────────────────')
  console.log(`🚀 StreamVault API running on port ${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/health`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log('─────────────────────────────────────')
})

module.exports = app