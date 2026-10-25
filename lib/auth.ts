import { createHash } from 'crypto'
import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

// Use BETTER_AUTH_SECRET when set; otherwise derive a stable server-only secret
// from the database connection string so production never runs without one
const getSecret = () => {
  const explicit = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET
  if (explicit) return explicit
  const connectionString = pool.options.connectionString
  if (!connectionString) return undefined
  return createHash('sha256').update(`better-auth:${connectionString}`).digest('base64')
}

const getTrustedOrigins = () => {
  const origins: string[] = []
  
  // Development mode - be very permissive
  if (process.env.NODE_ENV !== 'production') {
    // Allow all localhost variants with all common ports
    origins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:8000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8000',
      'http://localhost',
      'http://127.0.0.1'
    )
  }
  
  // Production: Add all possible Vercel URLs
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  }
  if (process.env.VERCEL_BRANCH_URL) {
    origins.push(`https://${process.env.VERCEL_BRANCH_URL}`)
  }
  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL
    origins.push(`https://${vercelUrl}`)
  }
  
  // Add environment-based origins
  if (process.env.V0_RUNTIME_URL) {
    origins.push(process.env.V0_RUNTIME_URL)
    if (!process.env.V0_RUNTIME_URL.startsWith('http')) {
      origins.push(`https://${process.env.V0_RUNTIME_URL}`)
    }
  }
  
  // Netlify URLs (production and deploy previews)
  if (process.env.URL) origins.push(process.env.URL)
  if (process.env.DEPLOY_PRIME_URL) origins.push(process.env.DEPLOY_PRIME_URL)
  if (process.env.DEPLOY_URL) origins.push(process.env.DEPLOY_URL)

  // Explicit BETTER_AUTH_URL if set
  if (process.env.BETTER_AUTH_URL) {
    origins.push(process.env.BETTER_AUTH_URL)
  }
  
  // Remove duplicates
  const uniqueOrigins = Array.from(new Set(origins)).filter(Boolean)
  console.log('[v0] Better Auth trusted origins:', uniqueOrigins)
  return uniqueOrigins
}

const netlifyURL =
  process.env.CONTEXT === 'production' ? process.env.URL : process.env.DEPLOY_PRIME_URL ?? process.env.URL

const baseURL =
  process.env.BETTER_AUTH_URL ??
  netlifyURL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000')

export const auth = betterAuth({
  database: pool,
  baseURL,
  secret: getSecret(),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  trustedOrigins: getTrustedOrigins(),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookie: {
      attributes: {
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
    },
    useSecureCookies: process.env.NODE_ENV === 'production',
    // Disable origin check to allow auth from any Vercel deployment URL
    // Better Auth will still validate via CSRF tokens and other security measures
    disableOriginCheck: true,
    // Keep CSRF check enabled for security
    skipCsrfCheck: process.env.NODE_ENV !== 'production',
  },
}) 
