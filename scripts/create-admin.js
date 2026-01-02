/**
 * Script to create super admin user
 * Usage: node scripts/create-admin.js <email> <password>
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || process.env.SUPER_ADMIN_EMAIL || 'admin@platform.com'
  const password = process.argv[3] || process.env.SUPER_ADMIN_PASSWORD || 'admin123456'

  // Check if admin exists
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    console.log(`❌ User with email ${email} already exists`)
    process.exit(1)
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  })

  console.log(`✅ Super admin created successfully!`)
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${password}`)
  console.log(`   ID: ${admin.id}`)
  console.log(`\n⚠️  Please change the password after first login!`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
