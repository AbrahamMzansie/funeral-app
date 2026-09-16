import { Router } from 'express'
import { prisma } from '../prisma.js'

const router = Router()

router.get('/', async (req, res) => {
  const { q, status } = req.query

  const where = { ...(status ? { status } : {}) }

  if (q) {
    const or = [{ fullName: { contains: q, mode: 'insensitive' } }]
    const asNumber = Number(q)
    if (!Number.isNaN(asNumber)) or.push({ memberNumber: asNumber })
    where.OR = or
  }

  const members = await prisma.member.findMany({
    where,
    orderBy: { memberNumber: 'asc' },
  })

  res.json({ members })
})

router.post('/', async (req, res) => {
  const { memberNumber, fullName, phone, status, notes } = req.body || {}

  if (!memberNumber || !fullName) {
    return res.status(400).json({ error: 'memberNumber and fullName are required' })
  }

  try {
    const member = await prisma.member.create({
      data: {
        memberNumber: Number(memberNumber),
        fullName: fullName.trim(),
        phone: phone?.trim() || null,
        status: status || 'PROBATIONARY',
        notes: notes?.trim() || null,
      },
    })
    res.status(201).json({ member })
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: `Member number ${memberNumber} is already in use` })
    }
    throw err
  }
})

router.get('/:id', async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { id: req.params.id },
    include: {
      payments: {
        include: { funeralEvent: true },
        orderBy: { paidAt: 'desc' },
      },
      beneficiaryOf: true,
    },
  })

  if (!member) return res.status(404).json({ error: 'Member not found' })
  res.json({ member })
})

router.patch('/:id', async (req, res) => {
  const { fullName, phone, status, notes } = req.body || {}

  const data = {}
  if (fullName !== undefined) data.fullName = fullName.trim()
  if (phone !== undefined) data.phone = phone?.trim() || null
  if (notes !== undefined) data.notes = notes?.trim() || null
  if (status !== undefined) {
    data.status = status
    data.cancelledAt = status === 'CANCELLED' ? new Date() : null
  }

  try {
    const member = await prisma.member.update({ where: { id: req.params.id }, data })
    res.json({ member })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Member not found' })
    throw err
  }
})

export default router
