// Same image as /api/og-image/[slug], served from a query-free path ending in `.jpg`.
// Older WhatsApp clients (notably on older iOS) sometimes skip preview images whose URL
// carries a query string or lacks an image extension; the `[file]` segment is only a
// cache-busting version like `r5-abc123.jpg` and is ignored by the handler.
export { GET } from '../route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30
