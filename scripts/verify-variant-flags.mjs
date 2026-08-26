// Verify variant flags on attributes
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import pg from 'pg';

const DIR = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(join(DIR, '../.env'), 'utf8')
    .split('\n')
    .map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)?.slice(1, 3))
    .filter(Boolean)
);
const REF = env.NEXT_PUBLIC_SUPABASE_URL.replace(/^https?:\/\//, '').split('.')[0];

const client = new pg.Client({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 5432,
  user: `postgres.${REF}`,
  password: env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const r = await client.query(
  `SELECT code, name, input_type, variant FROM public.attributes ORDER BY display_order`
);
console.log('code            | type          | variant | name');
r.rows.forEach((row) =>
  console.log(`${row.code.padEnd(15)} | ${row.input_type.padEnd(12)} | ${(row.variant ? 'YES' : 'no ').padEnd(7)} | ${row.name}`)
);

const bad = r.rows.filter((x) => ['color-theme', 'size', 'sizes'].includes(x.code) && !x.variant);
console.log(bad.length === 0 ? '\n✓ all color/size dimensions are variant-enabled' : `\n✗ still disabled: ${bad.map((b) => b.code).join(', ')}`);

await client.end();