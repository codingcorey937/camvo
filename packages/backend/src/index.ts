import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import bookingRoutes from './routes/bookings'
import webhookRoutes from './routes/webhooks'
import paymentRoutes from './routes/payments'

const app = express()
const PORT = process.env.PORT || 3001

// Stripe webhooks need raw body — handle before JSON middleware
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRoutes)

// Standard middleware
app.use(cors())
app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payments', paymentRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'camvo-backend', timestamp: new Date().toISOString() })
})

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Camvo backend running on http://localhost:${PORT}`)
})

export default app