// Variants from metadata — patch VA1: metadata-driven derivation block
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '../src/app/admin/AdminClient.tsx');
let src = readFileSync(FILE, 'utf8');

const oldBlockStart = '  // ---- Variant combinations (Color × Size) ----';
const oldBlockEnd = '  const removeGalleryImage = ';
const iS = src.indexOf(oldBlockStart);
const iE = src.indexOf(oldBlockEnd);
if (iS === -1 || iE === -1 || iE < iS) { console.error('✗ VA1 bounds'); process.exit(1); }

const newDeriv = `  // ---- Variant dimensions & combinations (METADATA-DRIVEN) ----
  const variantDefs = propertyDefinitions
    .filter(isDefActive)
    .filter((d) => d.variant)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const isLegacySizeSlug = (s: string) => ['sizes', 'size'].includes(s);
  const isLegacyColorSlug = (s: string) => ['colors', 'color-theme'].includes(s);

  const getDimValues = (def: PropertyDefinition): string[] => {
    if (isLegacySizeSlug(def.slug)) return pSizes;
    if (isLegacyColorSlug(def.slug)) return pColors.map((c) => c.name);
    const v = pAttributes[def.slug];
    return Array.isArray(v) ? v.map(String) : v ? [String(v)] : [];
  };
  const setDimValues = (def: PropertyDefinition, vals: string[]) => {
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
  const toggleDimValue = (def: PropertyDefinition, val: string) => {
    const cur = getDimValues(def);
    setDimValues(def, cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]);
  };
  const addCustomDimensionValue = (def: PropertyDefinition, rawVal: string, hex?: string) => {
    const v = def.type === 'color' ? rawVal.trim() : rawVal.trim().toUpperCase();
    if (!v) return;
    if (isLegacyColorSlug(def.slug)) {
      setPColors((prev) => (prev.some((c) => c.name === v) ? prev : [...prev, { name: v, hex: hex || '#cccccc' }]));
    }
    if (!getDimValues(def).includes(v)) toggleDimValue(def, v);
  };

  const cartesianT = (arrays: string[][]): string[][] =>
    arrays.reduce<string[][]>((acc, arr) => acc.flatMap((prefix) => arr.map((v) => [...prefix, v])), [[]]);

  const dimSelections = variantDefs.map((def) => ({ def, values: getDimValues(def) }));
  const activeDims = dimSelections.filter((d) => d.values.length > 0);
  const variantCombos = activeDims.length === 0 ? [] : cartesianT(activeDims.map((d) => d.values)).map((vals) => ({
    key: vals.join(' / '),
    label: vals.join(' / '),
    values,
    priceKey:
      activeDims
        .map((d, idx) => (d.def.type === 'color' ? null : vals[idx]))
        .filter(Boolean)
        .join('|') || '__all__',
  }));
  const hasVariants = variantCombos.length > 0;
  const getCell = (k: string) => variantMatrix[k] || { price: '', stock: '', inStock: true };
  const setCell = (k: string, patch: Partial<{ price?: string; stock?: string; inStock: boolean }>) =>
    setVariantMatrix((m) => ({ ...m, [k]: { ...getCell(k), ...patch } }));
  const activeVariantRows = variantCombos.map((c) => ({ ...c, cell: getCell(c.key) }));
  const matrixPrices = activeVariantRows.map((r) => parseFloat(r.cell.price || '')).filter((n2) => !isNaN(n2) && n2 > 0);
  const matrixStocks = activeVariantRows.map((r) => parseInt(r.cell.stock || '', 10)).filter((n2) => !isNaN(n2) && n2 >= 0);

  const moveGalleryImage = (idx: number, dir) =>
    setPGalleryImages((arr) => {
      const a = [...arr];
      const j = idx + dir;
      if (j < 0 || j >= a.length) return a;
      [a[idx], a[j]] = [a[j], a[idx]];
      return a;
    });
  const removeGalleryImage = (idx) => setPGalleryImages((arr) => arr.filter((_, i2) => i2 !== idx));

`;

src = src.slice(0, iS) + newDeriv + src.slice(iE);
writeFileSync(FILE, src);
console.log('✓ VA1 derivation replaced');