// SellerDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Package, ShoppingBag, TrendingUp, Star, PlusCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, formatDate, orderStatusColor } from '../../utils/helpers';
import { Spinner } from '../../components/common/Loader';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [listings, setListings] = useState({ pending:0, approved:0, sold:0, total:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      orderService.getSellerOrders(),
      api.get('/products/seller/my-listings'),
    ]).then(([oRes, pRes]) => {
      setOrders(oRes.data.data.orders.slice(0, 5));
      const prods = pRes.data.data.products;
      setListings({
        total:    prods.length,
        pending:  prods.filter((p) => p.status === 'pending').length,
        approved: prods.filter((p) => p.status === 'approved').length,
        sold:     prods.filter((p) => p.status === 'sold').length,
      });
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const stats = user?.sellerStats || {};

  const statCards = [
    { label: 'Total Listed',     value: listings.total,                icon: <Package size={20} />,      color: 'var(--accent-primary)' },
    { label: 'Active',           value: listings.approved,             icon: <ShoppingBag size={20} />,  color: 'var(--accent-green)' },
    { label: 'Total Sold',       value: stats.totalSold || 0,          icon: <TrendingUp size={20} />,   color: 'var(--accent-green)' },
    { label: 'Total Earned',     value: formatPrice(stats.totalEarned||0), icon: '₹',                   color: 'var(--accent-yellow)' },
    { label: 'Avg Rating',       value: stats.rating ? `${stats.rating}★` : '—', icon: <Star size={20}/>, color: 'var(--accent-yellow)' },
  ];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Seller Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name?.split(' ')[0]}!</p>
        </div>
        <Link to="/seller/list-product" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> List Item
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 font-bold text-lg"
              style={{ background: `color-mix(in srgb, ${s.color} 12%, transparent)`, color: s.color }}>
              {typeof s.icon === 'string' ? s.icon : s.icon}
            </div>
            <p className="font-grotesk font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'View All Listings', path: '/seller/listings', badge: listings.pending > 0 ? `${listings.pending} pending` : null },
          { label: 'View Orders',       path: '/seller/orders' },
          { label: 'List New Item',     path: '/seller/list-product' },
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

      {/* Recent Orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne font-bold" style={{ color: 'var(--text-primary)' }}>Recent Orders</h2>
          <Link to="/seller/orders" className="text-sm" style={{ color: 'var(--accent-primary)' }}>View all</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : orders.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th className="text-left pb-3 font-medium">Item</th>
                  <th className="text-left pb-3 font-medium">Buyer</th>
                  <th className="text-left pb-3 font-medium">Amount</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="py-3 pr-4" style={{ color: 'var(--text-primary)' }}>
                      <p className="font-medium line-clamp-1 max-w-[180px]">{o.productSnapshot?.title}</p>
                    </td>
                    <td className="py-3 pr-4" style={{ color: 'var(--text-secondary)' }}>{o.buyerId?.name}</td>
                    <td className="py-3 pr-4 font-grotesk" style={{ color: 'var(--accent-primary)' }}>{formatPrice(o.payment?.amount)}</td>
                    <td className="py-3 pr-4"><span className={`badge ${orderStatusColor(o.status)}`}>{o.status}</span></td>
                    <td className="py-3" style={{ color: 'var(--text-muted)' }}>{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
