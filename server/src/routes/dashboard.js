import { Router } from 'express'
import { prisma } from '../prisma.js'

const router = Router()

router.get('/', async (req, res) => {
  const [activeMembers, probationaryMembers, cancelledMembers, openFunerals, closedFuneralsCount, allPayments] =
    await Promise.all([
      prisma.member.count({ where: { status: 'ACTIVE' } }),
      prisma.member.count({ where: { status: 'PROBATIONARY' } }),
      prisma.member.count({ where: { status: 'CANCELLED' } }),
      prisma.funeralEvent.findMany({
        where: { status: 'OPEN' },
        include: { beneficiaryMember: true, payments: true },
        orderBy: { dateOpened: 'desc' },
      }),
      prisma.funeralEvent.count({ where: { status: 'CLOSED' } }),
      prisma.payment.findMany({ select: { amount: true } }),
    ])

  const allTimeCollected = allPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalMembers = activeMembers + probationaryMembers + cancelledMembers

  res.json({
    activeMembers,
    probationaryMembers,
    cancelledMembers,
    totalMembers,
    closedFuneralsCount,
    allTimeCollected,
    openFunerals: openFunerals.map((f) => ({
      ...f,
      totalCollected: f.payments.reduce((sum, p) => sum + Number(p.amount), 0),
      paidCount: f.payments.length,
    })),
  })
})

export default router
