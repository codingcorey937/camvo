import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api, getToken } from '../api/client'

export function CreatorDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) return

    Promise.all([
      api.getMe(token),
      api.getHostBookings(token).catch(() => ({ bookings: [] })),
    ]).then(([me, bks]) => {
      setProfile(me.creatorProfile)
      setBookings(bks.bookings || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const slug = profile?.slug || user?.fullName?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const shareLink = `https://camvo.online/c/${slug}`

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
      <p className="text-dark-300 mb-8">Welcome back, {user?.fullName}</p>

      {/* Share Link Card */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-bold mb-2">Your Booking Link</h2>
        <p className="text-dark-300 text-sm mb-4">Share this link with clients — they can book and pay without creating an account.</p>
        <div className="flex items-center gap-3">
          <input
            readOnly
            value={shareLink}
            className="input-field flex-1 text-primary font-mono text-sm"
          />
          <button onClick={copyLink} className="btn-primary text-sm py-3 px-6 shrink-0">
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <div className="mt-4">
          <a href={shareLink} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">
            Open your public page &rarr;
          </a>
        </div>
      </div>

      {/* Profile Summary */}
      {profile && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Your Profile</h2>
            <span className="text-xs text-dark-400">{profile.slug ? `/${profile.slug}` : 'No slug set'}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-dark-400">Name</span>
              <p className="font-medium">{profile.display_name}</p>
            </div>
            <div>
              <span className="text-dark-400">Status</span>
              <p className={profile.available ? 'text-green-400' : 'text-yellow-400'}>
                {profile.available ? 'Available' : 'Unavailable'}
              </p>
            </div>
            {(profile.price_per_minute || profile.price_per_hour) && (
              <>
                <div>
                  <span className="text-dark-400">Price per min</span>
                  <p className="font-medium">{profile.price_per_minute ? `$${(profile.price_per_minute / 100).toFixed(2)}` : '—'}</p>
                </div>
                <div>
                  <span className="text-dark-400">Price per hour</span>
                  <p className="font-medium">{profile.price_per_hour ? `$${(profile.price_per_hour / 100).toFixed(2)}` : '—'}</p>
                </div>
              </>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <a href="/creator/profile" className="btn-secondary text-sm py-2 px-4">Edit Profile</a>
          </div>
        </div>
      )}

      {/* No profile prompt */}
      {!profile && (
        <div className="card p-6 mb-8 text-center">
          <h2 className="text-lg font-bold mb-2">Set Up Your Profile</h2>
          <p className="text-dark-300 text-sm mb-4">Add your pricing, bio, and tags so clients know what you offer.</p>
          <a href="/creator/profile" className="btn-primary text-sm py-3 px-6 inline-block">Complete Your Profile</a>
        </div>
      )}

      {/* Bookings */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4">Incoming Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-dark-400 text-sm">No bookings yet. Share your link to start receiving bookings.</p>
        ) : bookings.length > 0 && bookings.slice(0, 10).map((b: any) => (
          <div key={b.id} className="border-b border-dark-700 py-4 last:border-0 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{b.viewer_phone}</p>
              <p className="text-dark-400 text-sm">
                {b.duration_minutes} min &middot; ${(b.price_cents / 100).toFixed(2)} &middot;{' '}
                {new Date(b.start_time).toLocaleDateString()}
              </p>
              <span className={`text-xs ${
                b.status === 'confirmed' ? 'text-green-400' :
                b.status === 'pending_payment' ? 'text-yellow-400' :
                b.status === 'completed' ? 'text-blue-400' : 'text-dark-400'
              }`}>
                {b.status.replace('_', ' ')}
              </span>
            </div>
            {b.status === 'confirmed' && (
              <a href={`/call/${b.room_name}`} className="btn-primary text-sm py-2 px-5 shrink-0">Join</a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}