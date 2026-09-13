import { Router, Request, Response } from 'express'
import { supabase } from '../utils/supabase'
import { generateToken } from '../middleware/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createCustomer } from '../services/stripe'

const router = Router()

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  phone: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const data = signupSchema.parse(req.body)

    // Check existing user
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .maybeSingle()

    if (existing) {
      res.status(409).json({ error: 'Email already registered' })
      return
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create Stripe customer for Payment Sheet
    let stripeCustomerId: string | null = null
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const customer = await createCustomer(data.email, data.fullName)
        stripeCustomerId = customer.id
      } catch (stripeErr) {
        console.error('Stripe customer creation failed (non-fatal):', stripeErr)
      }
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: data.email,
        password_hash: hashedPassword,
        full_name: data.fullName,
        phone: data.phone || null,
        stripe_customer_id: stripeCustomerId,
      })
      .select('id, email, full_name, phone, stripe_customer_id')
      .single()

    if (error || !user) {
      res.status(500).json({ error: 'Failed to create user', details: error?.message })
      return
    }

    const token = generateToken({ userId: user.id, email: user.email })

    // Auto-create a creator profile (all signups are creators)
    const creatorSlug = data.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    await supabase
      .from('creators')
      .insert({
        user_id: user.id,
        display_name: data.fullName,
        slug: creatorSlug,
        available: true,
      })
      .maybeSingle()

    res.status(201).json({ user, token, stripeCustomerId })
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: err.errors })
      return
    }
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body)

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, full_name, phone')
      .eq('email', data.email)
      .single()

    if (error || !user) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const valid = await bcrypt.compare(data.password, user.password_hash)
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const token = generateToken({ userId: user.id, email: user.email })

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
      },
      token,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: err.errors })
      return
    }
    console.error('Login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/auth/onboarding — become a creator
router.post('/onboarding', async (req: Request, res: Response) => {
  // This is a placeholder — Stripe Connect onboarding flow
  res.json({ message: 'Stripe Connect onboarding URL', url: 'https://connect.stripe.com/...' })
})

export default router