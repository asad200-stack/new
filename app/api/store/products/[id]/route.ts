import { NextRequest, NextResponse } from 'next/server'
import { requireStoreOwner } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'
import { uploadImage, deleteImage } from '@/lib/upload'

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  currency: z.string().optional(),
  sku: z.string().optional(),
  stockQuantity: z.number().int().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isVisible: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
  specifications: z.record(z.any()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireStoreOwner(request)
  if ('error' in authResult) {
    return authResult.error
  }

  const { storeId } = authResult

  try {
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        storeId,
      },
      include: {
        category: true,
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

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireStoreOwner(request)
  if ('error' in authResult) {
    return authResult.error
  }

  const { storeId } = authResult

  try {
    const body = await request.json()
    const validated = updateProductSchema.parse(body)

    // Check product exists and belongs to store
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        storeId,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Update slug if name changed
    let slug = existingProduct.slug
    if (validated.name && validated.name !== existingProduct.name) {
      const existingProducts = await prisma.product.findMany({
        where: { storeId },
        select: { slug: true },
      })
      slug = generateSlug(
        validated.name,
        existingProducts.map((p) => p.slug)
      )
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...validated,
        slug,
      },
      include: {
        category: true,
        images: true,
        variations: true,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireStoreOwner(request)
  if ('error' in authResult) {
    return authResult.error
  }

  const { storeId } = authResult

  try {
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        storeId,
      },
      include: {
        images: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete images
    for (const image of product.images) {
      await deleteImage(image.url)
    }

    // Delete product (cascade will handle images in DB)
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
