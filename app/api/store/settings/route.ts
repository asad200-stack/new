import { NextRequest, NextResponse } from 'next/server'
import { requireStoreOwner } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { uploadImage, deleteImage } from '@/lib/upload'

const updateStoreSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  theme: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
})

export async function GET(request: NextRequest) {
  const authResult = await requireStoreOwner(request)
  if ('error' in authResult) {
    return authResult.error
  }

  const { storeId } = authResult

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    return NextResponse.json({ store })
  } catch (error) {
    console.error('Error fetching store settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch store settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireStoreOwner(request)
  if ('error' in authResult) {
    return authResult.error
  }

  const { storeId } = authResult

  try {
    const formData = await request.formData()
    const name = formData.get('name') as string | null
    const description = formData.get('description') as string | null
    const contactEmail = formData.get('contactEmail') as string | null
    const contactPhone = formData.get('contactPhone') as string | null
    const contactAddress = formData.get('contactAddress') as string | null
    const theme = formData.get('theme')
      ? JSON.parse(formData.get('theme') as string)
      : undefined
    const settings = formData.get('settings')
      ? JSON.parse(formData.get('settings') as string)
      : undefined

    const validated = updateStoreSchema.parse({
      name,
      description,
      contactEmail,
      contactPhone,
      contactAddress,
      theme,
      settings,
    })

    // Handle logo upload
    const logoFile = formData.get('logo') as File | null
    let logoUrl: string | undefined = undefined

    if (logoFile && logoFile.size > 0) {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { logo: true },
      })

      if (store?.logo) {
        await deleteImage(store.logo)
      }

      const uploadResult = await uploadImage(logoFile, `stores/${storeId}`)
      logoUrl = uploadResult.url
    }

    // Handle cover image upload
    const coverFile = formData.get('coverImage') as File | null
    let coverUrl: string | undefined = undefined

    if (coverFile && coverFile.size > 0) {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { coverImage: true },
      })

      if (store?.coverImage) {
        await deleteImage(store.coverImage)
      }

      const uploadResult = await uploadImage(coverFile, `stores/${storeId}`)
      coverUrl = uploadResult.url
    }

    const updateData: any = { ...validated }
    if (logoUrl) updateData.logo = logoUrl
    if (coverUrl) updateData.coverImage = coverUrl

    const store = await prisma.store.update({
      where: { id: storeId },
      data: updateData,
    })

    return NextResponse.json({ store })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating store:', error)
    return NextResponse.json(
      { error: 'Failed to update store' },
      { status: 500 }
    )
  }
}
