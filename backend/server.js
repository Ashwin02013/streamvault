// server.js — The main entry point of our Node.js backend

// Load environment variables from .env file
require('dotenv').config()

// Import express — our web framework
const express = require('express')

// Import cors — allows React frontend to talk to this backend
const cors = require('cors')

// Create the express application
const app = express()

// Tell express to accept JSON data in requests
app.use(express.json())

// Enable CORS so our React app can call this API
app.use(cors({
  origin: ['http://localhost:3000', 'https://d2hr465hlafi8g.cloudfront.net', 'http://streamvault-app-281414431600.s3-website.ap-south-1.amazonaws.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Test route — to check if server is running
// When someone visits http://localhost:5000/ they see this
app.get('/', (req, res) => {
  res.json({
    message: 'StreamVault API is running!',
    version: '1.0.0',
    status: 'healthy'
  })
})

// Get the port from .env file (we set PORT=5000)
const PORT = process.env.PORT || 5000

// Start the server and listen for requests
app.listen(PORT, () => {
  console.log(`StreamVault server running on port ${PORT}`)
  console.log(`Test it: http://localhost:${PORT}`)
})
