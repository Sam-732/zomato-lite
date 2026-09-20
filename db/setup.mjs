// db/setup.mjs
// Applies schema.sql then seed.sql to the Neon database.
// Run with: npm run db:setup
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

// Split a .sql file into individual statements on semicolons.
// Filters out blank lines and comment lines so we only execute real SQL.
function splitStatements(sql) {
  return sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is missing. Make sure .env.local is loaded.');
  process.exit(1);
}

const sql = neon(connectionString);

const schema = await readFile(path.join(__dirname, 'schema.sql'), 'utf8');
const seed = await readFile(path.join(__dirname, 'seed.sql'), 'utf8');

for (const statement of splitStatements(schema)) {
  await sql.query(statement);
  console.log('OK  schema:', statement.slice(0, 40));
}
for (const statement of splitStatements(seed)) {
  await sql.query(statement);
  console.log('OK  seed:  ', statement.slice(0, 40));
}

console.log('\nDone. Database is set up.');
