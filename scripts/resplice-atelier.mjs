// Re-splice: rebuild Product Atelier body with corrected fragment order
// (skips duplicated _pa9) and drops the leftover legacy form tail.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const FILE = join(DIR, '../src/app/admin/AdminClient.tsx');
let src = readFileSync(FILE, 'utf8');

const ORDER = ['_pa1.f', '_pa2.f', '_pa3.f', '_pa4.f', '_pa5.f', '_pa6.f', '_pa7.f', '_pa8.f', '_pa10.f', '_pa11.f'];
const NEW =
  ORDER.map((f) => readFileSync(join(DIR, f), 'utf8')).join('\n') +
  '\n              </form>';

// --- locate current broken span ---
const b0 = src.indexOf('{/* Page Header */}');
const oldSection = src.indexOf('                {/* 1. BASIC INFORMATION */}');
if (b0 === -1 || oldSection === -1 || oldSection < b0) {
  console.error('✗ markers missing', { b0, oldSection });
  process.exit(1);
}
// The legacy tail begins at the OLD sections marker and runs through the
// modal's original </form>. Find that closing tag after the old marker.
const eForm = src.indexOf('              </form>', oldSection);
if (eForm === -1) { console.error('✗ legacy </form> not found'); process.exit(1); }
const eFormEnd = eForm + '              </form>'.length;

src = src.slice(0, b0) + NEW.trimStart() + '\n' + src.slice(eFormEnd);

writeFileSync(FILE, src);
console.log('✓ Re-spliced cleanly. Lines:', src.split('\n').length);