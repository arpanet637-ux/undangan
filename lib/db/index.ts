import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { getConnectionString } from '@netlify/database'
import * as schema from './schema'

// Prefer an explicit DATABASE_URL, otherwise use the Netlify Database connection
const resolveConnectionString = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  try {
    return getConnectionString()
  } catch {
    return undefined
  }
}

export const pool = new Pool({ connectionString: resolveConnectionString() })
export const db = drizzle(pool, { schema })
