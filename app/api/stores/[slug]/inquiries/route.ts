import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createInquirySchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
})

export async function POST(
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

    const body = await request.json()
    const validated = createInquirySchema.parse(body)

    // Verify product exists if provided
    if (validated.productId) {
      const product = await prisma.product.findFirst({
        where: {
          id: validated.productId,
          storeId: store.id,
        },
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        storeId: store.id,
        productId: validated.productId || null,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        message: validated.message,
      },
    })

    return NextResponse.json({ inquiry }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 }
    )
  }
}
