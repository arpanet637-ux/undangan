import { putFile } from '@/lib/storage'
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

    // Photos are stored in Netlify Blobs and served through the /api/file proxy,
    // so the stored /api/file?pathname=... URL stays valid permanently.
    const blob = await putFile(filename, file)

    return NextResponse.json({ url: blob.url, pathname: blob.pathname })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[v0] Upload error:', errorMsg, error)
    return NextResponse.json({ error: 'Upload failed', details: errorMsg }, { status: 500 })
  }
}
