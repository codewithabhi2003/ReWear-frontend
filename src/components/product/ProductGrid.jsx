import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '../common/Loader';
import { ShoppingBag } from 'lucide-react';

export default function ProductGrid({ products, loading, emptyMessage = 'No products found.' }) {
  if (loading) return <ProductGridSkeleton count={8} />;

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag size={48} className="mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
        <p className="text-lg font-semibold font-syne" style={{ color: 'var(--text-primary)' }}>
          {emptyMessage}
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
