#!/usr/bin/env node
/**
 * HIWI FASHION — Supabase Migration Pusher
 * ----------------------------------------
 * Executes SQL migration files directly against the project's Supabase
 * Postgres database using credentials from .env.
 *
 * Usage:   node scripts/push-supabase.mjs [file1.sql file2.sql ...]
 * Default: runs every supabase/migration_*.sql in sorted order.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ---------- load .env ----------
function loadEnv() {
  const env = {};
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) {
    console.error('✗ .env not found at', envPath);
    process.exit(1);
  }
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnv();
const DB_PASSWORD = env.SUPABASE_DB_PASSWORD;
const SUPABASE_URL = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
const REF = SUPABASE_URL.split('.')[0];

if (!DB_PASSWORD || !REF) {
  console.error('✗ Missing SUPABASE_DB_PASSWORD or NEXT_PUBLIC_SUPABASE_URL in .env');
  process.exit(1);
}

// ---------- resolve migration files ----------
let files = process.argv.slice(2);
if (files.length === 0) {
  const dir = join(ROOT, 'supabase');
  files = readdirSync(dir)
    .filter((f) => f.startsWith('migration_') && f.endsWith('.sql'))
    .sort()
    .map((f) => join(dir, f));
}
if (files.length === 0) {
  console.log('No migration files found. Nothing to do.');
  process.exit(0);
}

// ---------- candidate connections ----------
const enc = encodeURIComponent(DB_PASSWORD);
const candidates = [
  { label: `pooler aws-1-eu-west-1 (session :5432)`, config: { host: 'aws-1-eu-west-1.pooler.supabase.com', port: 5432, user: `postgres.${REF}`, password: DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 12000 } },
  { label: `pooler aws-1-eu-west-1 (transaction :6543)`, config: { host: 'aws-1-eu-west-1.pooler.supabase.com', port: 6543, user: `postgres.${REF}`, password: DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 12000 } },
  { label: `direct db.${REF}.supabase.co:5432`, config: { host: `db.${REF}.supabase.co`, port: 5432, user: 'postgres', password: DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 } },
  ...['eu-central-1', 'eu-west-2', 'us-east-1'].map((region) => ({
    label: `pooler aws-1-${region} (session :5432)`,
    config: { host: `aws-1-${region}.pooler.supabase.com`, port: 5432, user: `postgres.${REF}`, password: DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 },
  })),
];

async function connectAny() {
  const errors = [];
  for (const c of candidates) {
    const client = new pg.Client(c.config);
    try {
      await client.connect();
      await client.query('SELECT 1');
      console.log(`✓ Connected via ${c.label}`);
      return client;
    } catch (err) {
      errors.push(`${c.label}: ${err.message}`);
      try { await client.end(); } catch {}
    }
  }
  console.error('✗ Could not reach the database. Attempts:');
  errors.forEach((e) => console.error('  -', e));
  process.exit(2);
}

// ---------- run migrations ----------
async function main() {
  const client = await connectAny();

  for (const file of files) {
    const sql = readFileSync(file, 'utf8');
    process.stdout.write(`→ Applying ${file.split('/').pop()} ... `);
    try {
      await client.query(sql);
      console.log('DONE ✓');
    } catch (err) {
      console.log('FAILED ✗');
      console.error(`  ${err.message}`);
      await client.end();
      process.exit(3);
    }
  }

  // ---------- verification ----------
  console.log('\n— Verification —');
  try {
    const tables = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema='public' AND table_name IN ('attributes','attribute_options','category_attributes','product_attribute_values','subcategories')
       ORDER BY table_name;`
    );
    console.log('  Tables present:', tables.rows.map((r) => r.table_name).join(', ') || '(none)');

    const counts = await client.query(
      `SELECT
         (SELECT COUNT(*) FROM public.attributes) AS attributes,
         (SELECT COUNT(*) FROM public.attribute_options) AS options,
         (SELECT COUNT(*) FROM public.category_attributes) AS bindings,
         (SELECT COUNT(*) FROM public.product_attribute_values) AS values,
         (SELECT COUNT(*) FROM public.subcategories) AS subcategories;`
    );
    const c = counts.rows[0];
    console.log(`  Rows → attributes:${c.attributes} options:${c.options} bindings:${c.bindings} product_values:${c.values} subcategories:${c.subcategories}`);

    const cols = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='subcategories' AND column_name='parent_slug';`
    );
    console.log(cols.rows.length > 0 ? '  subcategories.parent_slug ✓ (hierarchy ready)' : '  ⚠ parent_slug column missing!');
  } catch (err) {
    console.warn('  Verification warning:', err.message);
  }

  await client.end();
  console.log('\nAll migrations applied successfully.');
}

main();