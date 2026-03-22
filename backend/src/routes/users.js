const express = require('express')
const router = express.Router()
const { cognito } = require('../config/aws')
const pool = require('../config/db')
const { verifyToken, isAdmin } = require('../middleware/auth')
require('dotenv').config()

// GET CURRENT USER PROFILE
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, phone, plan, role, created_at FROM users WHERE cognito_id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: result.rows[0] })

  } catch (err) {
    console.error('Get profile error:', err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// UPDATE CURRENT USER PROFILE
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { username, phone } = req.body

    const result = await pool.query(
      `UPDATE users SET username = $1, phone = $2, updated_at = NOW()
       WHERE cognito_id = $3 RETURNING id, username, email, phone, plan, role`,
      [username, phone, req.user.id]
    )

    res.json({ message: 'Profile updated!', user: result.rows[0] })

  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// GET WATCH HISTORY
router.get('/me/history', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.id, v.title, v.thumbnail_url, v.genre, v.duration, w.watched_at
       FROM watch_history w
       JOIN videos v ON w.video_id = v.id
       WHERE w.user_id = $1
       ORDER BY w.watched_at DESC
       LIMIT 20`,
      [req.user.id]
    )

    res.json({ history: result.rows })

  } catch (err) {
    console.error('Watch history error:', err)
    res.status(500).json({ error: 'Failed to fetch watch history' })
  }
})

// UPGRADE SUBSCRIPTION — updates user plan
router.post('/me/upgrade', verifyToken, async (req, res) => {
  try {
    const { plan } = req.body

    const validPlans = ['free', 'basic', 'premium']
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Choose free, basic or premium.' })
    }

    // Update in our database
    await pool.query(
      'UPDATE users SET plan = $1, updated_at = NOW() WHERE cognito_id = $2',
      [plan, req.user.id]
    )

    // Add user to Cognito group for the plan
    await cognito.adminAddUserToGroup({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: req.user.username,
      GroupName: plan
    }).promise()

    res.json({ message: `Successfully upgraded to ${plan} plan!`, plan })

  } catch (err) {
    console.error('Upgrade error:', err)
    res.status(500).json({ error: 'Failed to upgrade subscription' })
  }
})

// ─── ADMIN ROUTES BELOW ───────────────────────────────────────────────────────

// GET ALL USERS — admin only
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, phone, plan, role, created_at
       FROM users ORDER BY created_at DESC`
    )

    res.json({ users: result.rows, total: result.rows.length })

  } catch (err) {
    console.error('Get users error:', err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// GET SINGLE USER — admin only
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, phone, plan, role, created_at FROM users WHERE id = $1',
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: result.rows[0] })

  } catch (err) {
    console.error('Get user error:', err)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// UPDATE USER PLAN — admin only
router.put('/:id/plan', verifyToken, isAdmin, async (req, res) => {
  try {
    const { plan } = req.body
    const { id } = req.params

    const validPlans = ['free', 'basic', 'premium']
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    // Get user's cognito_id first
    const userResult = await pool.query(
      'SELECT cognito_id, username FROM users WHERE id = $1',
      [id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { username } = userResult.rows[0]

    // Update in database
    await pool.query(
      'UPDATE users SET plan = $1, updated_at = NOW() WHERE id = $2',
      [plan, id]
    )

    // Update Cognito group
    await cognito.adminAddUserToGroup({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: username,
      GroupName: plan
    }).promise()

    res.json({ message: `User plan updated to ${plan}!` })

  } catch (err) {
    console.error('Update plan error:', err)
    res.status(500).json({ error: 'Failed to update plan' })
  }
})

// UPDATE USER ROLE — admin only
router.put('/:id/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body
    const { id } = req.params

    const validRoles = ['client', 'admin', 'superadmin']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const userResult = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { username } = userResult.rows[0]

    // Update in database
    await pool.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
      [role, id]
    )

    // Add to Cognito group
    await cognito.adminAddUserToGroup({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: username,
      GroupName: role
    }).promise()

    res.json({ message: `User role updated to ${role}!` })

  } catch (err) {
    console.error('Update role error:', err)
    res.status(500).json({ error: 'Failed to update role' })
  }
})

// DELETE USER — admin only
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const userResult = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { username } = userResult.rows[0]

    // Delete from Cognito
    await cognito.adminDeleteUser({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: username
    }).promise()

    // Delete from database
    await pool.query('DELETE FROM users WHERE id = $1', [id])

    res.json({ message: 'User deleted successfully!' })

  } catch (err) {
    console.error('Delete user error:', err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// GET DASHBOARD STATS — admin only
router.get('/admin/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users')
    const totalVideos = await pool.query('SELECT COUNT(*) FROM videos')
    const planBreakdown = await pool.query(
      'SELECT plan, COUNT(*) as count FROM users GROUP BY plan'
    )
    const tierBreakdown = await pool.query(
      'SELECT tier, COUNT(*) as count FROM videos GROUP BY tier'
    )

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalVideos: parseInt(totalVideos.rows[0].count),
      planBreakdown: planBreakdown.rows,
      tierBreakdown: tierBreakdown.rows
    })

  } catch (err) {
    console.error('Stats error:', err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

module.exports = router