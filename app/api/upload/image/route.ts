import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`

    // This project uses a PRIVATE Blob store. Photos are served through the
    // /api/file proxy which streams the content server-side with the token,
    // so the stored /api/file?pathname=... URL stays valid permanently.
    const blob = await put(filename, file, {
      access: 'private',
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url, pathname: blob.pathname })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[v0] Upload error:', errorMsg, error)
    return NextResponse.json({ error: 'Upload failed', details: errorMsg }, { status: 500 })
  }
}
