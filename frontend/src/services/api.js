// api.js — central place for all backend API calls

import axios from 'axios'

// Base URL for our backend
const API = axios.create({
  baseURL: 'https://deed-spotter-unsteady.ngrok-free.dev/api',
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
})

// Automatically attach the JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── AUTH ───────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data)
export const confirmUser = (data) => API.post('/auth/confirm', data)
export const loginUser = (data) => API.post('/auth/login', data)
export const forgotPassword = (data) => API.post('/auth/forgot-password', data)
export const resetPassword = (data) => API.post('/auth/reset-password', data)
export const forgotAccount = (data) => API.post('/auth/forgot-account', data)
export const refreshToken = (data) => API.post('/auth/refresh', data)

// ─── VIDEOS ─────────────────────────────────────────────
export const browseVideos = () => API.get('/videos/browse')
export const getVideo = (id) => API.get(`/videos/${id}`)
export const uploadVideo = (formData) => API.post('/videos/upload', formData)
export const updateVideo = (id, data) => API.put(`/videos/${id}`, data)
export const deleteVideo = (id) => API.delete(`/videos/${id}`)

// ─── USERS ──────────────────────────────────────────────
export const getMyProfile = () => API.get('/users/me')
export const updateMyProfile = (data) => API.put('/users/me', data)
export const getWatchHistory = () => API.get('/users/me/history')
export const upgradePlan = (data) => API.post('/users/me/upgrade', data)
export const getAllUsers = () => API.get('/users/')
export const updateUserPlan = (id, data) => API.put(`/users/${id}/plan`, data)
export const getAdminStats = () => API.get('/users/admin/stats')

export default API