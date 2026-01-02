import { NextRequest, NextResponse } from 'next/server'
import { requireStoreOwner } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'
import { uploadImage } from '@/lib/upload'

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  currency: z.string().default('USD'),
  sku: z.string().optional(),
  stockQuantity: z.number().int().default(0),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isVisible: z.boolean().default(true),
  specifications: z.record(z.any()).optional(),
})

export async function GET(request: NextRequest) {
  const authResult = await requireStoreOwner(request)
  if ('error' in authResult) {
    return authResult.error
  }

  const { storeId } = authResult
  const categoryId = request.nextUrl.searchParams.get('categoryId')
  const status = request.nextUrl.searchParams.get('status')
  const search = request.nextUrl.searchParams.get('search')

  try {
    const products = await prisma.product.findMany({
      where: {
        storeId,
        categoryId: categoryId || undefined,
        status: status ? (status as any) : undefined,
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
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
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            variations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireStoreOwner(request)
  if ('error' in authResult) {
    return authResult.error
  }

  const { storeId } = authResult

  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const price = parseFloat(formData.get('price') as string)
    const salePrice = formData.get('salePrice')
      ? parseFloat(formData.get('salePrice') as string)
      : undefined
    const currency = (formData.get('currency') as string) || 'USD'
    const sku = formData.get('sku') as string | null
    const stockQuantity = parseInt(formData.get('stockQuantity') as string) || 0
    const categoryId = formData.get('categoryId') as string | null
    const tags = formData.get('tags')
      ? JSON.parse(formData.get('tags') as string)
      : []
    const isVisible = formData.get('isVisible') === 'true'
    const specifications = formData.get('specifications')
      ? JSON.parse(formData.get('specifications') as string)
      : undefined

    // Validate
    const validated = createProductSchema.parse({
      name,
      description,
      price,
      salePrice,
      currency,
      sku,
      stockQuantity,
      categoryId,
      tags,
      isVisible,
      specifications,
    })

    // Generate slug
    const existingProducts = await prisma.product.findMany({
      where: { storeId },
      select: { slug: true },
    })
    const slug = generateSlug(
      validated.name,
      existingProducts.map((p) => p.slug)
    )

    // Create product
    const product = await prisma.product.create({
      data: {
        storeId,
        name: validated.name,
        slug,
        description: validated.description || null,
        price: validated.price,
        salePrice: validated.salePrice || null,
        currency: validated.currency,
        sku: validated.sku || null,
        stockQuantity: validated.stockQuantity,
        categoryId: validated.categoryId || null,
        tags: validated.tags,
        isVisible: validated.isVisible,
        specifications: validated.specifications,
        status: 'ACTIVE',
      },
    })

    // Handle image uploads
    const imageFiles = formData.getAll('images') as File[]
    if (imageFiles.length > 0) {
      const imageUploads = await Promise.all(
        imageFiles.map(async (file, index) => {
          const uploadResult = await uploadImage(file, `products/${product.id}`)
          return {
            productId: product.id,
            url: uploadResult.url,
            order: index,
            isPrimary: index === 0,
          }
        })
      )

      await prisma.productImage.createMany({
        data: imageUploads,
      })
    }

    // Fetch product with relations
    const productWithRelations = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: true,
      },
    })

    return NextResponse.json({ product: productWithRelations }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
