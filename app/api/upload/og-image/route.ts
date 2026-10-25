import { putFile } from '@/lib/storage'
import { NextResponse } from 'next/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024

// Server-side FormData upload (same pattern as /api/upload/image) instead of the
// client-direct-to-blob token flow. The OG thumbnail is compressed to ~1200x630 in
// the browser before it ever reaches this route, so it stays well under serverless
// body-size limits — this keeps the upload path simple, same-origin, and reliable.
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang dikirim.' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Thumbnail harus JPG, PNG, atau WebP.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ukuran thumbnail maksimal 10 MB.' }, { status: 400 })
    }

    const filename = `og-thumbnails/${Date.now()}-${file.name}`
    // Stored in Netlify Blobs. We save the /api/file?pathname=... proxy path — the
    // admin preview <img> can load it directly, and /api/og-image/[slug] extracts the
    // pathname from it to stream the blob server-side.
    const blob = await putFile(filename, file)

    return NextResponse.json({ url: `/api/file?pathname=${encodeURIComponent(blob.pathname)}` })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[v0] OG thumbnail upload error:', errorMsg, error)
    return NextResponse.json({ error: 'Upload thumbnail gagal.' }, { status: 500 })
  }
}
