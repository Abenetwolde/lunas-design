                {/* 03 PRODUCT VARIANTS & PRICING */}
                <section className="space-y-4">
                  <div className="adm-section-head">
                    <span className="adm-kicker">03</span>
                    <strong>Variants &amp; Pricing</strong>
                    {hasVariants && (
                      <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {variantCombos.length} combinations
                      </span>
                    )}
                  </div>

                  {variantDefs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                      <SlidersHorizontal className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                      <p className="text-xs text-gray-500">No variant dimensions (e.g. Color, Size) are enabled for this category.</p>
                      <button type="button" onClick={() => setActiveTab('properties')} className="text-[11px] font-bold text-[#C5A880] hover:underline mt-1">
                        Configure variant attributes in Properties Studio →
                      </button>
                      <p className="text-[10px] text-gray-400 mt-2">Tip: enable the “Variant” flag on an attribute to surface it here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {variantDefs.map((def) => {
                        const values = getDimValues(def);
                        const opts = def.options || [];
                        const extras = values.filter((v) => !opts.some((o) => o.value === v));
                        const isColorDim = def.type === 'color';
                        return (
                          <div key={def.id} className="rounded-2xl bg-[#FBFAF7] p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-800">{def.name}</span>
                              <span className="text-[10px] text-gray-400">{values.length} selected</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {opts.map((opt) => {
                                const on = values.includes(opt.value);
                                return (
                                  <button key={opt.id} type="button" onClick={() => toggleDimValue(def, opt.value)}
                                    className={'flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border text-[11px] font-semibold transition-all ' +
                                      (on ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400')}>
                                    {(isColorDim || opt.hex) && <span className="w-4 h-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: opt.hex || '#ccc' }} />}
                                    {on ? '✓ ' : ''}{opt.name}
                                  </button>
                                );
                              })}
                              {extras.map((v) => (
                                <button key={v} type="button" onClick={() => toggleDimValue(def, v)}
                                  className="px-2 py-1 rounded-full border text-[11px] font-semibold bg-[#C5A880]/15 text-[#A88B64] border-[#C5A880]/40">
                                  {v} ✕
                                </button>
                              ))}
                            </div>
                            {def.type === 'color' && (
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <input type="color" value={customColorHex} onChange={(e) => setCustomColorHex(e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 bg-white shrink-0" title="Pick custom color" />
                                <input type="text" value={customColorName} onChange={(e) => setCustomColorName(e.target.value)}
                                  placeholder="Custom color name" className="flex-1 min-w-[120px] px-3 py-1.5 text-xs font-medium" />
                                <button type="button" onClick={() => addCustomDimensionValue(def, customColorName, customColorHex)}
                                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#C5A880] text-[11px] font-bold text-gray-700">+ Add</button>
                              </div>
                            )}
                            {def.type !== 'color' && def.type !== 'boolean' && (
                              <div className="flex items-center gap-2 pt-1">
                                <input type="text" value={customSizeValue} onChange={(e) => setCustomSizeValue(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomDimensionValue(def, customSizeValue); } }}
                                  placeholder={'Custom ' + def.name.toLowerCase() + ' option'} className="flex-1 px-3 py-1.5 text-xs font-medium" />
                                <button type="button" onClick={() => addCustomDimensionValue(def, customSizeValue)}
                                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#C5A880] text-[11px] font-bold text-gray-700">+ Add</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}