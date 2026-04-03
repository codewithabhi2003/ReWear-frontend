import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import ProductGrid from '../../components/product/ProductGrid';

export default function Wishlist() {
  const { isAuth } = useAuth();
  const { items, loading, fetchWishlist } = useWishlist();

  useEffect(() => { if (isAuth) fetchWishlist(); }, [isAuth]);

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <Heart size={24} style={{ color: 'var(--accent-red)' }} fill="var(--accent-red)" />
        <h1 className="section-title">Wishlist ({items.length})</h1>
      </div>

      {!loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <Heart size={64} className="mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <h2 className="font-syne font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            Your wishlist is empty
          </h2>
          <p className="mt-2 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Start saving items you love!
          </p>
          <Link to="/browse" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <ProductGrid products={items} loading={loading} emptyMessage="Nothing wishlisted yet." />
      )}
    </div>
  );
}
