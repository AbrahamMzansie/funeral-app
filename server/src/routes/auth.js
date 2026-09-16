import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!admin) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const valid = await bcrypt.compare(password, admin.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = jwt.sign(
    { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )

  res.json({
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  })
})

router.get('/me', requireAuth, async (req, res) => {
  res.json({ admin: req.admin })
})

export default router
