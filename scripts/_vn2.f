
                  {/* Variant matrix — price shared across colors (grouped rows) */}
                  {hasVariants ? (
                    <div className="rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-xs">
                          <thead>
                            <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 bg-[#FAFAF8] border-b border-gray-100">
                              <th className="px-4 py-2.5 font-semibold">Variant</th>
                              <th className="px-4 py-2.5 font-semibold">Price (ETB)</th>
                              <th className="px-4 py-2.5 font-semibold">Stock</th>
                              <th className="px-4 py-2.5 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {(() => {
                              const groups = new Map();
                              activeVariantRows.forEach((r) => {
                                const arr = groups.get(r.priceKey) || [];
                                arr.push(r);
                                groups.set(r.priceKey, arr);
                              });
                              return Array.from(groups.values()).flatMap((rows) =>
                                rows.map((r, ri) => (
                                  <tr key={r.key} className="hover:bg-[#FBF9F5]/60 transition-colors">
                                    <td className="px-4 py-2.5">
                                      <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800">{r.label}</span>
                                    </td>
                                    {ri === 0 && (
                                      <td className="px-4 py-2.5 align-top" rowSpan={rows.length}>
                                        <input type="number" min={0} value={rows[0].cell.price}
                                          onChange={(e) => setCell(rows[0].key, { price: e.target.value })}
                                          placeholder={pPrice || '—'} className="w-24 px-2 py-1.5 text-right" />
                                      </td>
                                    )}
                                    <td className="px-4 py-2.5">
                                      <input type="number" min={0} value={r.cell.stock}
                                        onChange={(e) => setCell(r.key, { stock: e.target.value })}
                                        placeholder="—" className="w-20 px-2 py-1.5 text-right" />
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <button type="button"
                                        onClick={() => setCell(r.key, { inStock: !r.cell.inStock })}
                                        className={'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ' +
                                          (r.cell.inStock !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
                                        <span className={'w-1.5 h-1.5 rounded-full ' + (r.cell.inStock !== false ? 'bg-emerald-500' : 'bg-red-500')} />
                                        {r.cell.inStock !== false ? 'In Stock' : 'Out of Stock'}
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              );
                            })()}
                          </tbody>
                        </table>