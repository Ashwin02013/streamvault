import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="logo">🎬 StreamVault</div>
        <div className="nav-buttons">
          <button onClick={() => navigate('/login')} className="btn-outline">Login</button>
          <button onClick={() => navigate('/register')} className="btn-primary">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <h1>Unlimited Movies,<br />TV Shows & More</h1>
        <p>Watch anywhere. Cancel anytime. Start streaming today.</p>
        <div className="hero-buttons">
          <button onClick={() => navigate('/register')} className="btn-primary btn-large">
            Start Free Trial
          </button>
          <button onClick={() => navigate('/login')} className="btn-outline btn-large">
            Sign In
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="features">
        <div className="feature-card">
          <span className="feature-icon">📺</span>
          <h3>Watch Everywhere</h3>
          <p>Stream on your phone, tablet, laptop, and TV.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">⚡</span>
          <h3>No Interruptions</h3>
          <p>Enjoy ad-free streaming on all plans.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🔒</span>
          <h3>Cancel Anytime</h3>
          <p>No contracts. No commitments. Cancel whenever.</p>
        </div>
      </div>

      {/* Plans Preview */}
      <div className="plans-preview">
        <h2>Choose Your Plan</h2>
        <div className="plans-grid">
          <div className="plan-card">
            <h3>Free</h3>
            <div className="price">₹0<span>/month</span></div>
            <ul>
              <li>✅ Limited content</li>
              <li>✅ SD quality</li>
              <li>❌ No downloads</li>
            </ul>
            <button onClick={() => navigate('/register')} className="btn-outline">Get Started</button>
          </div>
          <div className="plan-card popular">
            <div className="popular-badge">Most Popular</div>
            <h3>Basic</h3>
            <div className="price">₹199<span>/month</span></div>
            <ul>
              <li>✅ All content</li>
              <li>✅ HD quality</li>
              <li>✅ 1 screen</li>
            </ul>
            <button onClick={() => navigate('/register')} className="btn-primary">Get Started</button>
          </div>
          <div className="plan-card">
            <h3>Premium</h3>
            <div className="price">₹499<span>/month</span></div>
            <ul>
              <li>✅ All content</li>
              <li>✅ 4K quality</li>
              <li>✅ 4 screens</li>
            </ul>
            <button onClick={() => navigate('/register')} className="btn-outline">Get Started</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2024 StreamVault. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Landing