// Per-dimension Active/Hidden toggles for Product Variants
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '../src/app/admin/AdminClient.tsx');
let src = readFileSync(FILE, 'utf8');
let fail = 0;
const rep = (o, n, l) => { if (!src.includes(o)) { console.error('✗ ' + l); fail++; return; } src = src.replace(o, n); console.log('✓ ' + l); };
const must = (c, m) => { if (!c) { console.error('✗ ' + m); fail++; } };

// 1) state
rep(
  '  const [attrVisibility, setAttrVisibility] = useState<Record<string, boolean>>({}); // per-product attribute Active/Hidden',
  '  const [attrVisibility, setAttrVisibility] = useState<Record<string, boolean>>({}); // per-product attribute Active/Hidden\n  const [dimVisibility, setDimVisibility] = useState<Record<string, boolean>>({}); // variant dimension Active/Hidden',
  'dimVisibility state'
);

// 2) derivation respects visibility
rep(
  `  const variantDefs = propertyDefinitions\n    .filter(isDefActive)\n    .filter((d) => d.variant)`,
  `  const dimIsOn = (def: PropertyDefinition) => dimVisibility[def.slug] !== false;\n  const variantDefs = propertyDefinitions\n    .filter(isDefActive)\n    .filter((d) => d.variant && dimIsOn(d))`,
  'derivation filter'
);

// 3) map callback exposes dimOn
rep(
  `const values = getDimValues(def);`,
  `const values = getDimValues(def);\n                          const dimOn = dimVisibility[def.slug] !== false;`,
  'dimOn in map'
);

// 4) card header gains the toggle
rep(
  `                            <div className="flex items-center justify-between">\n                              <span className="text-xs font-bold text-gray-800">{def.name}</span>\n                              <span className="text-[10px] text-gray-400">{values.length} selected</span>\n                            </div>`,
  `                            <div className="flex items-center justify-between">\n                              <span className="text-xs font-bold text-gray-800">{def.name}</span>\n                              <PaToggle\n                                checked={dimOn}\n                                onChange={(v) => setDimVisibility((m) => ({ ...m, [def.slug]: v }))}\n                                label={dimOn ? 'Active' : 'Inactive'}\n                              />\n                            </div>\n                            {values.length > 0 && (\n                              <span className="text-[10px] text-gray-400 block -mt-1">{values.length} selected</span>\n                            )}`,
  'dimension header toggle'
);

// 5) collapse option chips + custom row while inactive
{
  const openAnchor = `                            <div className="flex flex-wrap gap-1.5">\n                              {opts.map((opt) => {`;
  const cutFrom = src.indexOf(openAnchor);
  must(cutFrom !== -1, 'chips open anchor');
  if (cutFrom !== -1) {
    const before = src.slice(0, cutFrom);
    let rest = src.slice(cutFrom);
    // find the end of the custom-size row: "+ Add</button>\n                              </div>" followed by "\n                            ) : null}"
    const tailMarker = `+ Add</button>\n                              </div>\n                            ) : null}`;
    const tIdx = rest.indexOf(tailMarker);
    if (tIdx === -1) { console.error('✗ custom-row tail marker'); fail++; }
    else {
      const afterTail = tIdx + '+ Add</button>\n                              </div>'.length;
      rest =
        '{dimOn ? (\n<>\n' +
        rest.slice(openAnchor.length, afterTail) +
        '\n                            </>\n                            ) : (\n                              <p className="text-[10px] text-gray-400 italic text-center py-2">Dimension inactive — turn on to select options.</p>\n                            )}' +
        rest.slice(afterTail);
      src = before + rest;
      console.log('✓ chips/custom wrapped in Active conditional');
    }
  }
}

// 6) resets alongside existing ones
src = src.replace('    setPAttributes({});', '    setPAttributes({});\n    setAttrVisibility({});\n    setDimVisibility({});');
{
  const ed = 'setPAttributes(prod.attributes || {});';
  if (src.includes(ed)) src = src.replace(ed, ed + '\n    setAttrVisibility({});\n    setDimVisibility({});');
}
console.log('✓ resets wired');

writeFileSync(FILE, src);
console.log(fail === 0 ? 'DIM TOGGLE PATCH OK' : 'FAILED (' + fail + ')');
process.exit(fail === 0 ? 0 : 1);