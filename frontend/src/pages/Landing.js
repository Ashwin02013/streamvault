import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

const Landing = () => {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="landing">

      {/* Navbar */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo">🎬 StreamVault</div>
        <div className="nav-buttons">
          <button onClick={() => navigate('/login')} className="btn-outline">Sign In</button>
          <button onClick={() => navigate('/register')} className="btn-primary">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-badge">🇮🇳 Made for India</div>
          <h1>Unlimited Entertainment,<br /><span className="hero-highlight">Your Way</span></h1>
          <p>Movies, shows, and exclusive content. Stream in HD and 4K. Start free — no credit card needed.</p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/register')} className="btn-primary btn-large">
              Start Free Trial →
            </button>
            <button onClick={() => navigate('/login')} className="btn-ghost btn-large">
              Sign In
            </button>
          </div>
          <div className="hero-trust">
            <span>✅ No credit card required</span>
            <span>✅ Cancel anytime</span>
            <span>✅ HD & 4K streaming</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat">
          <div className="stat-number">10+</div>
          <div className="stat-label">Videos Available</div>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <div className="stat-number">3</div>
          <div className="stat-label">Plan Options</div>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <div className="stat-number">4K</div>
          <div className="stat-label">Max Quality</div>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <div className="stat-number">₹0</div>
          <div className="stat-label">To Start</div>
        </div>
      </div>

      {/* Features */}
      <div className="features-section">
        <h2 className="section-title">Everything you need to enjoy streaming</h2>

        <div className="feature-row">
          <div className="feature-text">
            <div className="feature-tag">MULTI-DEVICE</div>
            <h3>Watch on any device, anywhere</h3>
            <p>Stream seamlessly on your phone, tablet, laptop, or TV. Your content follows you everywhere you go.</p>
          </div>
          <div className="feature-visual">
            <div className="device-mockup">
              <div className="mockup-screen">
                <div className="mockup-content">🎬</div>
                <div className="mockup-bar" />
                <div className="mockup-bar short" />
              </div>
            </div>
          </div>
        </div>

        <div className="feature-row reverse">
          <div className="feature-text">
            <div className="feature-tag">RESUME ANYWHERE</div>
            <h3>Pick up right where you left off</h3>
            <p>StreamVault remembers your progress. Switch devices and continue watching from the exact moment you stopped.</p>
          </div>
          <div className="feature-visual">
            <div className="progress-mockup">
              <div className="progress-title">🎬 Cherai Beach</div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" />
              </div>
              <div className="progress-time">Resuming from 0:12</div>
            </div>
          </div>
        </div>

        <div className="feature-row">
          <div className="feature-text">
            <div className="feature-tag">SECURE PAYMENTS</div>
            <h3>Safe & easy upgrades with Razorpay</h3>
            <p>Upgrade your plan anytime using UPI, cards, or netbanking. Fully secured and instant activation.</p>
          </div>
          <div className="feature-visual">
            <div className="payment-mockup">
              <div className="payment-icon">💳</div>
              <div className="payment-text">Razorpay Secured</div>
              <div className="payment-methods">
                <span>UPI</span>
                <span>Cards</span>
                <span>NetBanking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="plans-section">
        <h2 className="section-title">Simple, transparent pricing</h2>
        <p className="section-sub">Start free. Upgrade when you're ready.</p>

        <div className="plans-grid">
          <div className="plan-card">
            <div className="plan-name">Free</div>
            <div className="plan-price">₹0<span>/month</span></div>
            <div className="plan-desc">Perfect for getting started</div>
            <ul className="plan-features">
              <li className="included">✅ Limited content library</li>
              <li className="included">✅ SD quality (480p)</li>
              <li className="included">✅ Watch on 1 device</li>
              <li className="excluded">❌ HD quality</li>
              <li className="excluded">❌ Downloads</li>
            </ul>
            <button onClick={() => navigate('/register')} className="btn-outline plan-btn">
              Get Started Free
            </button>
          </div>

          <div className="plan-card featured">
            <div className="featured-badge">⭐ Most Popular</div>
            <div className="plan-name">Basic</div>
            <div className="plan-price">₹199<span>/month</span></div>
            <div className="plan-desc">Best for individuals</div>
            <ul className="plan-features">
              <li className="included">✅ Full content library</li>
              <li className="included">✅ HD quality (1080p)</li>
              <li className="included">✅ Watch on 1 device</li>
              <li className="included">✅ Ad-free streaming</li>
              <li className="excluded">❌ 4K Ultra HD</li>
            </ul>
            <button onClick={() => navigate('/register')} className="btn-primary plan-btn">
              Start Basic Plan
            </button>
          </div>

          <div className="plan-card">
            <div className="plan-name">Premium</div>
            <div className="plan-price">₹499<span>/month</span></div>
            <div className="plan-desc">Best for families</div>
            <ul className="plan-features">
              <li className="included">✅ Full content library</li>
              <li className="included">✅ 4K Ultra HD quality</li>
              <li className="included">✅ Watch on 4 devices</li>
              <li className="included">✅ Ad-free streaming</li>
              <li className="included">✅ Unlimited downloads</li>
            </ul>
            <button onClick={() => navigate('/register')} className="btn-outline plan-btn">
              Start Premium Plan
            </button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="faq-section">
        <h2 className="section-title">Frequently asked questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I cancel anytime?</h4>
            <p>Yes. There are no contracts or commitments. You can cancel your subscription at any time.</p>
          </div>
          <div className="faq-item">
            <h4>What can I watch on the free plan?</h4>
            <p>The free plan gives you access to a selection of our content library in SD quality.</p>
          </div>
          <div className="faq-item">
            <h4>How do I upgrade my plan?</h4>
            <p>Go to Plans from your dashboard and choose your plan. Payment is processed instantly via Razorpay.</p>
          </div>
          <div className="faq-item">
            <h4>What payment methods are accepted?</h4>
            <p>We accept UPI, debit/credit cards, and netbanking through our secure Razorpay integration.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <h2>Ready to start watching?</h2>
        <p>Join StreamVault today. It's free to start.</p>
        <button onClick={() => navigate('/register')} className="btn-primary btn-large">
          Create Free Account →
        </button>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="logo">🎬 StreamVault</div>
          <div className="footer-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Us</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 StreamVault. All rights reserved. Made with ❤️ in India.</p>
        </div>
      </footer>

    </div>
  )
}

export default Landing