// aws.js — sets up connections to AWS S3 and Cognito

// AWS SDK is the official package to talk to any AWS service
const AWS = require('aws-sdk')

// dotenv loads our .env file
require('dotenv').config()

// Configure AWS with our credentials
// This is like logging into AWS but from code
AWS.config.update({
  region: process.env.AWS_REGION,                    // ap-south-1 (Mumbai)
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,        // our IAM access key
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY // our IAM secret key
})

// S3 — Simple Storage Service
// This is what we use to upload and retrieve video files
const s3 = new AWS.S3()

// Cognito Identity Service Provider
// This is what we use to register users, login, verify tokens
const cognito = new AWS.CognitoIdentityServiceProvider()

// Test S3 connection by listing our buckets
s3.listBuckets((err, data) => {
  if (err) {
    console.error('❌ AWS S3 connection failed:', err.message)
  } else {
    console.log('✅ Connected to AWS S3!')
    console.log('   Buckets found:', data.Buckets.map(b => b.Name).join(', '))
  }
})

// Export both so other files can use them
module.exports = { s3, cognito, AWS }