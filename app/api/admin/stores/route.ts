import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { StoreStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  const authResult = await requireSuperAdmin(request)
  if ('error' in authResult) {
    return authResult.error
  }

  try {
    const status = request.nextUrl.searchParams.get('status')
    const stores = await prisma.store.findMany({
      where: status
        ? {
            status: status as StoreStatus,
          }
        : undefined,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ stores })
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireSuperAdmin(request)
  if ('error' in authResult) {
    return authResult.error
  }

  try {
    const body = await request.json()
    const { storeId, status } = body

    if (!storeId || !status) {
      return NextResponse.json(
        { error: 'Store ID and status are required' },
        { status: 400 }
      )
    }

    const store = await prisma.store.update({
      where: { id: storeId },
      data: { status: status as StoreStatus },
    })

    return NextResponse.json({ store })
  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json(
      { error: 'Failed to update store' },
      { status: 500 }
    )
  }
}
