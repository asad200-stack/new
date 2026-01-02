import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const store = await prisma.store.findUnique({
      where: {
        slug: params.slug,
        status: 'ACTIVE', // Only return active stores
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE',
                isVisible: true,
              },
            },
          },
        },
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Remove sensitive data
    const { settings, theme, ...publicStore } = store

    return NextResponse.json({
      store: {
        ...publicStore,
        productCount: store._count.products,
      },
    })
  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json(
      { error: 'Failed to fetch store' },
      { status: 500 }
    )
  }
}
