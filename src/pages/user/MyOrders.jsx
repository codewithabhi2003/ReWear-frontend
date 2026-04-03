import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/orderService';
import { reviewService } from '../../services/reviewService';
import { OrderTimeline } from '../../components/order/OrderTimeline';
import { formatPrice, formatDate, orderStatusColor } from '../../utils/helpers';
import { Spinner } from '../../components/common/Loader';

export default function MyOrders() {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [review, setReview]         = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    orderService.getMyOrders()
      .then(({ data }) => setOrders(data.data.orders))
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(orderId);
    try {
      await orderService.cancel(orderId);
      setOrders((prev) => prev.map((o) =>
        o._id === orderId ? { ...o, status: 'Cancelled' } : o
      ));
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(null);
    }
  };

  const handleReview = async () => {
    if (!reviewOrder) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('orderId', reviewOrder._id);
      form.append('rating', review.rating);
      form.append('title', review.title);
      form.append('comment', review.comment);
      await reviewService.create(form);
      setOrders((prev) => prev.map((o) =>
        o._id === reviewOrder._id ? { ...o, isReviewed: true } : o
      ));
      toast.success('Review submitted! ⭐');
      setReviewOrder(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="page-container flex justify-center py-20"><Spinner size={32} /></div>
  );

  if (!orders.length) return (
    <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Package size={64} className="mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
      <h2 className="section-title">No orders yet</h2>
      <p className="mt-2 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Your purchases will appear here.
      </p>
      <Link to="/browse" className="btn-primary">Start Shopping</Link>
    </div>
  );

  return (
    <div className="page-container max-w-3xl mx-auto">
      <h1 className="section-title mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="card p-5">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Order #{order._id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}
                </p>
                <p className="font-syne font-bold text-lg mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {order.productSnapshot?.title}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {order.productSnapshot?.brand} · Size {order.productSnapshot?.size}
                </p>
              </div>
              <div className="text-right">
                <p className="price text-xl">{formatPrice(order.payment?.amount)}</p>
                <span className={`badge ${orderStatusColor(order.status)} mt-1`}>{order.status}</span>
              </div>
            </div>

            {/* Timeline */}
            <OrderTimeline status={order.status} />

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              {order.status === 'Delivered' && !order.isReviewed && (
                <button onClick={() => setReviewOrder(order)} className="btn-secondary text-sm px-4 py-2">
                  <Star size={14} /> Leave Review
                </button>
              )}
              {order.status === 'Confirmed' && (
                <button
                  onClick={() => handleCancel(order._id)}
                  disabled={cancelling === order._id}
                  className="btn-danger text-sm px-4 py-2"
                >
                  {cancelling === order._id ? <Spinner size={14} /> : <X size={14} />}
                  Cancel Order
                </button>
              )}
              {order.isReviewed && (
                <span className="badge badge-green text-xs">✓ Reviewed</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Review Modal ─────────────────────────────────────────────────── */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'var(--overlay)' }}>
          <div className="card p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-syne font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Leave a Review
              </h2>
              <button onClick={() => setReviewOrder(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {reviewOrder.productSnapshot?.title}
            </p>

            {/* Star rating */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <button key={i} onClick={() => setReview({ ...review, rating: i + 1 })}>
                  <Star size={28}
                    fill={i < review.rating ? 'var(--accent-yellow)' : 'none'}
                    stroke="var(--accent-yellow)"
                    className="transition-transform hover:scale-110"
                  />
                </button>
              ))}
            </div>

            <input
              className="input mb-3"
              placeholder="Review title (optional)"
              value={review.title}
              onChange={(e) => setReview({ ...review, title: e.target.value })}
            />
            <textarea
              className="input mb-4 resize-none"
              rows={3}
              placeholder="Share your experience…"
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
            />
            <div className="flex gap-3">
              <button onClick={() => setReviewOrder(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleReview} disabled={submitting} className="btn-primary flex-1">
                {submitting ? <Spinner size={16} /> : <Star size={16} />}
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
