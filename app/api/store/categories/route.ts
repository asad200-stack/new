import { NextRequest, NextResponse } from 'next/server'
import { requireStoreOwner } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().int().default(0),
})

export async function GET(request: NextRequest) {
  const authResult = await requireStoreOwner(request)
  if ('error' in authResult) {
    return authResult.error
  }

  const { storeId } = authResult

  try {
    const categories = await prisma.category.findMany({
      where: {
        storeId,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
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
    const body = await request.json()
    const validated = createCategorySchema.parse(body)

    // Generate slug
    const existingCategories = await prisma.category.findMany({
      where: { storeId },
      select: { slug: true },
    })
    const slug = generateSlug(
      validated.name,
      existingCategories.map((c) => c.slug)
    )

    const category = await prisma.category.create({
      data: {
        storeId,
        name: validated.name,
        slug,
        description: validated.description || null,
        parentId: validated.parentId || null,
        order: validated.order,
      },
      include: {
        parent: true,
        children: true,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
