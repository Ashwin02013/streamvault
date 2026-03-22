import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { Amplify } from 'aws-amplify'
import awsConfig from './aws-config'

// Configure Amplify with our Cognito settings
Amplify.configure(awsConfig)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
)