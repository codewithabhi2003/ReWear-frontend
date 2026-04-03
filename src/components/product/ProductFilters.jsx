import { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories', 'Ethnic', 'Activewear'];
const CONDITIONS  = ['Brand New with Tags', 'Like New', 'Good', 'Fair'];
const GENDERS     = ['men', 'women', 'unisex', 'kids'];
const SIZES       = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44'];
const BRANDS      = ['Nike', 'Adidas', 'Zara', 'H&M', "Levi's", 'Mango', 'Puma', 'Uniqlo', 'Gap', 'Tommy Hilfiger', 'Calvin Klein', 'Reebok'];
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'most_viewed',label: 'Most Viewed' },
];

function CheckGroup({ label, options, selected, onChange }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const val   = typeof opt === 'object' ? opt.value : opt;
          const lbl   = typeof opt === 'object' ? opt.label : opt;
          const checked = selected.includes(val);
          return (
            <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange(val)}
                className="w-4 h-4 rounded accent-[var(--accent-primary)] cursor-pointer"
              />
              <span className="text-sm transition-colors group-hover:text-[var(--text-primary)]"
                style={{ color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {lbl}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductFilters({ filters, onChange, onReset }) {
  const toggle = (key, val) => {
    const current = filters[key] || [];
    const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
    onChange({ ...filters, [key]: next });
  };

  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="card p-5 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} style={{ color: 'var(--accent-primary)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Filters</span>
        </div>
        <button onClick={onReset} className="text-xs" style={{ color: 'var(--accent-primary)' }}>
          Reset All
        </button>
      </div>

      {/* Sort */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Sort By</p>
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => set('sort', e.target.value)}
          className="input text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Price Range (₹)</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ''}
            onChange={(e) => set('priceMin', e.target.value)}
            className="input text-sm w-1/2"
            min="0"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ''}
            onChange={(e) => set('priceMax', e.target.value)}
            className="input text-sm w-1/2"
            min="0"
          />
        </div>
      </div>

      <div className="divider" />

      <CheckGroup label="Category"  options={CATEGORIES}  selected={filters.category  || []} onChange={(v) => toggle('category',  v)} />
      <CheckGroup label="Gender"    options={GENDERS}     selected={filters.gender    ? [filters.gender] : []}
        onChange={(v) => set('gender', filters.gender === v ? '' : v)} />
      <CheckGroup label="Condition" options={CONDITIONS}  selected={filters.condition || []} onChange={(v) => toggle('condition', v)} />
      <CheckGroup label="Brand"     options={BRANDS}      selected={filters.brand     || []} onChange={(v) => toggle('brand',     v)} />

      {/* Sizes (pills) */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const active = (filters.size || []).includes(s);
            return (
              <button
                key={s}
                onClick={() => toggle('size', s)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: active ? 'var(--accent-primary)' : 'var(--bg-input)',
                  color:      active ? '#fff' : 'var(--text-secondary)',
                  border:     `1px solid ${active ? 'var(--accent-primary)' : 'var(--border)'}`,
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
