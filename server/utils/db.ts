import dns from 'node:dns'
import pg from 'pg'

const { Pool } = pg

if (process.env.NODE_ENV === 'production') dns.setDefaultResultOrder('ipv4first')

let pool: pg.Pool | null = null

function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) throw new Error('DATABASE_URL environment variable is not set')
    const local = connectionString.includes('127.0.0.1') || connectionString.includes('localhost')
    pool = new Pool({
      connectionString,
      ssl: local ? false : { rejectUnauthorized: false },
      max: process.env.NODE_ENV === 'production' ? 1 : 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
  }
  return pool
}

export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query(text, params)
  return result.rows as T[]
}

export async function queryOne<T>(text: string, params: unknown[] = []): Promise<T | null> {
  const result = await getPool().query(text, params)
  return (result.rows[0] as T | undefined) || null
}
