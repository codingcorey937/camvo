export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  avatarUrl?: string
  stripeCustomerId?: string
}

export interface Creator {
  id: string
  display_name: string
  bio?: string
  tags: string[]
  price_per_minute?: number
  price_per_hour?: number
  custom_price?: number
  currency: string
  available: boolean
  user_id: string
  users: {
    id: string
    full_name: string
    avatar_url?: string
  }
  created_at?: string
}

export interface Booking {
  id: string
  creator_id: string
  viewer_id: string
  start_time: string
  duration_minutes: number
  price_cents: number
  platform_fee_cents: number
  creator_payout_cents: number
  status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'
  room_name: string
  room_url: string
  stripe_payment_intent_id: string
  viewer_phone: string
  creator_name: string
  creators?: {
    display_name: string
    users: { full_name: string; avatar_url?: string }
  }
  created_at?: string
}

export interface CreateBookingResponse {
  bookingId: string
  clientSecret: string
  roomUrl: string
  priceCents: number
  platformFeeCents: number
  creatorPayoutCents: number
}

export interface ConfirmBookingResponse {
  booking: Booking
  message: string
  platformFeeCents: number
  creatorPayoutCents: number
}