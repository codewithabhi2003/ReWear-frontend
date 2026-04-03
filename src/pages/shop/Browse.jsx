import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { productService } from '../../services/productService';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';

const DEFAULT_FILTERS = {
  category: [], brand: [], gender: '', size: [], condition: [],
  priceMin: '', priceMax: '', sort: 'newest',
};

export default function Browse() {
  const [searchParams] = useSearchParams();
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage]           = useState(1);
  const [filters, setFilters]     = useState(() => {
    // Hydrate filters from URL params
    return {
      ...DEFAULT_FILTERS,
      category:  searchParams.get('category') ? [searchParams.get('category')] : [],
      brand:     searchParams.get('brand')    ? [searchParams.get('brand')]    : [],
      sort:      searchParams.get('sort')     || 'newest',
    };
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sort:      filters.sort,
        page,
        limit:     20,
        ...(filters.category.length  && { category:  filters.category.join(',') }),
        ...(filters.brand.length     && { brand:     filters.brand.join(',') }),
        ...(filters.gender           && { gender:    filters.gender }),
        ...(filters.size.length      && { size:      filters.size.join(',') }),
        ...(filters.condition.length && { condition: filters.condition.join(',') }),
        ...(filters.priceMin         && { priceMin:  filters.priceMin }),
        ...(filters.priceMax         && { priceMax:  filters.priceMax }),
      };
      const { data } = await productService.getAll(params);
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch { /* show empty state */ } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [filters]);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const activeFilterCount = [
    filters.category.length, filters.brand.length, filters.size.length,
    filters.condition.length, filters.gender ? 1 : 0,
    filters.priceMin ? 1 : 0, filters.priceMax ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Browse</h1>
          {!loading && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {pagination.total || 0} items found
            </p>
          )}
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden btn-ghost flex items-center gap-2"
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="badge badge-brand">{activeFilterCount}</span>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <ProductFilters filters={filters} onChange={setFilters} onReset={resetFilters} />
        </aside>

        {/* ── Product Grid ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Active filter pills */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.category.map((c) => (
                <FilterPill key={c} label={c} onRemove={() =>
                  setFilters((f) => ({ ...f, category: f.category.filter((v) => v !== c) }))} />
              ))}
              {filters.brand.map((b) => (
                <FilterPill key={b} label={b} onRemove={() =>
                  setFilters((f) => ({ ...f, brand: f.brand.filter((v) => v !== b) }))} />
              ))}
              {filters.condition.map((c) => (
                <FilterPill key={c} label={c} onRemove={() =>
                  setFilters((f) => ({ ...f, condition: f.condition.filter((v) => v !== c) }))} />
              ))}
              {filters.gender && (
                <FilterPill label={filters.gender} onRemove={() => setFilters((f) => ({ ...f, gender: '' }))} />
              )}
              {filters.size.map((s) => (
                <FilterPill key={s} label={`Size ${s}`} onRemove={() =>
                  setFilters((f) => ({ ...f, size: f.size.filter((v) => v !== s) }))} />
              ))}
              {(filters.priceMin || filters.priceMax) && (
                <FilterPill
                  label={`₹${filters.priceMin || '0'} – ₹${filters.priceMax || '∞'}`}
                  onRemove={() => setFilters((f) => ({ ...f, priceMin: '', priceMax: '' }))}
                />
              )}
              <button onClick={resetFilters} className="text-xs" style={{ color: 'var(--accent-red)' }}>
                Clear all
              </button>
            </div>
          )}

          <ProductGrid products={products} loading={loading} />

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost px-4 py-2 text-sm disabled:opacity-40"
              >
                ← Prev
              </button>

              {Array.from({ length: Math.min(7, pagination.pages) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: page === p ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color:      page === p ? '#fff' : 'var(--text-secondary)',
                      border:     `1px solid ${page === p ? 'var(--accent-primary)' : 'var(--border)'}`,
                    }}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-ghost px-4 py-2 text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Drawer ──────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0" style={{ background: 'var(--overlay)' }} onClick={() => setDrawerOpen(false)} />
          <div
            className="absolute left-0 top-0 bottom-0 w-80 overflow-y-auto p-4 animate-slide-right"
            style={{ background: 'var(--bg-primary)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Filters</span>
              <button onClick={() => setDrawerOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={22} />
              </button>
            </div>
            <ProductFilters
              filters={filters}
              onChange={(f) => { setFilters(f); setDrawerOpen(false); }}
              onReset={() => { resetFilters(); setDrawerOpen(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPill({ label, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
      style={{ background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)', color: 'var(--accent-primary)' }}
    >
      {label}
      <button onClick={onRemove} className="hover:opacity-70"><X size={12} /></button>
    </span>
  );
}
