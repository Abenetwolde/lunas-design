#!/usr/bin/env node
/** Verifies RLS policies on the EAV + subcategory tables allow app writes. */
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
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 5432,
  user: `postgres.${REF}`,
  password: env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const r = await client.query(
  `SELECT tablename, policyname, cmd, roles
   FROM pg_policies
   WHERE schemaname='public'
     AND tablename IN ('attributes','attribute_options','category_attributes','product_attribute_values','subcategories')
   ORDER BY tablename, policyname`
);

const tables = {};
for (const row of r.rows) {
  (tables[row.tablename] ||= []).push(`${row.policyname} [${row.cmd} roles:${String(row.roles)}]`);
}

let allGood = true;
for (const [table, policies] of Object.entries(tables)) {
  console.log(`\n${table}:`);
  policies.forEach((p) => console.log('  -', p));
  const hasPublicWrite = policies.some((p) => p.includes('ALL') && p.includes('roles:{public}'));
  if (!hasPublicWrite) {
    allGood = false;
    console.log('  ⚠ No public ALL-write policy!');
  }
}
console.log(allGood ? '\n✓ All tables have public write policies — saves will work as anon.' : '\n✗ Some tables still restricted.');

await client.end();