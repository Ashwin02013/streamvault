const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa')
require('dotenv').config()

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
})

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err)
    } else {
      const signingKey = key.getPublicKey()
      callback(null, signingKey)
    }
  })
}

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'No token provided. Please login first.' 
    })
  }

  const token = authHeader.split(' ')[1]

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ 
        error: 'Invalid or expired token. Please login again.' 
      })
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      username: decoded['cognito:username'],
      groups: decoded['cognito:groups'] || []
    }

    next()
  })
}

const isAdmin = (req, res, next) => {
  const groups = req.user?.groups || []
  
  if (groups.includes('admin') || groups.includes('superadmin')) {
    next()
  } else {
    res.status(403).json({ 
      error: 'Access denied. Admin only.' 
    })
  }
}

const hasSubscription = (requiredTier) => {
  return (req, res, next) => {
    const groups = req.user?.groups || []
    
    const tierLevel = {
      'free': 0,
      'basic': 1,
      'premium': 2,
      'admin': 3,
      'superadmin': 3
    }

    const userLevel = Math.max(...groups.map(g => tierLevel[g] ?? -1))
    const requiredLevel = tierLevel[requiredTier] ?? 0

    if (userLevel >= requiredLevel) {
      next()
    } else {
      res.status(403).json({ 
        error: `This content requires ${requiredTier} subscription.` 
      })
    }
  }
}

module.exports = { verifyToken, isAdmin, hasSubscription }