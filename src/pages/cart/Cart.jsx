import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/helpers';
import { Spinner } from '../../components/common/Loader';

export default function Cart() {
  const { items, loading, fetchCart, removeFromCart } = useCart();
  const { isAuth } = useAuth();
  const navigate   = useNavigate();

  useEffect(() => { if (isAuth) fetchCart(); }, [isAuth]);

  const availableItems = items.filter((i) => i.productId?.status === 'approved');
  const soldItems      = items.filter((i) => i.productId?.status === 'sold');
  const subtotal       = availableItems.reduce((s, i) => s + (i.productId?.sellingPrice || 0), 0);

  if (loading) return (
    <div className="page-container flex justify-center py-20"><Spinner size={32} /></div>
  );

  if (items.length === 0) return (
    <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
      <ShoppingBag size={64} className="mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
      <h2 className="section-title">Your cart is empty</h2>
      <p className="mt-2 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Find something you love and add it here.
      </p>
      <Link to="/browse" className="btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">Your Cart ({availableItems.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Cart Items ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          {/* Sold warnings */}
          {soldItems.map((item) => (
            <div key={item._id}
              className="flex items-center gap-3 p-4 rounded-xl border"
              style={{ borderColor: 'var(--accent-yellow)', background: 'color-mix(in srgb, var(--accent-yellow) 5%, transparent)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--accent-yellow)' }} />
              <p className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
                <strong>{item.productId?.title}</strong> was sold to another buyer.
              </p>
              <button onClick={() => removeFromCart(item.productId._id)}
                className="text-xs" style={{ color: 'var(--accent-red)' }}>Remove</button>
            </div>
          ))}

          {/* Available items */}
          {availableItems.map((item) => {
            const p = item.productId;
            if (!p) return null;
            return (
              <div key={item._id} className="card p-4 flex gap-4 items-start">
                <Link to={`/product/${p._id}`}>
                  <img src={p.images?.[0]} alt={p.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    style={{ background: 'var(--bg-elevated)' }} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${p._id}`}>
                    <h3 className="font-medium text-sm line-clamp-1 hover:text-[var(--accent-primary)] transition-colors"
                      style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
                  </Link>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {p.brand} · Size {p.size} · {p.condition}
                  </p>
                  <p className="price text-base mt-2">{formatPrice(p.sellingPrice)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(p._id)}
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-elevated)] flex-shrink-0"
                  style={{ color: 'var(--accent-red)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Order Summary ─────────────────────────────────────────────── */}
        <div>
          <div className="card p-5 sticky top-20">
            <h2 className="font-syne font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
              Order Summary
            </h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                <span>Items ({availableItems.length})</span>
                <span className="font-grotesk">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                <span>Shipping</span>
                <span className="badge-green text-xs font-medium" style={{ color: 'var(--accent-green)' }}>
                  Seller managed
                </span>
              </div>
            </div>
            <div className="divider" />
            <div className="flex justify-between items-center mb-5">
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Subtotal</span>
              <span className="font-grotesk font-bold text-xl" style={{ color: 'var(--accent-primary)' }}>
                {formatPrice(subtotal)}
              </span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              disabled={availableItems.length === 0}
              className="btn-primary w-full disabled:opacity-50"
            >
              Proceed to Checkout
            </button>
            <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
              Each item is checked out separately via Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
