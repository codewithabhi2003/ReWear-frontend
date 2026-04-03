import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatPrice, formatDate, orderStatusColor } from '../../utils/helpers';
import { Spinner } from '../../components/common/Loader';

const STATUSES = ['', 'Payment Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...(statusFilter && { status: statusFilter }) };
      const { data } = await api.get('/admin/orders', { params });
      setOrders(data.data.orders);
      setTotal(data.data.pagination.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter, page]);

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">Order Monitoring</h1>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input max-w-xs"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s || 'All Statuses'}</option>
          ))}
        </select>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{total} orders</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--bg-elevated)' }}>
                <tr>
                  {['Order ID', 'Product', 'Buyer', 'Seller', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-t hover:bg-[var(--bg-elevated)] transition-colors"
                    style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3 font-grotesk text-xs" style={{ color: 'var(--text-muted)' }}>
                      #{o._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="font-medium line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                        {o.productSnapshot?.title}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {o.productSnapshot?.brand}
                      </p>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{o.buyerId?.name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{o.sellerId?.name}</td>
                    <td className="px-4 py-3 price text-sm">{formatPrice(o.payment?.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${orderStatusColor(o.status)}`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(o.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>No orders found</p>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className="flex justify-center gap-2 p-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-40">← Prev</button>
              <span className="px-3 py-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 20)}
                className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
