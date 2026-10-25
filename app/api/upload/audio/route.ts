import { putFile } from '@/lib/storage'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type - only MP3
    if (file.type !== 'audio/mpeg' && !file.name.toLowerCase().endsWith('.mp3')) {
      return NextResponse.json({ error: 'Invalid file type. Only MP3 files are allowed.' }, { status: 400 })
    }

    // Validate file size (max 50MB for audio)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit.' }, { status: 400 })
    }

    // Generate unique filename with just timestamp
    const timestamp = Date.now()
    const ext = '.mp3'
    const filename = `audio-${timestamp}${ext}`

    // Stored in Netlify Blobs and served through the /api/file proxy.
    const blob = await putFile(filename, file)

    return NextResponse.json({ 
      url: blob.url,
      pathname: blob.pathname,
      success: true 
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[v0] Audio upload error:', errorMsg)
    return NextResponse.json({ error: errorMsg || 'Upload failed' }, { status: 500 })
  }
}
