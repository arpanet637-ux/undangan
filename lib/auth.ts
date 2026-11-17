import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

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
  
  if (process.env.NODE_ENV === 'development') {
    for (const url of [
      process.env.V0_RUNTIME_URL,
      process.env.V0_DEV_APP_URL,
      process.env.V0_BUILD_URL,
      process.env.V0_SANDBOX_URL,
    ]) {
      if (!url) continue
      origins.push(url.startsWith('http') ? new URL(url).origin : `https://${url}`)
    }
  }
  
  // Explicit BETTER_AUTH_URL if set
  if (process.env.BETTER_AUTH_URL) {
    origins.push(process.env.BETTER_AUTH_URL)
  }
  
  return Array.from(new Set(origins)).filter(Boolean)
}

const isDevelopment = process.env.NODE_ENV === 'development'

// The v0 preview renders the app in a cross-site iframe, so development cookies
// must be SameSite=None; Secure or the browser drops the session after login.
const cookieAttributes = isDevelopment
  ? { sameSite: 'none' as const, secure: true }
  : { sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production' }

const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000')

export const auth = betterAuth({
  database: pool,
  baseURL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  trustedOrigins: getTrustedOrigins(),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    defaultCookieAttributes: cookieAttributes,
    useSecureCookies: process.env.NODE_ENV === 'production' || isDevelopment,
    // Production is served from several domains (custom domain + vercel.app)
    disableOriginCheck: process.env.NODE_ENV === 'production',
  },
}) 
