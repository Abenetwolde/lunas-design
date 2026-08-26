// Splice: replace old [03 Variants][04 Pricing] with metadata-driven combined section
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const FILE = join(DIR, '../src/app/admin/AdminClient.tsx');
let src = readFileSync(FILE, 'utf8');

const NEW =
  readFileSync(join(DIR, '_vn1.f'), 'utf8') + '\n' +
  readFileSync(join(DIR, '_vn2.f'), 'utf8') + '\n' +
  readFileSync(join(DIR, '_vn3.f'), 'utf8');

const START = '                {/* 03 PRODUCT VARIANTS */}';
const END = '                {/* 04 PRICING & INVENTORY */}';
const sIdx = src.indexOf(START);
const eIdx = src.indexOf(END);
if (sIdx === -1 || eIdx === -1 || eIdx < sIdx) { console.error('✗ markers', { sIdx, eIdx }); process.exit(1); }

src = src.slice(0, sIdx) + NEW.trimEnd() + '\n\n' + src.slice(eIdx).replace(END, '                {/* 04 PRODUCT DESCRIPTION */}');

src = src.replace('<span className="adm-kicker">05</span>', '<span className="adm-kicker">04</span>');
src = src.replace('<span className="adm-kicker">06</span>', '<span className="adm-kicker">05</span>');
src = src.replace('<span className="adm-kicker">07</span>', '<span className="adm-kicker">06</span>');
src = src.replace('{/* 06 STOREFRONT SETTINGS */}', '{/* 05 STOREFRONT SETTINGS */}');
src = src.replace('{/* 07 DYNAMIC ATTRIBUTES */}', '{/* 06 DYNAMIC ATTRIBUTES */}');

writeFileSync(FILE, src);
console.log('✓ spliced. Lines:', src.split('\n').length);