import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import memberRoutes from './routes/members.js'
import funeralRoutes from './routes/funerals.js'
import dashboardRoutes from './routes/dashboard.js'
import { requireAuth } from './middleware/auth.js'

export function createApp() {
  const app = express()

  const isDev = process.env.NODE_ENV !== 'production'
  app.use(
    cors({
      origin: isDev
        ? /^http:\/\/(localhost|127\.0\.0\.1):\d+$/
        : process.env.CLIENT_ORIGIN,
    })
  )
  app.use(express.json())

  app.get('/api/health', (req, res) => res.json({ ok: true }))

  app.use('/api/auth', authRoutes)
  app.use('/api/members', requireAuth, memberRoutes)
  app.use('/api/funerals', requireAuth, funeralRoutes)
  app.use('/api/dashboard', requireAuth, dashboardRoutes)

  app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong on the server' })
  })

  return app
}
