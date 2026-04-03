// AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingBag, TrendingUp, ArrowRight, CheckCircle, X, AlertTriangle, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import { Spinner } from '../../components/common/Loader';

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard-stats'),
      api.get('/admin/products/pending?status=pending&limit=5'),
    ]).then(([sRes, pRes]) => {
      setStats(sRes.data.data);
      setPending(pRes.data.data.products);
    }).catch(() => toast.error('Could not load admin data'))
    .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/products/${id}/approve`);
      setPending((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product approved ✓');
    } catch { toast.error('Approval failed'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.put(`/admin/products/${id}/reject`, { reason });
      setPending((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product rejected');
    } catch { toast.error('Rejection failed'); }
  };

  if (loading) return <div className="page-container flex justify-center py-20"><Spinner size={32} /></div>;

  const statCards = [
    { label: 'Total Users',     value: stats?.totalUsers,    icon: <Users size={20} />,       color: 'var(--accent-primary)' },
    { label: 'Total Products',  value: stats?.totalProducts, icon: <Package size={20} />,     color: 'var(--accent-green)' },
    { label: 'Pending Review',  value: stats?.pendingProducts, icon: <Package size={20} />,   color: 'var(--accent-yellow)' },
    { label: 'Total Orders',    value: stats?.totalOrders,   icon: <ShoppingBag size={20} />, color: 'var(--accent-primary)' },
    { label: 'Total Revenue',   value: formatPrice(stats?.totalRevenue || 0), icon: <TrendingUp size={20} />, color: 'var(--accent-green)' },
  ];

  return (
    <div className="page-container">
      <h1 className="section-title mb-4">Admin Dashboard</h1>

      {/* Pending alert banner */}
      {stats?.pendingProducts > 0 && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl mb-6"
          style={{ background: 'color-mix(in srgb, var(--accent-yellow) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-yellow) 30%, transparent)' }}>
          <AlertTriangle size={20} color="var(--accent-yellow)" style={{ flexShrink: 0 }} />
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {stats.pendingProducts} product{stats.pendingProducts > 1 ? 's' : ''} waiting for review
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              New listings need approval before they appear to buyers
            </p>
          </div>
          <Link to="/admin/products" className="btn-primary text-sm py-2 px-4 flex-shrink-0">
            Review Now
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ background: `color-mix(in srgb, ${s.color} 12%, transparent)`, color: s.color }}>
              {s.icon}
            </div>
            <p className="font-grotesk font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Admin links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Product Verification', path: '/admin/products', badge: stats?.pendingProducts > 0 ? `${stats.pendingProducts} pending` : null },
          { label: 'User Management',      path: '/admin/users' },
          { label: 'Order Monitoring',     path: '/admin/orders' },
          { label: 'Reports',               path: '/admin/reports', badge: null },
        ].map((item) => (
          <Link key={item.path} to={item.path}
            className="card p-4 flex items-center justify-between hover:bg-[var(--bg-elevated)] transition-colors">
            <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
            <div className="flex items-center gap-2">
              {item.badge && <span className="badge badge-yellow">{item.badge}</span>}
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
          </Link>
        ))}
      </div>

      {/* Pending products quick review */}
      {pending.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold" style={{ color: 'var(--text-primary)' }}>
              Pending Review ({pending.length})
            </h2>
            <Link to="/admin/products" className="text-sm" style={{ color: 'var(--accent-primary)' }}>View all</Link>
          </div>
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p._id} className="flex items-center gap-3 py-3 border-b last:border-0"
                style={{ borderColor: 'var(--border)' }}>
                <img src={p.images?.[0]} className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  style={{ background: 'var(--bg-elevated)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1" style={{ color: 'var(--text-primary)' }}>{p.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {p.brand} · by {p.sellerId?.name} · {formatDate(p.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(p._id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-elevated)]"
                    style={{ color: 'var(--accent-green)' }}>
                    <CheckCircle size={18} />
                  </button>
                  <button onClick={() => handleReject(p._id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-elevated)]"
                    style={{ color: 'var(--accent-red)' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}