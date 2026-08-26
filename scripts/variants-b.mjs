// Variants — patch B: save adapters, failure preservation, kickers
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '../src/app/admin/AdminClient.tsx');
let src = readFileSync(FILE, 'utf8');
let fail = 0;
const rep = (o, n, l) => { if (!src.includes(o)) { console.error('✗ ' + l); fail++; return; } src = src.replace(o, n); console.log('✓ ' + l); };

rep(`    // Roll the per-variant matrix up into the catalog's shared price/stock model
    const finalPrice`,
`    // Variant selections → legacy color/size fields (from metadata dimensions)
    const sizeDef = variantDefs.find((d) => isLegacySizeSlug(d.slug));
    const colorDef = variantDefs.find((d) => isLegacyColorSlug(d.slug));
    const finalSizes = sizeDef ? getDimValues(sizeDef) : cleanSizes;
    const finalColorNames = colorDef ? getDimValues(colorDef) : cleanColors.map((c) => c.name);
    const finalColors = finalColorNames.map(
      (n) => pColors.find((c) => c.name === n) || cleanColors.find((c) => c.name === n) || { name: n, hex: '#cccccc' }
    );

    // Roll the per-variant matrix up into the catalog's shared price/stock model
    const finalPrice`, 'adapters');

rep(`      sizes: cleanSizes,
      colors: cleanColors,`, `      sizes: finalSizes,
      colors: finalColors,`, 'prodData adapters');

rep(`    if (editingProductId) {
      const result = await updateProduct(editingProductId, prodData);
      if (result.data) {
        setProducts((prev) => prev.map((p) => (p.id === editingProductId ? { ...p, ...result.data } : p)));
      }
      showToast(isDraft ? 'Draft saved.' : \`Updated product "\${pName.trim()}"\`);
    } else {
      const result = await createProduct(prodData);
      if (result.data) {
        setProducts((prev) => [result.data!, ...prev]);
      }
      showToast(isDraft ? 'Draft saved to catalog.' : \`Created product "\${pName.trim()}"\`);
    }

    setShowProductModal(false);
    refreshAllData();
    setLoading(false);
  };`,
`    let ok = false;
    if (editingProductId) {
      const result = await updateProduct(editingProductId, prodData);
      ok = Boolean(result.data);
      if (ok) setProducts((prev) => prev.map((p) => (p.id === editingProductId ? { ...p, ...result.data! } : p)));
      if (ok) showToast(isDraft ? 'Draft saved.' : \`Updated product "\${pName.trim()}"\`);
    } else {
      const result = await createProduct(prodData);
      ok = Boolean(result.data);
      if (ok) setProducts((prev) => [result.data!, ...prev]);
      if (ok) showToast(isDraft ? 'Draft saved to catalog.' : \`Created product "\${pName.trim()}"\`);
    }

    if (!ok) {
      // Keep the modal open — every entered value stays intact for retry
      showToast('Could not save the product. Your entries are preserved — please review and try again.');
      setLoading(false);
      return;
    }

    setUnsavedDraft(false);
    setShowProductModal(false);
    refreshAllData();
    setLoading(false);
  };`, 'failure preserves values');

// close paths → closeAtelier
rep(`<button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-black p-1">
                    <X className="w-6 h-6" />
                  </button>`,
`<button onClick={closeAtelier} className="text-gray-400 hover:text-black p-1">
                    <X className="w-6 h-6" />
                  </button>`, 'X → closeAtelier');
rep(`onClick={() => setShowProductModal(false)}
                    className="mt-0.5 p-2 -ml-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
                    title="Back to Products"`,
`onClick={closeAtelier}
                    className="mt-0.5 p-2 -ml-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
                    title="Back to Products"`, 'back → closeAtelier');
rep(`onClick={() => setShowProductModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors order-last sm:order-first"`,
`onClick={closeAtelier}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors order-last sm:order-first"`, 'cancel → closeAtelier');

// kickers
rep('<span className="adm-kicker">05</span>', '<span className="adm-kicker">04</span>', 'kicker 05→04');
rep('<span className="adm-kicker">06</span>', '<span className="adm-kicker">05</span>', 'kicker 06→05');
rep('<span className="adm-kicker">07</span>', '<span className="adm-kicker">06</span>', 'kicker 07→06');

writeFileSync(FILE, src);
console.log(fail === 0 ? 'Patch variants-B OK' : 'FAILED');