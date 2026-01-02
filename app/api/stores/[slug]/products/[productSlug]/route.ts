import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; productSlug: string } }
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

    const product = await prisma.product.findFirst({
      where: {
        storeId: store.id,
        slug: params.productSlug,
        status: 'ACTIVE',
        isVisible: true,
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
          orderBy: {
            order: 'asc',
          },
        },
        variations: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Increment view count (async)
    prisma.product.update({
      where: { id: product.id },
      data: {
        viewCount: { increment: 1 },
      },
    }).catch(console.error)

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
