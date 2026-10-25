import { drizzle } from 'drizzle-orm/netlify-db'
import { getDatabase } from '@netlify/database'
import type { Pool } from 'pg'
import * as schema from './schema'

// Connections are created lazily so that importing this module during the
// build (when no database connection is available) doesn't throw.
const createDb = () => drizzle({ schema })
type Database = ReturnType<typeof createDb>

let _db: Database | undefined
const getDb = (): Database => (_db ??= createDb())

export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const instance = getDb()
    const value = Reflect.get(instance, prop)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})

// pg-compatible Postgres pool (used by Better Auth and raw SQL queries)
export const getPool = async () => getDatabase().pool as unknown as Pool
