import { db } from '@/lib/db'
import { guests, weddings } from '@/lib/db/schema'
import { and, eq, ilike, ne, or } from 'drizzle-orm'

/**
 * Get wedding by adminCode or slug
 * Used in admin routes to support both codes and slugs as identifiers
 */
export async function getWeddingByCodeOrSlug(codeOrSlug: string) {
  const [wedding] = await db.select().from(weddings).where(
    or(
      eq(weddings.adminCode, codeOrSlug),
      eq(weddings.slug, codeOrSlug)
    )
  ).limit(1)
  return wedding || null
}

/**
 * Turns a guest name (e.g. "Ari Wijaya") into a URL-friendly, lowercase invitation
 * code slug (e.g. "ari-wijaya"), so the shared link reads naturally instead of a
 * random string. Falls back to a short random code if the name has no usable
 * characters (e.g. emoji-only names).
 */
export function slugifyGuestCode(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || Math.random().toString(36).slice(2, 8)
}

/**
 * Builds the wedding's shareable slug as "the-wedding-of-{groom-nickname}-{bride-nickname}"
 * (e.g. "the-wedding-of-de-gus-windy"), then appends -2, -3, etc. only if that exact
 * slug is already taken by another wedding.
 */
export async function generateUniqueWeddingSlug(groomNickname: string, brideNickname: string, excludeWeddingId?: number): Promise<string> {
  const base = `the-wedding-of-${slugifyGuestCode(groomNickname)}-${slugifyGuestCode(brideNickname)}`
  let candidate = base
  let suffix = 2

  while (true) {
    const conditions = [eq(weddings.slug, candidate)]
    if (excludeWeddingId) conditions.push(ne(weddings.id, excludeWeddingId))
    const [existing] = await db.select({ id: weddings.id }).from(weddings).where(and(...conditions)).limit(1)
    if (!existing) return candidate

    candidate = `${base}-${suffix}`
    suffix += 1
  }
}

/**
 * Ensures an invitation code is unique within a wedding by appending -2, -3, etc.
 * when the base slug is already taken by another guest. Matching is case-insensitive
 * since codes are always generated lowercase but people may retype links by hand.
 */
export async function generateUniqueGuestCode(weddingId: number, baseName: string, excludeGuestId?: number): Promise<string> {
  const base = slugifyGuestCode(baseName)
  let candidate = base
  let suffix = 2

  while (true) {
    const conditions = [eq(guests.weddingId, weddingId), ilike(guests.invitationCode, candidate)]
    if (excludeGuestId) conditions.push(ne(guests.id, excludeGuestId))

    const [existing] = await db.select({ id: guests.id }).from(guests).where(and(...conditions)).limit(1)
    if (!existing) return candidate

    candidate = `${base}-${suffix}`
    suffix += 1
  }
}
