import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// The 9 historical funeral collections behind every member's starting
// contributionsCount=9 baseline. No per-member payment breakdown exists for
// these (only roster-level counts), so they're recorded as closed events
// with no itemized Payments — consistent with how the seed roster itself
// carries the count as a baseline rather than fabricating payment rows.
const FUNERALS = [
  {
    deceasedName: "Mavis Z Mzizi's father",
    beneficiaryNumbers: [96],
    date: '2024-06-24',
    notes: null,
  },
  {
    deceasedName: 'Sipho Bhebhe (stillborn)',
    beneficiaryNumbers: [110],
    date: '2024-08-01',
    notes: 'Exact day not given (source said "August 2024") — using 1st of month as placeholder. Recorded amount collected: R50 (no per-member breakdown available).',
  },
  {
    deceasedName: "Smelilizwe Khumalo's son",
    beneficiaryNumbers: [6],
    date: '2025-01-01',
    notes: 'Exact day not given (source said "January 2025") — using 1st of month as placeholder.',
  },
  {
    deceasedName: "Pretty Mthethwa's father",
    beneficiaryNumbers: [133],
    date: '2025-06-01',
    notes: 'Exact day not given (source said "June 2025") — using 1st of month as placeholder.',
  },
  {
    deceasedName: "Mavis Sdue Ndlovu's father",
    beneficiaryNumbers: [126],
    date: '2025-07-31',
    notes: null,
  },
  {
    deceasedName: "Casper & Qotho Sibanda's father",
    beneficiaryNumbers: [19, 18],
    date: '2026-01-06',
    notes: 'Shared collection for both Casper Sibanda (#19) and Qotho Sibanda (#18), whose father passed away. Casper recorded as the primary beneficiary; Qotho is also linked to this event.',
  },
  {
    deceasedName: "Mhlupheki Tshuma's mother",
    beneficiaryNumbers: [40],
    date: '2026-06-08',
    notes: null,
  },
  {
    deceasedName: 'Nhlanhla Masilela',
    beneficiaryNumbers: [],
    date: '2026-06-10',
    notes: 'Nhlanhla Masilela was a member of the society who has since passed away — this collection was for their own funeral, not a relative\'s. They are no longer in the current member roster.',
  },
  {
    deceasedName: "Sholine Bhebhe's mother",
    beneficiaryNumbers: [52],
    date: '2026-06-12',
    notes: 'Recorded amount collected: R16,300 (per the WhatsApp roster note, no per-member breakdown available).',
  },
]

async function main() {
  for (const f of FUNERALS) {
    const existing = await prisma.funeralEvent.findFirst({ where: { deceasedName: f.deceasedName } })
    if (existing) {
      console.log(`Skipping (already exists): ${f.deceasedName}`)
      continue
    }

    const primaryBeneficiaryId = f.beneficiaryNumbers.length
      ? (await prisma.member.findUnique({ where: { memberNumber: f.beneficiaryNumbers[0] } }))?.id ?? null
      : null

    const date = new Date(f.date)
    const funeral = await prisma.funeralEvent.create({
      data: {
        deceasedName: f.deceasedName,
        beneficiaryMemberId: primaryBeneficiaryId,
        dateOpened: date,
        dateClosed: date,
        status: 'CLOSED',
        notes: f.notes,
      },
    })
    console.log(`Created: ${funeral.deceasedName} (${f.date})`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
