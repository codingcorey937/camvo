import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api, getToken } from '../api/client'
import { loadStripe } from '@stripe/stripe-js'

const PLATFORM_FEE_RATE = 0.125

export function CreatorPublicPage() {
  const { slug } = useParams<{ slug: string }>()
  const [creator, setCreator] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [duration, setDuration] = useState('30')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [booking, setBooking] = useState(false)
  const [bookError, setBookError] = useState('')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.getCreatorBySlug(slug)
      .then(setCreator)
      .catch(() => setError('Creator not found'))
      .finally(() => setLoading(false))
  }, [slug])

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

  const handleBook = async () => {
    setName(name.trim())
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setBookError('Please fill in all fields')
      return
    }
    setBooking(true)
    setBookError('')
    try {
      const startTime = new Date(Date.now() + 60000).toISOString()

      // Step 1: Create guest booking (no auth needed)
      const bookingData = await api.createGuestBooking({
        creatorId: creator.id,
        startTime,
        durationMinutes: parseInt(duration) || 30,
        priceCents: price,
        viewerName: name,
        viewerPhone: phone,
        viewerEmail: email,
      })

      // Step 2: Confirm payment via Stripe
      const cfg = await api.getConfig()
      const stripe = await loadStripe(cfg.stripePublishableKey)
      if (!stripe) throw new Error('Stripe failed to load')

      const { error: confirmError } = await stripe.confirmPayment({
        clientSecret: bookingData.clientSecret,
        confirmParams: {
          return_url: window.location.origin,
          payment_method_data: {
            billing_details: { name, email, phone },
          },
        },
      })

      if (confirmError) throw new Error(confirmError.message)

      // Confirm booking on the backend
      await api.confirmBooking('', bookingData.bookingId, 'immediate')
      window.location.href = `/call/${bookingData.roomUrl.split('/').pop()}`
    } catch (err: any) {
      setBookError(err.message || 'Booking failed')
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

  if (error || !creator) {
    return (
      <div className="text-center py-32 px-4">
        <div className="card max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold mb-2">Creator Not Found</h1>
          <p className="text-dark-300 text-sm">This link may be invalid or the creator hasn't set up their page yet.</p>
        </div>
      </div>
    )
  }

  const formatPrice = (c: any) => {
    if (c.price_per_minute) return `$${(c.price_per_minute / 100).toFixed(2)}/min`
    if (c.price_per_hour) return `$${(c.price_per_hour / 100).toFixed(2)}/hr`
    if (c.custom_price) return `$${(c.custom_price / 100).toFixed(2)}`
    return 'Free'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Creator Profile */}
      <div className="card p-8 mb-8 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 overflow-hidden">
          {creator.users?.avatar_url ? (
            <img src={creator.users.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-primary">
              {(creator.display_name || creator.users?.full_name)?.[0]?.toUpperCase() || '?'}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold">{creator.display_name || creator.users?.full_name}</h1>
        <p className="text-primary font-semibold mt-1">{formatPrice(creator)}</p>
        {creator.bio && <p className="text-dark-300 mt-3 max-w-lg mx-auto">{creator.bio}</p>}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {(creator.tags || []).map((tag: string) => (
            <span key={tag} className="bg-dark-700 text-dark-200 text-xs px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      {/* Booking Form */}
      <div className="card p-8">
        <h2 className="text-xl font-bold mb-6">Book a Call</h2>

        <div className="space-y-5 max-w-md mx-auto">
          <div>
            <label className="block text-sm text-dark-200 mb-2">Duration</label>
            <div className="flex gap-3">
              {['15', '30', '60'].map((mins) => (
                <button key={mins} onClick={() => setDuration(mins)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                    duration === mins
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-dark-600 text-dark-300 hover:border-dark-500'
                  }`}
                >{mins}m</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-200 mb-2">Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Your full name" />
          </div>

          <div>
            <label className="block text-sm text-dark-200 mb-2">Phone (for call link)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+1234567890" />
          </div>

          <div>
            <label className="block text-sm text-dark-200 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
          </div>

          {/* Price breakdown */}
          {price > 0 && (
            <div className="bg-dark-700 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-dark-200">
                <span>Call price</span>
                <span className="text-white font-semibold">${(price / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-dark-200">
                <span>Platform fee (12.5%)</span>
                <span className="text-yellow-500">-${(platformFee / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-dark-600 pt-2">
                <span>Total</span>
                <span className="text-primary">${(price / 100).toFixed(2)}</span>
              </div>
            </div>
          )}

          {bookError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{bookError}</div>
          )}

          <button onClick={handleBook} disabled={booking || price === 0} className="btn-primary w-full">
            {booking ? 'Processing...' : `Book & Pay $${(price / 100).toFixed(2)}`}
          </button>

          <p className="text-dark-400 text-xs text-center">
            Your payment is processed securely by Stripe. No account needed.
          </p>
        </div>
      </div>

      {/* Powered by */}
      <div className="text-center mt-8 text-dark-500 text-xs">
        Powered by <span className="text-primary">Camvo</span> &mdash; Book video calls with creators
      </div>
    </div>
  )
}