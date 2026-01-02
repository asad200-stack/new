import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { generateSlug, validateEmail } from '@/lib/utils'
import { UserRole, StoreStatus } from '@prisma/client'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  storeName: z.string().min(2),
  storeDescription: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Check if store slug already exists
    const baseSlug = generateSlug(validated.storeName)
    const existingStores = await prisma.store.findMany({
      select: { slug: true },
    })
    const storeSlug = generateSlug(
      validated.storeName,
      existingStores.map((s) => s.slug)
    )

    // Hash password
    const hashedPassword = await hashPassword(validated.password)

    // Create user and store in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create store
      const store = await tx.store.create({
        data: {
          name: validated.storeName,
          slug: storeSlug,
          description: validated.storeDescription,
          status: StoreStatus.PENDING,
        },
      })

      // Create user
      const user = await tx.user.create({
        data: {
          name: validated.name,
          email: validated.email,
          password: hashedPassword,
          role: UserRole.STORE_OWNER,
          storeId: store.id,
        },
      })

      return { user, store }
    })

    // Generate token
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      storeId: result.user.storeId,
    })

    // Create response with cookie
    const response = NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        storeId: result.user.storeId,
      },
      store: {
        id: result.store.id,
        name: result.store.name,
        slug: result.store.slug,
      },
      token,
    })

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
