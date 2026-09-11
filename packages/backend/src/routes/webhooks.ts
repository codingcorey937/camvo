import { Router, Request, Response } from 'express'
import { constructWebhookEvent } from '../services/stripe'
import { supabase } from '../utils/supabase'

const router = Router()

// POST /api/webhooks/stripe
router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  if (!sig) {
    res.status(400).json({ error: 'Missing stripe signature' })
    return
  }

  try {
    const event = await constructWebhookEvent(req.body as any, sig)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as any
        await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('stripe_payment_intent_id', pi.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as any
        await supabase
          .from('bookings')
          .update({ status: 'payment_failed' })
          .eq('stripe_payment_intent_id', pi.id)
        break
      }

      case 'account.updated': {
        // Handle Stripe Connect account updates
        break
      }
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    res.status(400).json({ error: 'Webhook signature verification failed' })
  }
})

export default router