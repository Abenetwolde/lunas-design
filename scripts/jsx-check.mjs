// Exact JSX syntax-error locator via @babel/parser
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import parser from '@babel/parser';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '../src/app/admin/AdminClient.tsx');
const src = readFileSync(FILE, 'utf8');
try {
  parser.parse(src, { sourceType: 'module', plugins: ['jsx', 'typescript'], errorRecovery: false });
  console.log('✓ parses clean');
} catch (e) {
  console.log('✗ ' + e.message);
  const lines = src.split('\n');
  const ln = e.loc ? e.loc.line : 0;
  for (let i = Math.max(0, ln - 4); i < Math.min(lines.length, ln + 2); i++) {
    console.log((i + 1 === ln ? '» ' : '  ') + (i + 1) + ': ' + lines[i]);
  }
  process.exit(1);
}