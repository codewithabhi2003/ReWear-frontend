// AdminProducts.jsx
import { useState, useEffect } from 'react';
import { CheckCircle, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import { Spinner } from '../../components/common/Loader';

const TABS = ['pending', 'approved', 'rejected', 'all'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [tab, setTab]           = useState('pending');
  const [loading, setLoading]   = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason]     = useState('');

  const fetch = async (status) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/products/pending?status=${status}`);
      setProducts(data.data.products);
    } catch { toast.error('Could not load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(tab); }, [tab]);

  const approve = async (id) => {
    try {
      await api.put(`/admin/products/${id}/approve`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Approved ✓');
    } catch { toast.error('Failed'); }
  };

  const submitReject = async () => {
    if (!reason.trim()) { toast.error('Enter a reason'); return; }
    try {
      await api.put(`/admin/products/${rejectModal}/reject`, { reason });
      setProducts((prev) => prev.filter((p) => p._id !== rejectModal));
      toast.success('Rejected');
      setRejectModal(null);
      setReason('');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">Product Verification</h1>

      <div className="flex gap-1 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all"
            style={{
              background: tab === t ? 'var(--accent-primary)' : 'var(--bg-card)',
              color:      tab === t ? '#fff' : 'var(--text-secondary)',
              border:     `1px solid ${tab === t ? 'var(--accent-primary)' : 'var(--border)'}`,
            }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>No products in this tab</div>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p._id} className="card p-5">
              <div className="flex flex-wrap gap-4">
                <div className="flex gap-3">
                  {p.images?.slice(0, 3).map((img, i) => (
                    <img key={i} src={img} className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      style={{ background: 'var(--bg-elevated)' }} />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {p.brand} · {p.category} · {p.gender} · Size {p.size} · {p.condition}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Seller: <strong>{p.sellerId?.name}</strong> ({p.sellerId?.email}) · {formatDate(p.createdAt)}
                  </p>
                  <p className="price text-base mt-1">{formatPrice(p.sellingPrice)}</p>
                  {p.description && (
                    <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{p.description}</p>
                  )}
                  {p.adminNote && (
                    <p className="text-xs mt-1" style={{ color: 'var(--accent-red)' }}>
                      Rejection reason: {p.adminNote}
                    </p>
                  )}
                </div>
              </div>
              {(p.status === 'pending') && (
                <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button onClick={() => approve(p._id)} className="btn-primary text-sm px-4 py-2 flex items-center gap-1">
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button onClick={() => setRejectModal(p._id)} className="btn-danger text-sm px-4 py-2 flex items-center gap-1">
                    <X size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'var(--overlay)' }}>
          <div className="card p-6 w-full max-w-md animate-slide-up">
            <h2 className="font-syne font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Rejection Reason</h2>
            <textarea className="input resize-none mb-4" rows={3}
              placeholder="Tell the seller why their listing was rejected…"
              value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={submitReject} className="btn-danger flex-1">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
