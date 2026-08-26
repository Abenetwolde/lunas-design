                      </div>
                      <div className="px-4 py-2 bg-[#FAFAF8] border-t border-gray-100 flex items-start gap-2 flex-wrap">
                        <Sparkles className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Price is shared across colors — enter it once per size group. On save: lowest variant price becomes the catalog price · stock is summed.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                      <Palette className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                      <p className="text-xs text-gray-500">Select at least one value in every dimension above to generate the variant matrix.</p>
                    </div>
                  )}

                  {/* Simple product fallback — only when no variant dimensions exist */}
                  {variantDefs.length === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block mb-1.5">Selling Price (ETB) *</label>
                        <input type="number" min={0} required value={pPrice} onChange={(e) => setPPrice(e.target.value)}
                          placeholder="2500" className="w-full px-3.5 py-2.5 font-bold text-sm" />
                      </div>
                      <div>
                        <label className="block mb-1.5">Original Price</label>
                        <input type="number" min={0} value={pOrigPrice} onChange={(e) => setPOrigPrice(e.target.value)}
                          placeholder="Optional — sale badge" className="w-full px-3.5 py-2.5 text-gray-600" />
                      </div>
                      <div>
                        <label className="block mb-1.5">Stock Quantity</label>
                        <input type="number" min={0} value={pStock} onChange={(e) => setPStock(e.target.value)}
                          placeholder="15" className="w-full px-3.5 py-2.5 font-semibold" />
                      </div>
                      <div>
                        <label className="block mb-1.5">Availability</label>
                        <select value={pInStock ? 'true' : 'false'} onChange={(e) => setPInStock(e.target.value === 'true')}
                          className="w-full px-3.5 py-2.5 font-semibold cursor-pointer">
                          <option value="true">● In Stock</option>
                          <option value="false">○ Out of Stock</option>
                        </select>
                      </div>
                    </div>
                  )}
                </section>