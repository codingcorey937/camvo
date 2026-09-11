import { Router, Request, Response } from 'express'
import { supabase } from '../utils/supabase'
import { authMiddleware } from '../middleware/auth'
import { createEphemeralKey } from '../services/stripe'

const router = Router()

// POST /api/payments/payment-sheet — returns params needed by stripe-react-native PaymentSheet
router.post('/payment-sheet', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body
    if (!bookingId) {
      res.status(400).json({ error: 'bookingId is required' })
      return
    }

    // Get the booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, stripe_payment_intent_id, status')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      res.status(404).json({ error: 'Booking not found' })
      return
    }

    if (booking.status !== 'pending_payment') {
      res.status(400).json({ error: 'Booking is not in pending_payment status' })
      return
    }

    // Get user's Stripe customer ID
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', req.user!.userId)
      .single()

    if (!user?.stripe_customer_id) {
      res.status(400).json({ error: 'No Stripe customer found. Please contact support.' })
      return
    }

    // Create ephemeral key for the Payment Sheet
    const ephemeralKey = await createEphemeralKey(user.stripe_customer_id)

    res.json({
      paymentIntentId: booking.stripe_payment_intent_id,
      clientSecret: '',  // returned in booking creation
      ephemeralKey: ephemeralKey.secret,
      customer: user.stripe_customer_id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    })
  } catch (err) {
    console.error('Payment sheet error:', err)
    res.status(500).json({ error: 'Failed to prepare payment sheet' })
  }
})

export default router