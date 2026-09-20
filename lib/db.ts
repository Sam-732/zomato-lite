// lib/db.ts
// The single place your backend talks to the database.
// Every API route imports `sql` from here instead of creating its own
// connection — one connection string, one driver, one source of truth.

import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing. Is .env.local loaded?');
}

export const sql = neon(connectionString);
