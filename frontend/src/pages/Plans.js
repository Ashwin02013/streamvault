import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../services/api'
import toast from 'react-hot-toast'
import './Plans.css'

const Plans = () => {
  const navigate = useNavigate()
  const { getPlan } = useAuth()
  const currentPlan = getPlan()
  const [loading, setLoading] = useState(null)

  const handleUpgrade = async (plan) => {
    if (plan === 'free') return
    setLoading(plan)
    try {
      const { data } = await API.post('/payments/create-order', { plan })
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'StreamVault',
        description: data.planName,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await API.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan
            })
            toast.success(`Successfully upgraded to ${plan} plan!`)
            navigate('/home')
            window.location.reload()
          } catch (err) {
            toast.error('Payment verification failed.')
          }
        },
        prefill: { name: '', email: '' },
        theme: { color: '#e50914' }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error('Failed to initiate payment.')
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      period: '/month',
      color: 'gray',
      features: [
        { text: 'Limited content library', included: true },
        { text: 'SD quality (480p)', included: true },
        { text: 'Watch on 1 device', included: true },
        { text: 'HD quality', included: false },
        { text: 'Downloads', included: false },
        { text: '4K Ultra HD', included: false },
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '₹199',
      period: '/month',
      color: 'blue',
      popular: false,
      features: [
        { text: 'Full content library', included: true },
        { text: 'HD quality (1080p)', included: true },
        { text: 'Watch on 1 device', included: true },
        { text: 'Ad-free streaming', included: true },
        { text: 'Downloads', included: false },
        { text: '4K Ultra HD', included: false },
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₹499',
      period: '/month',
      color: 'gold',
      popular: true,
      features: [
        { text: 'Full content library', included: true },
        { text: '4K Ultra HD quality', included: true },
        { text: 'Watch on 4 devices', included: true },
        { text: 'Ad-free streaming', included: true },
        { text: 'Unlimited downloads', included: true },
        { text: 'Early access to new content', included: true },
      ]
    }
  ]

  return (
    <div className="plans-page">
      <button onClick={() => navigate('/home')} className="back-btn">← Back</button>

      <div className="plans-header">
        <h1>Choose Your Plan</h1>
        <p>Upgrade anytime. Cancel anytime.</p>
        {currentPlan !== 'free' && (
          <div className="current-plan-notice">
            You're currently on the <strong>{currentPlan.toUpperCase()}</strong> plan
          </div>
        )}
      </div>

      <div className="plans-grid">
        {plans.map(plan => (
          <div key={plan.id} className={`plan-card plan-${plan.color} ${plan.popular ? 'popular' : ''} ${currentPlan === plan.id ? 'current' : ''}`}>
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            {currentPlan === plan.id && <div className="current-badge">Current Plan</div>}

            <h2>{plan.name}</h2>
            <div className="plan-price">
              {plan.price}<span>{plan.period}</span>
            </div>

            <ul className="plan-features">
              {plan.features.map((f, i) => (
                <li key={i} className={f.included ? 'included' : 'excluded'}>
                  {f.included ? '✅' : '❌'} {f.text}
                </li>
              ))}
            </ul>

            <button
              className={`plan-btn plan-btn-${plan.color}`}
              onClick={() => handleUpgrade(plan.id)}
              disabled={currentPlan === plan.id || loading === plan.id}
            >
              {loading === plan.id ? 'Processing...' : currentPlan === plan.id ? 'Current Plan' : currentPlan === 'free' ? 'Upgrade' : 'Switch Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Plans