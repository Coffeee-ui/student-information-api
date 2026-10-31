import { Pool, type PoolConfig } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing. Check your environment variables or .env file.');
}

// Enable SSL rejection bypass for remote PostgreSQL providers (Render, Supabase)
const isProduction = process.env.NODE_ENV === 'production';
const requiresSsl =
  databaseUrl.includes('sslmode=require') ||
  databaseUrl.includes('supabase.co') ||
  databaseUrl.includes('render.com') ||
  (isProduction &&
    !databaseUrl.includes('localhost') &&
    !databaseUrl.includes('127.0.0.1') &&
    !databaseUrl.includes('@db:'));

const poolConfig: PoolConfig = {
  connectionString: databaseUrl,
  ...(requiresSsl ? { ssl: { rejectUnauthorized: false } } : {})
};

export const pool = new Pool(poolConfig);
