import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, getToken } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Creator } from '../types'

const PLATFORM_FEE_RATE = 0.125

export function CreatorDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loading, setLoading] = useState(true)
  const [duration, setDuration] = useState('30')
  const [phone, setPhone] = useState('')
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api.getCreator(id)
      .then(setCreator)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const calculatePrice = (): number => {
    if (!creator) return 0
    const mins = parseInt(duration) || 0
    if (creator.price_per_minute) return creator.price_per_minute * mins
    if (creator.price_per_hour) return creator.price_per_hour * (mins / 60)
    if (creator.custom_price) return creator.custom_price
    return 0
  }

  const price = calculatePrice()
  const platformFee = Math.ceil(price * PLATFORM_FEE_RATE)
  const creatorPayout = price - platformFee

  const handleBook = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!phone) {
      setError('Please enter your phone number for the join link')
      return
    }
    setBooking(true)
    setError('')
    try {
      const token = getToken()
      if (!token) throw new Error('Not authenticated')

      const startTime = new Date(Date.now() + 60000).toISOString()

      // Step 1: Create booking + PaymentIntent
      const bookingData = await api.createBooking(token, {
        creatorId: creator!.id,
        startTime,
        durationMinutes: parseInt(duration) || 30,
        priceCents: price,
        viewerPhone: phone,
      })

      // Step 2: Confirm payment via Stripe
      const stripeKey = await api.getConfig().then(c => c.stripePublishableKey)
      const { loadStripe } = await import('@stripe/stripe-js')
      const stripe = await loadStripe(stripeKey)
      if (!stripe) throw new Error('Stripe failed to load')

      const { error: confirmError } = await stripe.confirmPayment({
        clientSecret: bookingData.clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/bookings',
          payment_method_data: {
            billing_details: { email: user?.email, phone },
          },
        },
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      // If we get here, redirect to the call
      // (Stripe will handle the redirect via return_url, but Stripe Elements may succeed without redirect)
      await api.confirmBooking(token, bookingData.bookingId, 'immediate')
      navigate(`/call/${bookingData.roomUrl.split('/').pop()}`)
    } catch (err: any) {
      setError(err.message || 'Booking failed')
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="text-center py-32 text-dark-400">
        <p className="text-xl mb-2">Creator not found</p>
      </div>
    )
  }

  const formatPrice = (c: Creator) => {
    if (c.price_per_minute) return `$${(c.price_per_minute / 100).toFixed(2)}/min`
    if (c.price_per_hour) return `$${(c.price_per_hour / 100).toFixed(2)}/hr`
    if (c.custom_price) return `$${(c.custom_price / 100).toFixed(2)}`
    return 'Free'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="card p-8 mb-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            {creator.users?.avatar_url ? (
              <img src={creator.users.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary">
                {(creator.display_name || creator.users?.full_name)?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{creator.display_name || creator.users?.full_name}</h1>
            <p className="text-dark-300 mt-1">{formatPrice(creator)}</p>
            {creator.bio && <p className="text-dark-200 mt-2">{creator.bio}</p>}
            <div className="flex flex-wrap gap-2 mt-3">
              {(creator.tags || []).map((tag) => (
                <span key={tag} className="bg-dark-700 text-dark-200 text-xs px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-dark-700 pt-8">
          <h2 className="text-xl font-bold mb-4">Book a Call</h2>

          <div className="space-y-5 max-w-md">
            <div>
              <label className="block text-sm text-dark-200 mb-2">Duration</label>
              <div className="flex gap-3">
                {['15', '30', '60'].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                      duration === mins
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-dark-600 text-dark-300 hover:border-dark-500'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-dark-200 mb-2">
                Phone (for video call join link)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="+1234567890"
              />
            </div>

            {/* Price breakdown */}
            {price > 0 && (
              <div className="bg-dark-700 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-dark-200">
                  <span>Creator price</span>
                  <span className="text-white font-semibold">${(price / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-dark-200">
                  <span>Platform fee (12.5%)</span>
                  <span className="text-yellow-500">${(platformFee / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-dark-600 pt-2">
                  <span>Total</span>
                  <span className="text-primary">${(price / 100).toFixed(2)}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={booking || price === 0}
              className="btn-primary w-full"
            >
              {booking ? 'Processing...' : `Book & Pay $${(price / 100).toFixed(2)}`}
            </button>

            <p className="text-dark-400 text-xs text-center">
              You'll be charged ${(price / 100).toFixed(2)}. Your payment is processed securely by Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}