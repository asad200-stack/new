import { PrismaClient, UserRole } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@platform.com'
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123456'

  // Check if super admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(superAdminPassword)
    
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: UserRole.SUPER_ADMIN,
      },
    })

    console.log(`✅ Super admin created:`)
    console.log(`   Email: ${superAdminEmail}`)
    console.log(`   Password: ${superAdminPassword}`)
    console.log(`   Please change the password after first login!`)
  } else {
    console.log(`ℹ️  Super admin already exists: ${superAdminEmail}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
