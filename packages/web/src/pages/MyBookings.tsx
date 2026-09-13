import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../api/client'
import type { Booking } from '../types'

export function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    api.getMyBookings(token)
      .then((res) => setBookings(res.bookings))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400'
      case 'pending_payment': return 'text-yellow-400'
      case 'completed': return 'text-blue-400'
      case 'cancelled': return 'text-red-400'
      default: return 'text-dark-300'
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 text-dark-400">
          <p className="text-xl mb-2">No bookings yet</p>
          <p className="text-sm mb-6">Browse creators and book your first call</p>
          <Link to="/browse" className="btn-primary inline-block">
            Browse Creators
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg mb-1">Call with {b.creator_name}</h3>
                <p className="text-dark-300 text-sm">{formatDate(b.start_time)} &middot; {b.duration_minutes} min</p>
                <p className="text-sm mt-1">
                  <span className={statusColor(b.status)}>{b.status.replace('_', ' ')}</span>
                  {' | '}${(b.price_cents / 100).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                {b.status === 'confirmed' && (
                  <Link
                    to={`/call/${b.room_name}`}
                    className="btn-primary text-sm py-2 px-6"
                  >
                    Join Call
                  </Link>
                )}
                {b.status === 'pending_payment' && (
                  <span className="text-dark-400 text-sm py-2">Awaiting payment</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}