// BrandBadge.jsx
export function BrandBadge({ brand, size = 'sm' }) {
  return (
    <span
      className={`badge badge-brand font-medium ${size === 'lg' ? 'text-sm px-3 py-1' : 'text-[11px]'}`}
    >
      {brand}
    </span>
  );
}

// ConditionBadge.jsx
import { conditionColor } from '../../utils/helpers';

export function ConditionBadge({ condition, size = 'sm' }) {
  return (
    <span className={`badge ${conditionColor(condition)} ${size === 'lg' ? 'text-sm px-3 py-1' : 'text-[11px]'}`}>
      {condition}
    </span>
  );
}
