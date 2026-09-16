import { Router } from 'express'
import { prisma } from '../prisma.js'

const router = Router()

function withTotal(funeral) {
  const totalCollected = funeral.payments.reduce((sum, p) => sum + Number(p.amount), 0)
  return { ...funeral, totalCollected }
}

router.get('/', async (req, res) => {
  const { status } = req.query
  const funerals = await prisma.funeralEvent.findMany({
    where: status ? { status } : undefined,
    include: { beneficiaryMember: true, payments: true },
    orderBy: { dateOpened: 'desc' },
  })
  res.json({ funerals: funerals.map(withTotal) })
})

router.post('/', async (req, res) => {
  const {
    deceasedName,
    beneficiaryMemberId,
    collectionAccountNo,
    collectionAccountHolder,
    collectionBank,
    collectionEwallet,
    collectionEcocash,
    notes,
  } = req.body || {}

  if (!deceasedName) {
    return res.status(400).json({ error: 'deceasedName is required' })
  }

  const funeral = await prisma.funeralEvent.create({
    data: {
      deceasedName: deceasedName.trim(),
      beneficiaryMemberId: beneficiaryMemberId || null,
      collectionAccountNo: collectionAccountNo?.trim() || null,
      collectionAccountHolder: collectionAccountHolder?.trim() || null,
      collectionBank: collectionBank?.trim() || null,
      collectionEwallet: collectionEwallet?.trim() || null,
      collectionEcocash: collectionEcocash?.trim() || null,
      notes: notes?.trim() || null,
    },
  })

  if (beneficiaryMemberId) {
    await prisma.member.update({
      where: { id: beneficiaryMemberId },
      data: { hasBeenBeneficiary: true },
    })
  }

  res.status(201).json({ funeral })
})

router.get('/:id', async (req, res) => {
  const funeral = await prisma.funeralEvent.findUnique({
    where: { id: req.params.id },
    include: {
      beneficiaryMember: true,
      payments: { include: { member: true, recordedByAdmin: true } },
    },
  })
  if (!funeral) return res.status(404).json({ error: 'Funeral not found' })

  const members = await prisma.member.findMany({
    where: { status: { not: 'CANCELLED' } },
    orderBy: { memberNumber: 'asc' },
  })

  const paidByMemberId = new Map(funeral.payments.map((p) => [p.memberId, p]))
  const roster = members.map((member) => ({
    member,
    payment: paidByMemberId.get(member.id) || null,
  }))

  res.json({ funeral: withTotal(funeral), roster })
})

router.patch('/:id', async (req, res) => {
  const { deceasedName, status, notes, collectionAccountNo, collectionAccountHolder, collectionBank, collectionEwallet, collectionEcocash } = req.body || {}

  const data = {}
  if (deceasedName !== undefined) data.deceasedName = deceasedName.trim()
  if (notes !== undefined) data.notes = notes?.trim() || null
  if (collectionAccountNo !== undefined) data.collectionAccountNo = collectionAccountNo?.trim() || null
  if (collectionAccountHolder !== undefined) data.collectionAccountHolder = collectionAccountHolder?.trim() || null
  if (collectionBank !== undefined) data.collectionBank = collectionBank?.trim() || null
  if (collectionEwallet !== undefined) data.collectionEwallet = collectionEwallet?.trim() || null
  if (collectionEcocash !== undefined) data.collectionEcocash = collectionEcocash?.trim() || null
  if (status !== undefined) {
    data.status = status
    data.dateClosed = status === 'CLOSED' ? new Date() : null
  }

  try {
    const funeral = await prisma.funeralEvent.update({ where: { id: req.params.id }, data })
    res.json({ funeral })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Funeral not found' })
    throw err
  }
})

router.put('/:id/payments/:memberId', async (req, res) => {
  const { id: funeralEventId, memberId } = req.params
  const { amount, method, reference, notes, paidAt, slipImage } = req.body || {}

  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return res.status(400).json({ error: 'A valid amount is required' })
  }

  if (slipImage && !/^data:image\/(jpeg|jpg|png|webp);base64,/.test(slipImage)) {
    return res.status(400).json({ error: 'Slip image must be a JPEG, PNG, or WEBP image' })
  }

  const member = await prisma.member.findUnique({ where: { id: memberId } })
  if (!member) return res.status(404).json({ error: 'Member not found' })

  const funeral = await prisma.funeralEvent.findUnique({ where: { id: funeralEventId } })
  if (!funeral) return res.status(404).json({ error: 'Funeral not found' })

  const existing = await prisma.payment.findUnique({
    where: { memberId_funeralEventId: { memberId, funeralEventId } },
  })

  const payment = await prisma.payment.upsert({
    where: { memberId_funeralEventId: { memberId, funeralEventId } },
    update: {
      amount: Number(amount),
      method: method || 'EFT',
      reference: reference?.trim() || String(member.memberNumber),
      notes: notes?.trim() || null,
      recordedByAdminId: req.admin.id,
      ...(paidAt ? { paidAt: new Date(paidAt) } : {}),
      ...(slipImage !== undefined ? { slipImage } : {}),
    },
    create: {
      memberId,
      funeralEventId,
      amount: Number(amount),
      method: method || 'EFT',
      reference: reference?.trim() || String(member.memberNumber),
      notes: notes?.trim() || null,
      recordedByAdminId: req.admin.id,
      slipImage: slipImage || null,
      ...(paidAt ? { paidAt: new Date(paidAt) } : {}),
    },
  })

  if (!existing) {
    await prisma.member.update({
      where: { id: memberId },
      data: {
        contributionsCount: { increment: 1 },
        ...(member.status === 'PROBATIONARY' && member.contributionsCount + 1 >= 3
          ? { status: 'ACTIVE' }
          : {}),
      },
    })
  }

  res.json({ payment })
})

router.delete('/:id/payments/:memberId', async (req, res) => {
  const { id: funeralEventId, memberId } = req.params

  const existing = await prisma.payment.findUnique({
    where: { memberId_funeralEventId: { memberId, funeralEventId } },
  })
  if (!existing) return res.status(404).json({ error: 'Payment not found' })

  await prisma.payment.delete({ where: { id: existing.id } })

  const member = await prisma.member.findUnique({ where: { id: memberId } })
  await prisma.member.update({
    where: { id: memberId },
    data: {
      contributionsCount: { decrement: 1 },
      ...(member.status === 'ACTIVE' && member.contributionsCount - 1 < 3
        ? { status: 'PROBATIONARY' }
        : {}),
    },
  })

  res.status(204).end()
})

export default router
