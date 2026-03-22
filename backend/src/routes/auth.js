const express = require('express')
const router = express.Router()
const { cognito } = require('../config/aws')
const pool = require('../config/db')
require('dotenv').config()

// REGISTER — creates a new user in Cognito + saves to our DB
router.post('/register', async (req, res) => {
  const { username, email, password, phone, plan = 'free' } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' })
  }

  try {
    // Step 1 — Create user in Cognito
    const cognitoParams = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: username,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: username },
      ]
    }

    if (phone) {
      cognitoParams.UserAttributes.push({ Name: 'phone_number', Value: phone })
    }

    await cognito.signUp(cognitoParams).promise()

    // Step 2 — Save user to our PostgreSQL database
    await pool.query(
      `INSERT INTO users (username, email, phone, plan, role, cognito_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [username, email, phone || null, plan, 'client', username]
    )

    res.status(201).json({ 
      message: 'Registration successful! Please check your email to verify your account.',
      username 
    })

  } catch (err) {
    console.error('Register error:', err)
    res.status(400).json({ error: err.message })
  }
})

// CONFIRM EMAIL — verifies the OTP sent to email after registration
router.post('/confirm', async (req, res) => {
  const { username, code } = req.body

  if (!username || !code) {
    return res.status(400).json({ error: 'Username and confirmation code are required' })
  }

  try {
    await cognito.confirmSignUp({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: username,
      ConfirmationCode: code
    }).promise()

    res.json({ message: 'Email confirmed! You can now login.' })

  } catch (err) {
    console.error('Confirm error:', err)
    res.status(400).json({ error: err.message })
  }
})

// LOGIN — authenticates user and returns JWT tokens
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  try {
    const result = await cognito.initiateAuth({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    }).promise()

    const tokens = result.AuthenticationResult

    // Get user details from our database
    const userResult = await pool.query(
      'SELECT id, username, email, plan, role FROM users WHERE username = $1 OR email = $1',
      [username]
    )

    const user = userResult.rows[0]

    res.json({
      message: 'Login successful!',
      accessToken: tokens.AccessToken,
      idToken: tokens.IdToken,
      refreshToken: tokens.RefreshToken,
      user: user || { username, plan: 'free', role: 'client' }
    })

  } catch (err) {
    console.error('Login error:', err)
    res.status(401).json({ error: err.message })
  }
})

// FORGOT PASSWORD — sends reset code to email
router.post('/forgot-password', async (req, res) => {
  const { username } = req.body

  try {
    await cognito.forgotPassword({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: username
    }).promise()

    res.json({ message: 'Password reset code sent to your email.' })

  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(400).json({ error: err.message })
  }
})

// RESET PASSWORD — sets new password using the code from email
router.post('/reset-password', async (req, res) => {
  const { username, code, newPassword } = req.body

  try {
    await cognito.confirmForgotPassword({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: username,
      ConfirmationCode: code,
      Password: newPassword
    }).promise()

    res.json({ message: 'Password reset successful! You can now login.' })

  } catch (err) {
    console.error('Reset password error:', err)
    res.status(400).json({ error: err.message })
  }
})

module.exports = router