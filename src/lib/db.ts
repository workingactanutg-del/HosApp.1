import { Pool } from 'pg';

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Prevent multiple pools in development hot reloading
  const globalPool = global as typeof globalThis & {
    _postgresPool?: Pool;
  };
  
  if (!globalPool._postgresPool) {
    globalPool._postgresPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  pool = globalPool._postgresPool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // console.log('executed query', { text, duration, rows: res.rowCount });
    return res.rows;
  } catch (error) {
    console.error('database query error', { text, error });
    throw error;
  }
}

export default pool;
