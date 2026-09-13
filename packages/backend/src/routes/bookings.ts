import { Router, Request, Response } from 'express'
import { supabase } from '../utils/supabase'
import { authMiddleware } from '../middleware/auth'
import { createRoom } from '../services/daily'
import { createPaymentIntent, confirmPaymentIntent, transferToCreator } from '../services/stripe'
import { sendJoinLink, sendBookingConfirmation } from '../services/twilio'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'

const router = Router()
const PLATFORM_FEE_RATE = 0.125 // 12.5%

const createBookingSchema = z.object({
  creatorId: z.string().uuid(),
  startTime: z.string().datetime(),
  durationMinutes: z.number().min(5).max(480),
  priceCents: z.number().min(0),
  viewerPhone: z.string().min(5),
})

// POST /api/bookings — create a booking (requires auth)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createBookingSchema.parse(req.body)

    // Get creator info
    const { data: creator, error: creatorErr } = await supabase
      .from('creators')
      .select('*, users!inner(id, full_name)')
      .eq('id', data.creatorId)
      .single()

    if (creatorErr || !creator) {
      res.status(404).json({ error: 'Creator not found' })
      return
    }

    // Calculate fees
    const platformFeeCents = Math.ceil(data.priceCents * PLATFORM_FEE_RATE)
    const creatorPayoutCents = data.priceCents - platformFeeCents

    // Create Daily.co room
    const room = await createRoom({
      nbf: Math.floor(new Date(data.startTime).getTime() / 1000) - 300,
      exp: Math.floor(new Date(data.startTime).getTime() / 1000) + data.durationMinutes * 60 + 300,
    })

    // Get viewer's Stripe customer ID
    const { data: viewer } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', req.user!.userId)
      .single()

    // Create payment intent for the listed price (viewer pays price, fee deducted from creator)
    const paymentIntent = await createPaymentIntent(data.priceCents, 'usd', {
      bookingId: 'pending',
      creatorId: data.creatorId,
      viewerId: req.user!.userId,
    }, viewer?.stripe_customer_id || undefined)

    // Create booking record
    const bookingId = uuid()
    const { error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        id: bookingId,
        creator_id: data.creatorId,
        viewer_id: req.user!.userId,
        start_time: data.startTime,
        duration_minutes: data.durationMinutes,
        price_cents: data.priceCents,
        platform_fee_cents: platformFeeCents,
        creator_payout_cents: creatorPayoutCents,
        currency: 'usd',
        room_name: room.name,
        room_url: room.url,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending_payment',
        viewer_phone: data.viewerPhone,
        creator_name: creator.users?.full_name || 'Creator',
      })

    if (bookingErr) {
      console.error('Failed to create booking:', bookingErr)
      res.status(500).json({ error: 'Failed to create booking' })
      return
    }

    res.status(201).json({
      bookingId,
      clientSecret: paymentIntent.client_secret,
      roomUrl: room.url,
      priceCents: data.priceCents,
      platformFeeCents,
      creatorPayoutCents,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: err.errors })
      return
    }
    if (err instanceof Error && err.message.includes('Daily.co')) {
      res.status(502).json({ error: 'Failed to create video room' })
      return
    }
    console.error('Booking creation error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/bookings/confirm — confirm after payment
router.post('/confirm', async (req: Request, res: Response) => {
  const { bookingId, paymentIntentId } = req.body

  try {
    const paymentIntent = await confirmPaymentIntent(paymentIntentId)
    if (paymentIntent.status !== 'succeeded') {
      res.status(400).json({ error: 'Payment not completed' })
      return
    }

    // Update booking to confirmed
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId)
      .select('*, creators!inner(stripe_connect_account_id)')
      .single()

    if (error || !booking) {
      res.status(500).json({ error: 'Failed to confirm booking' })
      return
    }

    // Payout to creator via Stripe Connect (if they have an account linked)
    const connectAccountId = (booking as any).creators?.stripe_connect_account_id
    if (connectAccountId && booking.creator_payout_cents > 0) {
      try {
        await transferToCreator(booking.creator_payout_cents, connectAccountId)
        console.log(`💰 Transferred ${booking.creator_payout_cents}c to creator ${booking.creator_id}`)
      } catch (transferErr) {
        console.error('Stripe transfer failed:', transferErr)
        // Non-fatal — booking is still confirmed
      }
    }

    // Send SMS
    try {
      await sendJoinLink(booking.viewer_phone, booking.room_url, booking.creator_name)
      await sendBookingConfirmation(
        booking.viewer_phone,
        booking.room_url,
        booking.creator_name,
        new Date(booking.start_time).toLocaleString()
      )
    } catch (smsErr) {
      console.error('SMS send error (non-fatal):', smsErr)
    }

    res.json({
      booking,
      message: 'Booking confirmed! Check your phone for the join link.',
      platformFeeCents: booking.platform_fee_cents,
      creatorPayoutCents: booking.creator_payout_cents,
    })
  } catch (err) {
    console.error('Confirm booking error:', err)
    res.status(500).json({ error: 'Failed to confirm booking' })
  }
})

// GET /api/bookings/my — viewer's bookings
router.get('/my', authMiddleware, async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, creators!inner(display_name, users!inner(full_name, avatar_url))')
    .eq('viewer_id', req.user!.userId)
    .order('start_time', { ascending: false })

  if (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' })
    return
  }

  res.json({ bookings: data })
})

// GET /api/bookings/host — creator's bookings (incoming)
router.get('/host', authMiddleware, async (req: Request, res: Response) => {
  const { data: creator } = await supabase
    .from('creators')
    .select('id')
    .eq('user_id', req.user!.userId)
    .maybeSingle()

  if (!creator) {
    res.status(403).json({ error: 'You are not a creator' })
    return
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('creator_id', creator.id)
    .order('start_time', { ascending: false })

  if (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' })
    return
  }

  res.json({ bookings: data })
})

export default router