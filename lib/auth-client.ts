'use client'

import { createAuthClient } from 'better-auth/react'

// Get the base URL for auth endpoints
const getBaseURL = () => {
  // In browser, use relative path (will use current domain)
  if (typeof window !== 'undefined') {
    return ''
  }
  
  // During SSR, use environment-based URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (process.env.V0_RUNTIME_URL) {
    return process.env.V0_RUNTIME_URL.startsWith('http') 
      ? process.env.V0_RUNTIME_URL 
      : `https://${process.env.V0_RUNTIME_URL}`
  }
  
  return 'http://localhost:3000'
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
})

export const { signIn, signUp, signOut, useSession } = authClient
