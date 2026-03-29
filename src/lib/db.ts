import pg from 'pg';
import dns from 'dns';

const { Pool } = pg;

// 强制使用 IPv4，解决 Render 不支持 IPv6 的问题
if (process.env.NODE_ENV === 'production') {
  dns.setDefaultResultOrder('ipv4first');
}

// 延迟初始化连接池，避免构建时报错
let _pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _pool = new Pool({
      connectionString,
      // Supabase 需要 SSL
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
      // serverless 环境限制连接数
      max: process.env.NODE_ENV === 'production' ? 1 : 10,
    });
  }
  return _pool;
}

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const result = await getPool().query(text, params);
  return (result.rows[0] as T) || null;
}
