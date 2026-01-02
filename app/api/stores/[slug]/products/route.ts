import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Verify store exists and is active
    const store = await prisma.store.findUnique({
      where: {
        slug: params.slug,
        status: 'ACTIVE',
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const categoryId = request.nextUrl.searchParams.get('categoryId')
    const search = request.nextUrl.searchParams.get('search')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

    // Only return visible, active products
    const products = await prisma.product.findMany({
      where: {
        storeId: store.id,
        status: 'ACTIVE',
        isVisible: true,
        categoryId: categoryId || undefined,
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { tags: { has: search } },
            ]
          : undefined,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          where: {
            isPrimary: true,
          },
          take: 1,
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    // Increment view count (async, don't wait)
    prisma.product.updateMany({
      where: {
        id: { in: products.map((p) => p.id) },
      },
      data: {
        viewCount: { increment: 1 },
      },
    }).catch(console.error)

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching store products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
