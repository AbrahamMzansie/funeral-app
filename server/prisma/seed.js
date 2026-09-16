import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// [memberNumber, fullName, contributionsCount, status, notes?]
// status omitted => ACTIVE. PROBATIONARY = joined recently, below the
// 3-contribution threshold for full membership.
const ROSTER = [
  [1, 'Sakhekile Ngwenya', 9],
  [2, 'Sipheni Sibanda', 9],
  [3, 'Selusiwe Masina', 9],
  [4, 'Snethemba Bhebhe', 9],
  [5, 'Dumekhaya Mpofu', 9],
  [6, 'Smelilizwe Khumalo', 9],
  [7, 'Nqobile Mpofu', 9],
  [8, 'Sbonguthando Bhebhe', 9],
  [9, 'Mehluli Ndlovu', 9],
  [10, 'Smangani Masuku', 9],
  [11, 'Nhlalo Dlomo', 9],
  [12, 'Leonard Msimanga', 9],
  [13, 'Reply White', 9],
  [14, 'President Manyathela', 9],
  [15, 'Janet Mhlanga', 9],
  // 16 skipped: blank in source roster, no name recorded
  [17, 'Sukoluhle Mkhwananzi', 9],
  [18, 'Qotho Sibanda', 9],
  [19, 'Casper Sibanda', 9],
  [20, 'Mirriam Mzizi', 9],
  [21, 'Nontokozo Sithole', 9],
  [22, 'Walter Masuku', 9],
  [23, 'Beauty Ncube', 9],
  [24, 'Handsome Moyo', 9],
  [25, 'Thenjiwe Mpofu', 9],
  [26, 'Sukoluhle Mpofu', 9],
  [27, 'Ntombikayise Khumalo', 9],
  [28, 'Honest Mpofu', 9],
  [29, 'Smangaliso Bhebhe', 9],
  [30, 'Sikhonzeni Thusi', 9],
  [31, 'Phaphamani Thusi', 9],
  [32, 'Nomagugu Mpofu', 9],
  [33, 'Gezekile Ncube', 9],
  [34, 'Mbongeni Khumalo', 9],
  [35, 'Silibaziso Ncube', 9],
  [36, 'Professor Sibanda', 9],
  [37, 'Sanelisiwe Dlomo', 9],
  [38, 'Sibonginkosi Mpofu', 9],
  [39, 'Mihlayifani Dlomo', 9],
  [40, 'Mhlupheki Tshuma', 9],
  [41, 'Nokuthaba Ngwenya', 9],
  [42, 'Mceco Thusi', 9],
  [43, 'Junior T Mutingwende', 9],
  [44, 'Jacob Mutingwende', 9],
  [45, 'Sithabile Joe Mhlanga', 9],
  [46, 'Doris Finity', 9],
  [47, 'Ntombizodwa Sibanda', 9],
  [48, 'Phumuzile Nkomazana', 9],
  [49, 'Mpikelelo Thusi', 9],
  [50, 'Primrose White', 9],
  [51, 'Nkosilamandla Mpofu', 2, 'PROBATIONARY'],
  [52, 'Sholine Bhebhe', 8, 'ACTIVE', 'Recently lost a family member — currently the beneficiary of an open collection; contribution count excludes that collection.'],
  [53, 'Givemore Khumalo', 9],
  [54, 'Godfrey Bhebhe', 9],
  [55, 'Nobuhle Moyo', 9],
  [56, 'Faith Bhebhe', 9],
  [57, 'Gloria Nkomazana', 9],
  [58, 'Sikhulekile Masilela', 9],
  [59, 'Sanelisiwe White', 9],
  [60, 'Thembekile Dlomo', 9],
  [61, 'Makhosazana Khumalo', 9],
  [62, 'Zinhle Thusi', 9],
  [63, 'Memory Sibanda', 9],
  [64, '(cancelled member — name not recorded)', 0, 'CANCELLED', 'Cancelled per WhatsApp roster note; original entry had no name.'],
  [65, 'Listen Mpofu', 9],
  [66, 'Sinanzeni Mhlanga', 9],
  [67, 'Sithabile Mhlanga', 9],
  [68, 'Gladys White', 9],
  [69, 'Zibusiso Masuku', 9],
  [70, 'Zanele Masuku', 9],
  [71, 'Mthabisi Masilela', 9],
  [72, 'Charity Masuku', 9],
  [73, 'Zanele Moyo', 9],
  [74, 'Savior Gwayi', 9],
  [75, 'Olesimo Masilela', 9],
  [76, 'Sitholinhlanhla Bhebhe', 9, 'ACTIVE', 'Marked "(2)" in source roster — holds 2 contribution slots.'],
  [77, 'Beatrice White', 9],
  [78, 'Mholi Masuku', 9],
  [79, 'Silothando Bhebhe', 9],
  [80, 'Nomatter Bhebhe', 9],
  [81, 'Sihle Bhebhe', 9, 'ACTIVE', 'Marked "(2)" in source roster — holds 2 contribution slots.'],
  [82, 'Sikhulekile Mpofu', 9],
  [83, 'Nosipho Phuthi', 9],
  [84, 'Latin Ndlovu', 9],
  [85, 'Bhekinkosi Masuku', 9],
  [86, 'Sithembinkosi Masuku', 9],
  [87, 'Siduduzile Ndiweni', 9],
  [88, 'Siloyisile Mhlanga', 9],
  [89, 'Sidumisile Mhlanga', 9, 'ACTIVE', 'Source roster marked this count with "?" — worth confirming with the member.'],
  [90, 'Nothando Mpofu', 9],
  [91, 'Sipho Masilela', 9],
  [92, 'Nomaqhawe Mpofu', 9],
  [93, 'Nqaba Ndlovu', 9],
  [94, 'Dumisani Bhebhe', 9],
  [95, 'Chantel Finity', 9],
  [96, 'Mavis Z Mzizi', 9],
  [97, 'Sithobekile Bhebhe', 9],
  [98, 'Sethuliwe Ndlovu', 1, 'PROBATIONARY', 'New member.'],
  [99, 'Lungisani Ndlovu', 9],
  [100, 'Sicelimpilo Bhebhe', 9],
  [101, 'Thembelani White', 9],
  [102, 'Betha Bhebhe', 9],
  [103, 'Simakade Moe Sibanda', 9],
  [104, 'Sithabisile Bhebhe', 9],
  [105, 'Mbonisi Khumalo', 9],
  [106, 'Mncedisi Ndlovu', 9],
  [107, 'Sithebe Sibanda', 9],
  [108, 'Bukhosi Khumalo', 9],
  [109, 'Purity Ncube', 9],
  [110, 'Siphosami Bhebhe', 9],
  [111, 'Blessing White', 9],
  [112, 'Aleck Ndiweni', 9],
  [113, 'Eunice Dube', 9],
  [114, 'Gladys Thusi', 9],
  [115, 'Manners Dube', 9],
  [116, 'Thembinkosi Dlomo', 9],
  [117, 'Dalumuzi Khumalo', 9],
  [118, 'Future Masuku', 9],
  [119, 'Loveness Masuku', 9],
  [120, 'Sonani Mhlanga', 9],
  [121, 'Themba Mjue Masilela', 9],
  [122, 'Linety Khumalo', 9],
  [123, 'Grace Bhebhe', 9, 'ACTIVE', 'Source roster had an extra unexplained "N" marker next to this entry.'],
  [124, 'Silenkosi Bhebhe', 9],
  [125, 'Nkosiyazi Mpofu', 9],
  [126, 'Mavis Sdue Ndlovu', 9],
  [127, 'Phumulani Ndlovu', 1, 'PROBATIONARY', 'New member.'],
  [128, 'Khulekani Sibanda', 9],
  [129, 'Nigel N White', 9],
  [130, 'Pronifer White', 9],
  [131, 'Duduzile Sibanda', 9],
  [132, 'Busani Sibanda', 9],
  [133, 'Pretty Mthethwa', 9],
  [134, 'Nqaba Ndiweni', 9],
  [135, 'Siphetho Masina', 9],
  [136, 'Khethiwe Ngwenya', 9],
  [137, 'Mxoxisi Mpofu', 9],
  [138, 'Talitha Sibanda', 9],
  [139, 'Rosina White', 9],
  [140, 'Melamakhosi Moyo', 9],
  [141, 'Patience Bhebhe', 9],
  [142, 'Sakheni Ncube', 9],
  [143, 'Thelma Mpofu', 9],
  [144, 'Moment Bhebhe', 9],
  [145, 'Mkhulisi Mzizi', 9],
  [146, 'Mxolisi Bhebhe', 9],
  [147, 'Silethokuhle Bhebhe', 9],
  [148, 'Simiso Bhebhe', 9],
  [149, 'Nobukhosi Ncube', 9],
  [150, 'Anele Moyo', 9],
  [151, 'Gugulethu Nyathi', 9],
  [152, 'Ayanda Nyathi', 9],
  [153, 'Abigail Mpofu', 9],
  [154, 'Sizalobuhle Bhebhe', 9],
  [155, 'Silobuhle Bhebhe', 9],
  [156, 'Shylet Mpofu', 9],
  [157, 'Princess Mzizi', 9],
  [158, 'Anitha Mzizi', 9],
  [159, 'Nothabo Phuthi', 9],
  [160, 'Siphathisiwe Masilela', 9],
  [161, 'Sehliselo Ncube', 9],
  [162, 'Mqhuzula Nyathi', 9],
  [163, 'Kwanele Mpofu', 9],
  [164, 'Talent Mpofu', 9],
  [165, 'Ida Mpofu', 2, 'PROBATIONARY', 'New member.'],
  [166, 'Showlast', 1, 'PROBATIONARY', 'New member.'],
]

// Member numbers marked ⚫ in the source roster: they have personally been
// the beneficiary of a past collection (their own family member passed away).
const HAS_BEEN_BENEFICIARY = new Set([6, 18, 19, 40, 52, 96, 110, 126, 133])

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  const adminName = process.env.SEED_ADMIN_NAME || 'Admin'

  if (!adminEmail || !adminPassword) {
    throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before running the seed script.')
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12)
  const admin = await prisma.admin.upsert({
    where: { email: adminEmail.toLowerCase().trim() },
    update: {},
    create: { name: adminName, email: adminEmail.toLowerCase().trim(), passwordHash },
  })
  console.log(`Admin ready: ${admin.email}`)

  const membersWithPayments = new Set(
    (await prisma.payment.findMany({ select: { memberId: true }, distinct: ['memberId'] })).map((p) => p.memberId)
  )
  const existingByNumber = new Map(
    (await prisma.member.findMany({ select: { id: true, memberNumber: true } })).map((m) => [m.memberNumber, m.id])
  )

  let created = 0
  for (const [memberNumber, fullName, contributionsCount, status = 'ACTIVE', notes = null] of ROSTER) {
    const existingId = existingByNumber.get(memberNumber)
    const hasRealPayments = existingId && membersWithPayments.has(existingId)

    await prisma.member.upsert({
      where: { memberNumber },
      // Once a member has real payments recorded through the app, never overwrite
      // their count/status from the original roster baseline on a re-seed.
      update: hasRealPayments
        ? { fullName, notes }
        : { fullName, contributionsCount, status, notes, hasBeenBeneficiary: HAS_BEEN_BENEFICIARY.has(memberNumber) },
      create: {
        memberNumber,
        fullName,
        contributionsCount,
        status,
        notes,
        hasBeenBeneficiary: HAS_BEEN_BENEFICIARY.has(memberNumber),
      },
    })
    created += 1
  }
  console.log(`Members seeded: ${created}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
