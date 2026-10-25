import { putFile } from '@/lib/storage'
import { NextResponse } from 'next/server'

// Uploads pass through a serverless function, whose request body is capped at ~6 MB.
const MAX_SIZE = 6 * 1024 * 1024
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang dikirim.' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Gunakan MP4, WebM, atau MOV.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ukuran video maksimal 6 MB.' }, { status: 400 })
    }

    const blob = await putFile(`videos/${file.name}`, file)
    return NextResponse.json({ url: blob.url, pathname: blob.pathname })
  } catch (error) {
    console.error('[v0] Video upload error:', error)
    return NextResponse.json({ error: 'Upload video gagal.' }, { status: 500 })
  }
}
