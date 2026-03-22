// db.js — connects our backend to the RDS PostgreSQL database

// 'pg' is the PostgreSQL package we installed earlier
const { Pool } = require('pg')

// dotenv loads our .env file so we can use process.env
require('dotenv').config()

// Pool = a group of database connections
// Instead of opening/closing a connection every request,
// Pool keeps connections ready and reuses them — much faster
const pool = new Pool({
  host: process.env.DB_HOST,         // RDS endpoint
  port: process.env.DB_PORT,         // 5432
  database: process.env.DB_NAME,     // postgres
  user: process.env.DB_USER,         // postgres
  password: process.env.DB_PASSWORD, // StreamVault2024!
  ssl: {
    rejectUnauthorized: false  // required for AWS RDS connections
  }
})

// Test the connection when server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message)
  } else {
    console.log('✅ Connected to RDS PostgreSQL!')
    release() // release the test connection back to pool
  }
})

// Export pool so other files can use it
module.exports = pool