import { getStore } from '@netlify/blobs'

const uploads = () => getStore('uploads')

// Stores an uploaded file in Netlify Blobs and returns its key. Files are served
// through the /api/file?pathname=<key> proxy.
export async function putFile(filename: string, file: File) {
  const safeName = filename.replace(/[^a-zA-Z0-9._/-]/g, '-')
  const dot = safeName.lastIndexOf('.')
  const suffix = crypto.randomUUID().slice(0, 8)
  const pathname = dot > 0 ? `${safeName.slice(0, dot)}-${suffix}${safeName.slice(dot)}` : `${safeName}-${suffix}`

  await uploads().set(pathname, await file.arrayBuffer(), {
    metadata: { contentType: file.type || 'application/octet-stream' },
  })

  return { pathname, url: `/api/file?pathname=${encodeURIComponent(pathname)}` }
}

export async function getFile(pathname: string) {
  const result = await uploads().getWithMetadata(pathname, { type: 'stream' })
  if (!result) return null
  return {
    stream: result.data,
    contentType: (result.metadata.contentType as string) || 'application/octet-stream',
    etag: result.etag,
  }
}
