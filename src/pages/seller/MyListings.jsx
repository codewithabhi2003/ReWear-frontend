import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, PlusCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import { formatPrice, formatDate } from '../../utils/helpers';
import { Spinner } from '../../components/common/Loader';

const TABS = ['all', 'pending', 'approved', 'rejected', 'sold', 'inactive'];

const STATUS_BADGE = {
  pending:  'badge-yellow',
  approved: 'badge-green',
  rejected: 'badge-red',
  sold:     'badge-muted',
  inactive: 'badge-muted',
};

export default function MyListings() {
  const [products, setProducts] = useState([]);
  const [tab, setTab]           = useState('all');
  const [loading, setLoading]   = useState(true);

  const fetch = async (status) => {
    setLoading(true);
    try {
      const { data } = await productService.getMyListings(status === 'all' ? {} : { status });
      setProducts(data.data.products);
    } catch { toast.error('Could not load listings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(tab); }, [tab]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await productService.delete(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Listing deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">My Listings</h1>
        <Link to="/seller/list-product" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> New Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap capitalize transition-all"
            style={{
              background: tab === t ? 'var(--accent-primary)' : 'var(--bg-card)',
              color:      tab === t ? '#fff' : 'var(--text-secondary)',
              border:     `1px solid ${tab === t ? 'var(--accent-primary)' : 'var(--border)'}`,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="font-syne font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>No listings here</p>
          <Link to="/seller/list-product" className="btn-primary mt-4">List Your First Item</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p._id} className="card p-4 flex gap-4 items-start">
              <img src={p.images?.[0]} alt={p.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                style={{ background: 'var(--bg-elevated)' }} />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {p.brand} · {p.size} · Listed {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="price text-sm">{formatPrice(p.sellingPrice)}</span>
                    <span className={`badge ${STATUS_BADGE[p.status] || 'badge-muted'} capitalize`}>{p.status}</span>
                  </div>
                </div>

                {/* Rejection note */}
                {p.status === 'rejected' && p.adminNote && (
                  <div className="flex items-start gap-2 mt-2 p-2 rounded-lg"
                    style={{ background: 'color-mix(in srgb, var(--accent-red) 8%, transparent)' }}>
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-red)' }} />
                    <p className="text-xs" style={{ color: 'var(--accent-red)' }}>
                      <strong>Rejected:</strong> {p.adminNote}
                    </p>
                  </div>
                )}
                {p.status === 'pending' && (
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Under review — admin will verify shortly
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  {['approved', 'rejected', 'pending'].includes(p.status) && (
                    <Link to={`/seller/edit/${p._id}`} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1">
                      <Edit2 size={12} /> Edit
                    </Link>
                  )}
                  {p.status !== 'sold' && (
                    <button onClick={() => handleDelete(p._id)}
                      className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1"
                      style={{ color: 'var(--accent-red)' }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                  {p.status === 'approved' && (
                    <Link to={`/product/${p._id}`} className="text-xs" style={{ color: 'var(--accent-primary)' }}>
                      View Live →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
