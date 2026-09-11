import { Router, Request, Response } from 'express'
import { supabase } from '../utils/supabase'
import { authMiddleware } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

const creatorProfileSchema = z.object({
  displayName: z.string().min(1),
  bio: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  pricePerMinute: z.number().min(0).optional(),
  pricePerHour: z.number().min(0).optional(),
  customPrice: z.number().min(0).optional(),
  currency: z.string().default('usd'),
  available: z.boolean().default(true),
})

// GET /api/users/me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user!.userId)
    .single()

  if (error || !user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('user_id', req.user!.userId)
    .maybeSingle()

  res.json({ ...user, creatorProfile: creator || null, password_hash: undefined })
})

// PUT /api/users/me
router.put('/me', authMiddleware, async (req: Request, res: Response) => {
  const { fullName, phone, avatarUrl } = req.body

  const { data, error } = await supabase
    .from('users')
    .update({ full_name: fullName, phone, avatar_url: avatarUrl })
    .eq('id', req.user!.userId)
    .select('id, email, full_name, phone, avatar_url')
    .single()

  if (error) {
    res.status(500).json({ error: 'Failed to update profile' })
    return
  }

  res.json(data)
})

// PUT /api/users/creator-profile — become/update creator profile
router.put('/creator-profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = creatorProfileSchema.parse(req.body)

    const { data: existing } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', req.user!.userId)
      .maybeSingle()

    let result
    if (existing) {
      result = await supabase
        .from('creators')
        .update({
          display_name: data.displayName,
          bio: data.bio || null,
          tags: data.tags || [],
          price_per_minute: data.pricePerMinute || null,
          price_per_hour: data.pricePerHour || null,
          custom_price: data.customPrice || null,
          currency: data.currency,
          available: data.available,
        })
        .eq('user_id', req.user!.userId)
        .select('*')
        .single()
    } else {
      result = await supabase
        .from('creators')
        .insert({
          user_id: req.user!.userId,
          display_name: data.displayName,
          bio: data.bio || null,
          tags: data.tags || [],
          price_per_minute: data.pricePerMinute || null,
          price_per_hour: data.pricePerHour || null,
          custom_price: data.customPrice || null,
          currency: data.currency,
        })
        .select('*')
        .single()
    }

    if (result.error) {
      res.status(500).json({ error: 'Failed to save creator profile', details: result.error.message })
      return
    }

    res.json(result.data)
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: err.errors })
      return
    }
    throw err
  }
})

// GET /api/users/creators — browse all creators
router.get('/creators', async (req: Request, res: Response) => {
  const { search, tag, limit = '20', offset = '0' } = req.query

  let query = supabase
    .from('creators')
    .select('*, users!inner(id, full_name, avatar_url)')
    .eq('available', true)

  if (search) {
    query = query.ilike('display_name', `%${search}%`)
  }
  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data, error, count } = await query
    .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).json({ error: 'Failed to fetch creators' })
    return
  }

  res.json({ creators: data, count })
})

// GET /api/users/creators/:id
router.get('/creators/:id', async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('creators')
    .select('*, users!inner(id, full_name, avatar_url)')
    .eq('id', req.params.id)
    .single()

  if (error || !data) {
    res.status(404).json({ error: 'Creator not found' })
    return
  }

  res.json(data)
})

export default router