// List candidate ');' closers after the def-card opener
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '../src/app/admin/AdminClient.tsx');
const lines = readFileSync(FILE, 'utf8').split('\n');

let iCard = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '<div key={def.id} className="rounded-2xl bg-[#FBFAF7] p-4 space-y-3">') { iCard = i; break; }
}
console.log('opener @', iCard + 1);
let n = 0;
for (let j = iCard; j < Math.min(iCard + 260, lines.length); j++) {
  if (/^\s*\);\s*$/.test(lines[j])) {
    const ind = lines[j].length - lines[j].trimStart().length;
    const nxt = j + 1 < lines.length ? lines[j + 1].trim().slice(0, 24) : '';
    console.log('); @', j + 1, 'indent', ind, 'next:', nxt);
    if (++n > 6) break;
  }
}