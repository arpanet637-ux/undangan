import { betterAuth } from 'better-auth'
import { createHash } from 'node:crypto'
import { PostgresDialect } from 'kysely'
import { getConnectionString } from '@netlify/database'
import { getPool } from '@/lib/db'

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
  
  // Netlify site and deploy URLs
  for (const url of [process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL]) {
    if (url) origins.push(url)
  }

  // Explicit BETTER_AUTH_URL if set
  if (process.env.BETTER_AUTH_URL) {
    origins.push(process.env.BETTER_AUTH_URL)
  }
  
  // Remove duplicates
  const uniqueOrigins = Array.from(new Set(origins)).filter(Boolean)
  console.log('[v0] Better Auth trusted origins:', uniqueOrigins)
  return uniqueOrigins
}

const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000')

// Prefer an explicit BETTER_AUTH_SECRET. Otherwise derive a stable, server-only
// secret from the Netlify Database credentials so production never runs without one.
const getSecret = () => {
  if (process.env.BETTER_AUTH_SECRET) return process.env.BETTER_AUTH_SECRET
  try {
    return createHash('sha256').update(`better-auth:${getConnectionString()}`).digest('hex')
  } catch {
    // No database connection available (e.g. during the build)
    return undefined
  }
}

const createAuth = () => betterAuth({
  secret: getSecret(),
  database: {
    dialect: new PostgresDialect({ pool: getPool }),
    type: 'postgres',
  },
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

// Created on first use so the database connection and secret are resolved at
// request time rather than when the module is imported during the build.
type Auth = ReturnType<typeof createAuth>
let _auth: Auth | undefined
const getAuth = (): Auth => (_auth ??= createAuth())

export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getAuth()
    const value = Reflect.get(instance, prop)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
