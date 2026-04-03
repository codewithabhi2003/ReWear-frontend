// SellerOrders.jsx
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/orderService';
import { OrderTimeline } from '../../components/order/OrderTimeline';
import { formatPrice, formatDate, orderStatusColor } from '../../utils/helpers';
import { Spinner } from '../../components/common/Loader';

const NEXT_STATUS = { Confirmed: 'Packed', Packed: 'Shipped', Shipped: 'Delivered' };

export default function SellerOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    orderService.getSellerOrders()
      .then(({ data }) => setOrders(data.data.orders))
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, nextStatus) => {
    if (!confirm(`Mark as ${nextStatus}?`)) return;
    setUpdating(orderId);
    try {
      const { data } = await orderService.updateStatus(orderId, { status: nextStatus });
      setOrders((prev) => prev.map((o) => o._id === orderId ? data.data.order : o));
      toast.success(`Order marked as ${nextStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="page-container flex justify-center py-20"><Spinner size={32} /></div>;

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">Orders ({orders.length})</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="font-syne font-bold text-xl" style={{ color: 'var(--text-primary)' }}>No orders yet</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Orders for your listings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const next = NEXT_STATUS[order.status];
            return (
              <div key={order._id} className="card p-5">
                <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
                  <div className="flex gap-3 items-start">
                    <img src={order.productSnapshot?.image} alt={order.productSnapshot?.title}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      style={{ background: 'var(--bg-elevated)' }} />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {order.productSnapshot?.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {order.productSnapshot?.brand} · Size {order.productSnapshot?.size}
                      </p>
                      <p className="price text-sm mt-1">{formatPrice(order.payment?.amount)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${orderStatusColor(order.status)}`}>{order.status}</span>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                {/* Buyer info */}
                <div className="p-3 rounded-lg mb-4 text-sm" style={{ background: 'var(--bg-input)' }}>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {order.buyerId?.name}
                  </p>
                  {(() => {
                    const a = order.shippingAddress || {};
                    const parts = [a.street, a.city, a.state].filter(Boolean);
                    const hasAddr = parts.length > 0 || a.phone;
                    return hasAddr ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                        {a.phone && <span>{a.phone}</span>}
                        {a.phone && parts.length > 0 && <span> · </span>}
                        {parts.join(', ')}
                        {a.pincode && ` – ${a.pincode}`}
                      </p>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>
                        Address not provided
                      </p>
                    );
                  })()}
                </div>

                <OrderTimeline status={order.status} />

                {next && (
                  <button
                    onClick={() => updateStatus(order._id, next)}
                    disabled={updating === order._id}
                    className="btn-primary text-sm mt-4 flex items-center gap-2"
                  >
                    {updating === order._id ? <Spinner size={14} /> : <ChevronDown size={14} />}
                    Mark as {next}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}