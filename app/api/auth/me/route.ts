import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if ('error' in authResult) {
    return authResult.error
  }

  const { user } = authResult

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        store: true,
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        storeId: dbUser.storeId,
      },
      store: dbUser.store
        ? {
            id: dbUser.store.id,
            name: dbUser.store.name,
            slug: dbUser.store.slug,
            status: dbUser.store.status,
          }
        : null,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
