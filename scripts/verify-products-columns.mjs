#!/usr/bin/env node
/** Verifies live products-table columns match what the app writes. */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split('\n')
    .map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)?.slice(1, 3))
    .filter(Boolean)
);
const REF = env.NEXT_PUBLIC_SUPABASE_URL.replace(/^https?:\/\//, '').split('.')[0];

const client = new pg.Client({
  host: `aws-1-eu-west-1.pooler.supabase.com`,
  port: 5432,
  user: `postgres.${REF}`,
  password: env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const expected = [
  'badge_text', 'in_stock', 'original_price', 'images', 'secondary_image',
  'sizes', 'colors', 'material', 'occasion', 'fabric_care', 'delivery_info',
  'stock_quantity', 'subcategory', 'rating', 'reviews_count',
];
const r = await client.query(
  `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='products'`
);
const have = new Set(r.rows.map((x) => x.column_name));
const missing = expected.filter((c) => !have.has(c));

console.log('products columns present:', [...have].sort().join(', '));
console.log(missing.length === 0 ? '✓ ALL app-required columns exist (delivery_info included)' : `✗ STILL MISSING: ${missing.join(', ')}`);

const n = await client.query('SELECT COUNT(*)::int n FROM public.products');
console.log('products rows:', n.rows[0].n);

await client.end();