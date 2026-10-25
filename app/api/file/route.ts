import { type NextRequest, NextResponse } from 'next/server'
import { getFile } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const pathname = request.nextUrl.searchParams.get('pathname')

    if (!pathname) {
      return NextResponse.json({ error: 'Missing pathname' }, { status: 400 })
    }

    const result = await getFile(pathname)

    if (!result) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Blob hasn't changed — tell the browser to use its cached copy
    if (result.etag && request.headers.get('if-none-match') === result.etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.etag,
          'Cache-Control': 'private, max-age=31536000',
        },
      })
    }

    return new NextResponse(result.stream as ReadableStream, {
      headers: {
        'Content-Type': result.contentType,
        ...(result.etag ? { ETag: result.etag } : {}),
        'Cache-Control': 'private, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('[v0] File serving error:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
