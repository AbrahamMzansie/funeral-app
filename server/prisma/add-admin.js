import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME || 'Admin'

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.')
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const admin = await prisma.admin.upsert({
    where: { email: email.toLowerCase().trim() },
    update: { passwordHash, name },
    create: { name, email: email.toLowerCase().trim(), passwordHash },
  })
  console.log(`Admin ready: ${admin.email}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
