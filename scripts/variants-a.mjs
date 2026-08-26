// Variants — metadata-driven derivations + draft preservation (combined A)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '../src/app/admin/AdminClient.tsx');
let src = readFileSync(FILE, 'utf8');
let fail = 0;
const must = (c, m) => { if (!c) { console.error('✗ ' + m); fail++; } };
const rep = (o, n, l) => { if (!src.includes(o)) { console.error('✗ ' + l); fail++; return; } src = src.replace(o, n); console.log('✓ ' + l); };

// A1) derivation block
const bStart = '  // ---- Variant combinations (Color × Size) ----';
const bEnd = '  const removeGalleryImage = ';
const iS = src.indexOf(bStart);
const iE = src.indexOf(bEnd);
must(iS !== -1 && iE > iS, 'A1 bounds');

const deriv = `  // ---- Variant dimensions & combinations (METADATA-DRIVEN) ----
  const variantDefs = propertyDefinitions
    .filter(isDefActive)
    .filter((d) => d.variant && dimIsOn(d))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const isLegacySizeSlug = (s) => ['sizes', 'size'].includes(s);
  const isLegacyColorSlug = (s) => ['colors', 'color-theme'].includes(s);

  const getDimValues = (def) => {
    if (isLegacySizeSlug(def.slug)) return pSizes;
    if (isLegacyColorSlug(def.slug)) return pColors.map((c) => c.name);
    const v = pAttributes[def.slug];
    return Array.isArray(v) ? v.map(String) : v ? [String(v)] : [];
  };
  const setDimValues = (def, vals) => {
    if (isLegacySizeSlug(def.slug)) { setPSizes(vals); return; }
    if (isLegacyColorSlug(def.slug)) {
      setPColors((prev) => {
        const keep = prev.filter((c) => vals.includes(c.name));
        const missing = vals.filter((n) => !keep.some((c) => c.name === n)).map((n) => ({ name: n, hex: '#cccccc' }));
        return [...keep, ...missing];
      });
      return;
    }
    setPAttributes({ ...(pAttributes || {}), [def.slug]: vals });
  };
  const toggleDimValue = (def, val) => {
    const cur = getDimValues(def);
    setDimValues(def, cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]);
  };
  const addCustomDimensionValue = (def, rawVal, hex) => {
    const v = def.type === 'color' ? rawVal.trim() : rawVal.trim().toUpperCase();
    if (!v) return;
    if (isLegacyColorSlug(def.slug)) {
      setPColors((prev) => (prev.some((c) => c.name === v) ? prev : [...prev, { name: v, hex: hex || '#cccccc' }]));
    }
    if (!getDimValues(def).includes(v)) toggleDimValue(def, v);
  };
  const cartesianT = (arrays) => arrays.reduce((acc, arr) => acc.flatMap((prefix) => arr.map((v) => [...prefix, v])), [[]]);
  const dimSelections = variantDefs.map((def) => ({ def, values: getDimValues(def) }));
  const activeDims = dimSelections.filter((d) => d.values.length > 0);
  const variantCombos = activeDims.length === 0 ? [] : cartesianT(activeDims.map((d) => d.values)).map((vals) => ({
    key: vals.join(' / '),
    label: vals.join(' / '),
    values: vals,
    priceKey: activeDims.map((d, idx) => (d.def.type === 'color' ? null : vals[idx])).filter(Boolean).join('|') || '__all__',
  }));
  const hasVariants = variantCombos.length > 0;
  const getCell = (k) => variantMatrix[k] || { price: '', stock: '', inStock: true };
  const setCell = (k, patch) => setVariantMatrix((m) => ({ ...m, [k]: { ...getCell(k), ...patch } }));
  const activeVariantRows = variantCombos.map((c) => ({ ...c, cell: getCell(c.key) }));
  const matrixPrices = activeVariantRows.map((r) => parseFloat(r.cell.price || '')).filter((n) => !isNaN(n) && n > 0);
  const matrixStocks = activeVariantRows.map((r) => parseInt(r.cell.stock || '', 10)).filter((n) => !isNaN(n) && n >= 0);

  const moveGalleryImage = (idx: number, dir: -1 | 1) =>
    setPGalleryImages((arr) => {
      const a = [...arr];
      const j = idx + dir;
      if (j < 0 || j >= a.length) return a;
      [a[idx], a[j]] = [a[j], a[idx]];
      return a;
    });
  const removeGalleryImage = (idx: number) => setPGalleryImages((arr) => arr.filter((_, i) => i !== idx));

`;
src = src.slice(0, iS) + deriv + src.slice(iE);
console.log('✓ A1 derivations');

// A2) dimVisibility state must exist BEFORE this block (declared with other states)
if (!src.includes('dimVisibility')) {
  const st = '  const [attrVisibility, setAttrVisibility] = useState<Record<string, boolean>>({});';
  must(src.includes(st), 'A2 attrVisibility anchor');
  src = src.replace(st, st + '\n  const [dimVisibility, setDimVisibility] = useState<Record<string, boolean>>({}); // variant dims Active/Hidden');
  console.log('✓ A2 dimVisibility state');
}

// A3) drop hardcoded presets
src = src.replace(/const PA_COLOR_PRESETS: ColorOption\[\] = \[[^\]]*\];\n?/, '');
src = src.replace(/const PA_SIZE_PRESETS = \[[^\]]*\];\n?/, '');
console.log('✓ A3 presets removed');

writeFileSync(FILE, src);
console.log(fail === 0 ? 'Patch variants-A OK' : 'FAILED');