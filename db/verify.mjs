// db/verify.mjs
// Reads every row back from Neon and prints it, proving the seed landed.
// Run with: npm run db:verify
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is missing.');
  process.exit(1);
}
const sql = neon(connectionString);

const restaurants = await sql`SELECT id, name, cuisine, area FROM restaurants ORDER BY id`;
const reviews = await sql`SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY created_at`;

console.log('RESTAURANTS');
for (const r of restaurants) console.log(`  ${r.id} | ${r.name} | ${r.cuisine} | ${r.area}`);

console.log('\nREVIEWS');
for (const r of reviews) {
  console.log(`  ${r.id} | rest ${r.restaurant_id} | ${r.rating}/5 | "${r.comment}" | ${r.created_at}`);
}
