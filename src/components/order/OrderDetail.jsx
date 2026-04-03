import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle, CreditCard, MapPin,
  ChevronLeft, Star, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/orderService';
import { reviewService } from '../../services/reviewService';
import { OrderTimeline } from '../../components/order/OrderTimeline';
import { formatPrice, formatDate, orderStatusColor } from '../../utils/helpers';
import { PageLoader, Spinner } from '../../components/common/Loader';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [review, setReview]           = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting]   = useState(false);
  const [cancelling, setCancelling]   = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderService.getById(id)
      .then(({ data }) => {
        setOrder(data.data.order);
      })
      .catch((err) => {
        console.error('Order fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Could not load this order');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Cancel this order? This cannot be undone.')) return;
    setCancelling(true);
    try {
      const { data } = await orderService.cancel(id);
      setOrder(data.data.order);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const handleReview = async () => {
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('orderId', order._id);
      form.append('rating',  review.rating);
      form.append('title',   review.title);
      form.append('comment', review.comment);
      await reviewService.create(form);
      setOrder((prev) => ({ ...prev, isReviewed: true }));
      toast.success('Review submitted! ⭐');
      setReviewModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  // Error state
  if (error) return (
    <div className="page-container max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
      <p className="text-lg font-semibold mb-2" style={{ color: 'var(--accent-red)' }}>{error}</p>
      <Link to="/orders" className="btn-primary mt-4">Back to Orders</Link>
    </div>
  );

  if (!order) return null;

  const snap    = order.productSnapshot || {};
  const addr    = order.shippingAddress  || {};
  const payment = order.payment          || {};
  const isJustPaid = order.status === 'Confirmed' && payment.status === 'paid';

  return (
    <div className="page-container max-w-2xl mx-auto">

      {/* Back */}
      <button onClick={() => navigate('/orders')}
        className="flex items-center gap-1 text-sm mb-6 transition-colors hover:text-[var(--accent-primary)]"
        style={{ color: 'var(--text-secondary)' }}>
        <ChevronLeft size={16} /> My Orders
      </button>

      {/* ── Success banner ─────────────────────────────────────────────── */}
      {isJustPaid && (
        <div className="rounded-2xl p-6 text-center mb-6 animate-slide-up"
          style={{
            background: 'color-mix(in srgb, var(--accent-green) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-green) 25%, transparent)',
          }}>
          <CheckCircle size={40} className="mx-auto mb-3" style={{ color: 'var(--accent-green)' }} />
          <h2 className="font-syne font-bold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>
            Payment Successful! 🎉
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your order is confirmed and the seller has been notified.
          </p>
        </div>
      )}

      {/* ── Order header ───────────────────────────────────────────────── */}
      <div className="card p-5 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Order #{order._id?.slice(-10)?.toUpperCase()}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {order.createdAt ? formatDate(order.createdAt) : ''}
            </p>
          </div>
          <span className={`badge ${orderStatusColor(order.status)} text-sm px-3 py-1`}>
            {order.status}
          </span>
        </div>

        {/* Product */}
        <div className="flex gap-4 items-start">
          {snap.image && (
            <img src={snap.image} alt={snap.title || 'Product'}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              style={{ background: 'var(--bg-elevated)' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-syne font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
              {snap.title || 'Product'}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {[snap.brand, snap.size && `Size ${snap.size}`, snap.condition].filter(Boolean).join(' · ')}
            </p>
            {payment.amount && (
              <p className="price text-xl mt-2">{formatPrice(payment.amount)}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Order Timeline ─────────────────────────────────────────────── */}
      <div className="card p-5 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--text-muted)' }}>Order Progress</p>
        <OrderTimeline status={order.status} />

        {order.statusHistory?.length > 0 && (
          <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>{h.status}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {h.updatedAt ? formatDate(h.updatedAt) : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Shipping Address ───────────────────────────────────────────── */}
      {/* Shipping address — only show if at least one real field exists */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} style={{ color: 'var(--accent-primary)' }} />
          <p className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}>Delivery Address</p>
        </div>
        {(addr.name || addr.street || addr.city) ? (
          <>
            {addr.name && (
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                {addr.name}{addr.phone ? ` · ${addr.phone}` : ''}
              </p>
            )}
            {(addr.street || addr.city) && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {[addr.street, addr.city, addr.state].filter(Boolean).join(', ')}
                {addr.pincode ? ` – ${addr.pincode}` : ''}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Address not provided — buyer and seller to arrange delivery directly.
          </p>
        )}
      </div>

      {/* ── Payment Info ───────────────────────────────────────────────── */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={16} style={{ color: 'var(--accent-primary)' }} />
          <p className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}>Payment</p>
        </div>
        <div className="space-y-2 text-sm">
          {payment.amount && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Amount Paid</span>
              <span className="price font-bold">{formatPrice(payment.amount)}</span>
            </div>
          )}
          {payment.razorpayPaymentId && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Payment ID</span>
              <span className="font-grotesk text-xs" style={{ color: 'var(--text-muted)' }}>
                {payment.razorpayPaymentId}
              </span>
            </div>
          )}
          {payment.status && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Status</span>
              <span className={`badge ${payment.status === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
                {payment.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {order.status === 'Delivered' && !order.isReviewed && (
          <button onClick={() => setReviewModal(true)}
            className="btn-secondary flex items-center gap-2">
            <Star size={16} /> Leave Review
          </button>
        )}
        {order.status === 'Confirmed' && (
          <button onClick={handleCancel} disabled={cancelling}
            className="btn-danger flex items-center gap-2">
            {cancelling ? <Spinner size={14} /> : <X size={14} />}
            Cancel Order
          </button>
        )}
        {order.isReviewed && (
          <span className="badge badge-green text-sm px-4 py-2">✓ Reviewed</span>
        )}
        <Link to="/orders" className="btn-ghost">All Orders</Link>
        <Link to="/browse" className="btn-ghost">Keep Shopping</Link>
      </div>

      {/* ── Review Modal ───────────────────────────────────────────────── */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'var(--overlay)' }}>
          <div className="card p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-syne font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Leave a Review
              </h2>
              <button onClick={() => setReviewModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{snap.title}</p>
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <button key={i} onClick={() => setReview({ ...review, rating: i + 1 })}>
                  <Star size={28}
                    fill={i < review.rating ? 'var(--accent-yellow)' : 'none'}
                    stroke="var(--accent-yellow)"
                    className="transition-transform hover:scale-110" />
                </button>
              ))}
            </div>
            <input className="input mb-3" placeholder="Title (optional)"
              value={review.title}
              onChange={(e) => setReview({ ...review, title: e.target.value })} />
            <textarea className="input mb-4 resize-none" rows={3}
              placeholder="Share your experience…"
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })} />
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleReview} disabled={submitting} className="btn-primary flex-1">
                {submitting ? <Spinner size={16} /> : <Star size={16} />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}