import { NextRequest, NextResponse } from 'next/server'
import { requireStoreOwner } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const authResult = await requireStoreOwner(request)
  if ('error' in authResult) {
    return authResult.error
  }

  const { storeId } = authResult
  const status = request.nextUrl.searchParams.get('status')

  try {
    const inquiries = await prisma.inquiry.findMany({
      where: {
        storeId,
        status: status || undefined,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ inquiries })
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
}
