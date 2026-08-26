// Final: replace def-card interior using true map-end detection
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '../src/app/admin/AdminClient.tsx');
const lines = readFileSync(FILE, 'utf8').split('\n');

let iCard = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '<div key={def.id} className="rounded-2xl bg-[#FBFAF7] p-4 space-y-3">') { iCard = i; break; }
}
if (iCard === -1) { console.error('✗ opener missing'); process.exit(1); }

let iEnd = -1;
const srcTxt = lines.join('\n');
const cardPos = srcTxt.indexOf(lines[iCard]);
const mPos = srcTxt.indexOf('Variant matrix */}', cardPos);
if (mPos !== -1) {
  iEnd = srcTxt.slice(0, mPos).split('\n').length - 1; // line of that comment
}
if (iEnd === -1) { console.error('✗ map end pair missing'); process.exit(1); }
console.log('replacing lines', iCard + 1, '→', iEnd);

const CLEAN_CARD = [
  '                          <div key={def.id} className="rounded-2xl bg-[#FBFAF7] p-4 space-y-3">',
  '                            <div className="flex items-center justify-between">',
  '                              <span className="text-xs font-bold text-gray-800">{def.name}</span>',
  '                              <PaToggle',
  '                                checked={dimOn}',
  '                                onChange={(v) => setDimVisibility((m) => ({ ...m, [def.slug]: v }))}',
  "                                label={dimOn ? 'Active' : 'Inactive'}",
  '                              />',
  '                            </div>',
  '                            {values.length > 0 && (',
  '                              <span className="text-[10px] text-gray-400 block -mt-1">{values.length} selected</span>',
  '                            )}',
  '',
  '                            {dimOn && (',
  '                              <>',
  '                                <div className="flex flex-wrap gap-1.5">',
  '                                  {opts.map((opt) => {',
  '                                    const on = values.includes(opt.value);',
  '                                    return (',
  "                                      <button key={opt.id} type=\"button\" onClick={() => toggleDimValue(def, opt.value)}",
  "                                        className={'flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border text-[11px] font-semibold transition-all ' +",
  "                                          (on ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400')}>",
  '                                        {(isColorDim || opt.hex) && <span className="w-4 h-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: opt.hex || "#ccc" }} />}',
  "                                        {on ? '\\u2713 ' : ''}{opt.name}",
  '                                      </button>',
  '                                    );',
  '                                  })}',
  '                                  {extras.map((v) => (',
  '                                    <button key={v} type="button" onClick={() => toggleDimValue(def, v)}',
  '                                      className="px-2 py-1 rounded-full border text-[11px] font-semibold bg-[#C5A880]/15 text-[#A88B64] border-[#C5A880]/40">',
  "                                      {v} '\\u2715'",
  '                                    </button>',
  '                                  ))}',
  '                                </div>',
  "                                {def.type === 'color' && (",
  '                                  <div className="flex flex-wrap items-center gap-2 pt-1">',
  '                                    <input type="color" value={customColorHex} onChange={(e) => setCustomColorHex(e.target.value)}',
  '                                      className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 bg-white shrink-0" title="Pick custom color" />',
  '                                    <input type="text" value={customColorName} onChange={(e) => setCustomColorName(e.target.value)}',
  '                                      placeholder="Custom color name" className="flex-1 min-w-[120px] px-3 py-1.5 text-xs font-medium" />',
  '                                    <button type="button" onClick={() => addCustomDimensionValue(def, customColorName, customColorHex)}',
  '                                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#C5A880] text-[11px] font-bold text-gray-700">+ Add</button>',
  '                                  </div>',
  '                                )}',
  "                                {def.type !== 'color' && def.type !== 'boolean' && (",
  '                                  <div className="flex items-center gap-2 pt-1 w-full">',
  '                                    <input type="text" value={customSizeValue} onChange={(e) => setCustomSizeValue(e.target.value)}',
  '                                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomDimensionValue(def, customSizeValue); } }}',
  "                                      placeholder={'Custom ' + def.name.toLowerCase() + ' option'} className='flex-1 px-3 py-1.5 text-xs font-medium' />",
  '                                    <button type="button" onClick={() => addCustomDimensionValue(def, customSizeValue)}',
  '                                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#C5A880] text-[11px] font-bold text-gray-700">+ Add</button>',
  '                                  </div>',
  '                                )}',
  '                              </>',
  '                            )}',
  '                          </div>',
];

lines.splice(iCard, iEnd - iCard, ...CLEAN_CARD, '                                </div>', '                              )}', '');
writeFileSync(FILE, lines.join('\n'));
console.log('✓ card interior replaced cleanly');