import React, { createContext, useContext, useState, useEffect } from 'react'
import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const getToken = async () => {
    try {
      const session = await fetchAuthSession({ forceRefresh: false })
      // Amplify v6 stores tokens here
      const idToken = session?.tokens?.idToken?.toString()
      return idToken || null
    } catch (err) {
      console.error('getToken error:', err)
      return null
    }
  }

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      const idToken = await getToken()
      console.log('checkUser - token:', idToken ? 'found' : 'not found')
      
      if (idToken) {
        setUser(currentUser)
        setToken(idToken)
        localStorage.setItem('token', idToken)
      } else {
        clearAuth()
      }
    } catch (err) {
      console.log('Not logged in:', err.message)
      clearAuth()
    } finally {
      setLoading(false)
    }
  }

  const clearAuth = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const login = async (email, password) => {
    try {
      const result = await signIn({ username: email, password })
      console.log('signIn result:', result)

      // Wait for session
      await new Promise(resolve => setTimeout(resolve, 1000))

      const idToken = await getToken()
      console.log('login - token:', idToken ? 'found' : 'not found')

      if (idToken) {
        setUser({ username: email })
        setToken(idToken)
        localStorage.setItem('token', idToken)
      }

      return result
    } catch (err) {
      console.error('Login error:', err)
      throw err
    }
  }

  const logout = async () => {
    await signOut()
    clearAuth()
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