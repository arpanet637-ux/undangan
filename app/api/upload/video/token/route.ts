import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

const MAX_SIZE = 100 * 1024 * 1024
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_TYPES,
        maximumSizeInBytes: MAX_SIZE,
        addRandomSuffix: true,
      }),
    })
    return NextResponse.json(response)
  } catch (error) {
    console.error('[v0] Video token error:', error)
    return NextResponse.json({ error: 'Gagal menyiapkan upload video.' }, { status: 500 })
  }
}
