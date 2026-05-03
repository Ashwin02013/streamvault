import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { refreshToken } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const refreshIntervalRef = useRef(null)

  useEffect(() => {
    checkUser()
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current)
    }
  }, [])

  const checkUser = async () => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      const storedRefresh = localStorage.getItem('refreshToken')

      if (!storedToken || storedToken === 'undefined') {
        clearAuth()
        return
      }

      // Check if token is expired
      const payload = JSON.parse(atob(storedToken.split('.')[1]))
      const isExpired = payload.exp * 1000 < Date.now()

      if (!isExpired) {
        // Token still valid — use it directly
        setToken(storedToken)
        setUser(storedUser ? JSON.parse(storedUser) : {})
        startRefreshTimer()
      } else if (storedRefresh) {
        // Token expired — try to refresh
        try {
          const { data } = await refreshToken({ refreshToken: storedRefresh })
          localStorage.setItem('token', data.idToken)
          setToken(data.idToken)
          setUser(storedUser ? JSON.parse(storedUser) : {})
          startRefreshTimer()
        } catch (err) {
          if (err.response?.status === 401) {
            // Cognito explicitly rejected — session truly expired
            clearAuth()
          } else {
            // Network error or server down — keep user logged in with old token
            console.log('Network error during refresh — keeping session alive')
            setToken(storedToken)
            setUser(storedUser ? JSON.parse(storedUser) : {})
            startRefreshTimer()
          }
        }
      } else {
        clearAuth()
      }
    } catch (err) {
      // Any unexpected error — keep logged in if token exists
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      if (storedToken) {
        setToken(storedToken)
        setUser(storedUser ? JSON.parse(storedUser) : {})
      } else {
        clearAuth()
      }
    } finally {
      setLoading(false)
    }
  }

  const startRefreshTimer = () => {
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current)
    refreshIntervalRef.current = setInterval(async () => {
      const storedRefresh = localStorage.getItem('refreshToken')
      if (!storedRefresh) return
      try {
        const { data } = await refreshToken({ refreshToken: storedRefresh })
        localStorage.setItem('token', data.idToken)
        setToken(data.idToken)
        console.log('Token refreshed successfully')
      } catch (err) {
        if (err.response?.status === 401) {
          // Only log out if Cognito explicitly rejects
          console.log('Refresh token expired — logging out')
          clearAuth()
          window.location.href = '/login'
        }
        // Network error — silently skip, try again next interval
      }
    }, 45 * 60 * 1000)
  }

  const clearAuth = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current)
  }

  const login = async (username, password) => {
    // Login is handled directly in Login.js
  }

  const logout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  const getUserGroups = () => {
    try {
      const t = token || localStorage.getItem('token')
      if (!t || t === 'undefined') return []
      const payload = JSON.parse(atob(t.split('.')[1]))
      return payload['cognito:groups'] || []
    } catch {
      return []
    }
  }

  const isAdmin = () => {
    const groups = getUserGroups()
    return groups.includes('admin') || groups.includes('superadmin')
  }

  const getPlan = () => {
    const groups = getUserGroups()
    if (groups.includes('premium')) return 'premium'
    if (groups.includes('basic')) return 'basic'
    return 'free'
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout, checkUser,
      isAdmin, getPlan, getUserGroups
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export default AuthContext