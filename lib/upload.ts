import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB

export interface UploadResult {
  url: string
  filename: string
  size: number
}

export async function uploadImage(
  file: File,
  folder: string = 'general'
): Promise<UploadResult> {
  if (!file) {
    throw new Error('No file provided')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Generate unique filename
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  const extension = file.name.split('.').pop() || 'jpg'
  const filename = `${timestamp}-${randomStr}.${extension}`

  // Create directory if it doesn't exist
  const dirPath = join(UPLOAD_DIR, folder)
  await mkdir(dirPath, { recursive: true })

  // Optimize and resize image using sharp
  const optimizedBuffer = await sharp(buffer)
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer()

  // Save file
  const filePath = join(dirPath, filename)
  await writeFile(filePath, optimizedBuffer)

  // Return URL path (relative to public directory)
  const url = `/uploads/${folder}/${filename}`

  return {
    url,
    filename,
    size: optimizedBuffer.length,
  }
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const { unlink } = await import('fs/promises')
    const { join } = await import('path')
    
    // Remove /uploads/ prefix to get file path
    const relativePath = url.replace(/^\/uploads\//, '')
    const filePath = join(UPLOAD_DIR, relativePath)
    
    await unlink(filePath)
  } catch (error) {
    // File might not exist, that's okay
    console.error('Error deleting image:', error)
  }
}
