import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, CreditCard, CheckCircle, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { paymentService } from '../../services/paymentService';
import { formatPrice } from '../../utils/helpers';
import { Spinner } from '../../components/common/Loader';
import api from '../../services/api';

const STEPS = ['Address', 'Review', 'Payment'];

export default function Checkout() {
  const { user }                         = useAuth();
  const { items, fetchCart, removeFromCart } = useCart();
  const navigate                         = useNavigate();
  const [searchParams]                   = useSearchParams();

  // Negotiated purchase params (from chat Pay button)
  const isNegotiated  = searchParams.get('negotiated') === 'true';
  const negProductId  = searchParams.get('productId');
  const negPrice      = Number(searchParams.get('price'));
  const negChatId     = searchParams.get('chatId');

  const [step, setStep]       = useState(0);
  const [paying, setPaying]   = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [negProduct, setNegProduct] = useState(null);

  const [address, setAddress] = useState({
    name:    user?.name             || '',
    phone:   user?.phone            || '',
    street:  user?.address?.street  || '',
    city:    user?.address?.city    || '',
    state:   user?.address?.state   || '',
    pincode: user?.address?.pincode || '',
  });

  const availableItems = items.filter((i) => i.productId?.status === 'approved');

  useEffect(() => {
    if (!isNegotiated) {
      fetchCart();
    } else if (negProductId) {
      // Fetch the negotiated product for display
      api.get(`/products/${negProductId}`)
        .then(({ data }) => setNegProduct(data.data?.product || data.data))
        .catch(() => {});
    }
  }, []);

  const validateAddress = () => {
    const { name, phone, street, city, state, pincode } = address;
    if (!name || !phone || !street || !city || !state || !pincode) {
      toast.error('Please fill in all address fields');
      return false;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  // ── Normal cart payment ────────────────────────────────────────────────────
  const handleNormalPay = async () => {
    if (availableItems.length === 0) { toast.error('No items available'); return; }
    setPaying(true);
    for (const item of availableItems) {
      const product = item.productId;
      if (!product) continue;
      try {
        toast.loading(`Paying for ${product.title}…`, { id: product._id });
        const order = await paymentService.initiatePayment(product._id, address, user);
        toast.success(`${product.title} — order placed!`, { id: product._id });
        setDoneCount((c) => c + 1);
        navigate(`/orders/${order._id}`, { replace: true });
        return;
      } catch (err) {
        const msg = err.message || 'Payment failed';
        if (msg.includes('cancelled')) {
          toast.dismiss(product._id);
          toast('Payment cancelled', { icon: '⚠️' });
          break;
        }
        toast.error(msg, { id: product._id });
      }
    }
    setPaying(false);
    await fetchCart();
  };

  // ── Negotiated payment ─────────────────────────────────────────────────────
  const handleNegotiatedPay = async () => {
    if (!window.Razorpay) { toast.error('Payment SDK not loaded — please refresh'); return; }
    setPaying(true);
    try {
      const { data } = await api.post('/orders/from-chat', {
        chatId:      negChatId,
        agreedPrice: negPrice,
        productId:   negProductId,
        shippingAddress: address,
      });

      const order = data.data.order;

      const rzp = new window.Razorpay({
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:      order.amount,
        currency:    'INR',
        name:        'ReWear',
        description: negProduct?.title || 'Negotiated purchase',
        order_id:    order.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId:           order._id,
            });
            toast.success('Payment successful! 🎉');
            navigate(`/orders/${order._id}`, { replace: true });
          } catch {
            toast.error('Payment verification failed — contact support');
          }
        },
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme:   { color: '#FF6B35' },
      });
      rzp.on('payment.failed', () => { toast.error('Payment failed'); });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
    } finally {
      setPaying(false);
    }
  };

  const handlePay = () => isNegotiated ? handleNegotiatedPay() : handleNormalPay();

  const set = (key) => (e) => setAddress({ ...address, [key]: e.target.value });

  // Review items to show
  const reviewItems = isNegotiated
    ? (negProduct ? [{ _id: negProduct._id, productId: { ...negProduct, sellingPrice: negPrice } }] : [])
    : availableItems;

  const totalAmount = isNegotiated
    ? negPrice
    : availableItems.reduce((s, i) => s + (i.productId?.sellingPrice || 0), 0);

  return (
    <div className="page-container max-w-3xl mx-auto">
      <h1 className="section-title mb-2">Checkout</h1>

      {/* Negotiated badge */}
      {isNegotiated && (
        <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl"
          style={{ background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-primary) 25%, transparent)' }}>
          <Tag size={15} style={{ color: 'var(--accent-primary)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>
            Negotiated price: {formatPrice(negPrice)}
          </p>
          <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
            Price agreed in chat
          </span>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
              style={{
                background: i <= step ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                color: i <= step ? '#fff' : 'var(--text-muted)',
              }}
            >
              {i < step ? <CheckCircle size={16} /> : i + 1}
            </button>
            <span className="text-sm hidden sm:block"
              style={{ color: i === step ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-2 w-12"
                style={{ background: i < step ? 'var(--accent-primary)' : 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 0: Address ─────────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="card p-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 className="font-syne font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Shipping Address
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
              <input value={address.name}    onChange={set('name')}    className="input" placeholder="Name on delivery" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone *</label>
              <input value={address.phone}   onChange={set('phone')}   className="input" placeholder="10-digit number" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Street Address *</label>
              <input value={address.street}  onChange={set('street')}  className="input" placeholder="House no., Street, Locality" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>City *</label>
              <input value={address.city}    onChange={set('city')}    className="input" placeholder="City" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>State *</label>
              <input value={address.state}   onChange={set('state')}   className="input" placeholder="State" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Pincode *</label>
              <input value={address.pincode} onChange={set('pincode')} className="input" placeholder="6-digit pincode" />
            </div>
          </div>
          <button onClick={() => validateAddress() && setStep(1)} className="btn-primary w-full mt-2">
            Continue to Review →
          </button>
        </div>
      )}

      {/* ── Step 1: Review ──────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4 animate-slide-up">
          <div className="card p-5">
            <h2 className="font-syne font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Order Items</h2>
            {reviewItems.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No items available.</p>
            ) : reviewItems.map((item) => {
              const p = item.productId;
              return (
                <div key={item._id || p._id} className="flex gap-3 py-3 border-b last:border-0"
                  style={{ borderColor: 'var(--border)' }}>
                  <img src={p.images?.[0]} alt={p.title}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    style={{ background: 'var(--bg-elevated)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1" style={{ color: 'var(--text-primary)' }}>{p.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{p.brand} · {p.size}</p>
                    {isNegotiated && (
                      <span className="badge badge-green text-[10px] mt-1">Negotiated price</span>
                    )}
                  </div>
                  <span className="price text-base flex-shrink-0">{formatPrice(p.sellingPrice)}</span>
                </div>
              );
            })}
          </div>

          {/* Address summary */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-syne font-bold" style={{ color: 'var(--text-primary)' }}>Delivery To</h2>
              <button onClick={() => setStep(0)} className="text-xs" style={{ color: 'var(--accent-primary)' }}>Edit</button>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {address.name} · {address.phone}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {address.street}, {address.city}, {address.state} – {address.pincode}
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-ghost flex-1">← Back</button>
            <button onClick={() => setStep(2)} className="btn-primary flex-1">Proceed to Payment →</button>
          </div>
        </div>
      )}

      {/* ── Step 2: Payment ─────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="card p-6 text-center animate-slide-up">
          <CreditCard size={40} className="mx-auto mb-4" style={{ color: 'var(--accent-primary)' }} />
          <h2 className="font-syne font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Secure Payment
          </h2>
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            Total: <span className="price text-lg">{formatPrice(totalAmount)}</span>
          </p>
          {isNegotiated && (
            <p className="text-xs mb-2" style={{ color: 'var(--accent-primary)' }}>
              ✅ Negotiated price — agreed in chat
            </p>
          )}
          <p className="text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
            Secured by Razorpay
          </p>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-ghost flex-1">← Back</button>
            <button onClick={handlePay} disabled={paying} className="btn-primary flex-1 justify-center">
              {paying
                ? <><Spinner size={16} /> Processing…</>
                : `Pay ${formatPrice(totalAmount)}`
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}