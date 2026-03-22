import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import VideoPlayer from './pages/VideoPlayer'
import Plans from './pages/Plans'
import AdminDashboard from './pages/AdminDashboard'
import UploadVideo from './pages/UploadVideo'

// Protected route — redirects to login if not logged in
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

// Admin route — redirects to home if not admin
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (!isAdmin()) return <Navigate to="/home" />
  return children
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/watch/:id" element={<PrivateRoute><VideoPlayer /></PrivateRoute>} />
        <Route path="/plans" element={<PrivateRoute><Plans /></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/upload" element={<AdminRoute><UploadVideo /></AdminRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App