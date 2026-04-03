import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Calendar, ArrowLeft, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import ProductGrid from '../../components/product/ProductGrid';
import { formatDate, getInitials } from '../../utils/helpers';
import { PageLoader, Spinner } from '../../components/common/Loader';

// ─── WhatsApp-style avatar popover ───────────────────────────────────────────
function AvatarPopover({ seller }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-24 h-24 rounded-full overflow-hidden block transition-all hover:scale-105"
        style={{ border: '3px solid var(--accent-primary)' }}
        title="Click to view photo"
      >
        {seller.avatar
          ? <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
              style={{ background: 'var(--accent-primary)' }}>
              {getInitials(seller.name)}
            </div>
        }
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setOpen(false)}>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
            style={{ maxWidth: 360, width: '100%' }}
            onClick={(e) => e.stopPropagation()}>
            {seller.avatar
              ? <img src={seller.avatar} alt={seller.name} className="w-full object-cover" style={{ maxHeight: 420 }} />
              : <div className="w-full h-64 flex items-center justify-center text-6xl font-bold text-white"
                  style={{ background: 'var(--accent-primary)' }}>
                  {getInitials(seller.name)}
                </div>
            }
            <div className="p-4" style={{ background: 'var(--bg-elevated)' }}>
              <p className="font-syne font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{seller.name}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                ⭐ {seller.sellerStats?.rating?.toFixed(1) || '—'} · {seller.sellerStats?.totalSold || 0} sold
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SellerProfile() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { isAuth, user } = useAuth();

  const [seller, setSeller]           = useState(null);
  const [products, setProducts]       = useState([]);
  const [reviews, setReviews]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/users/seller/${id}`),
      api.get(`/products?sellerId=${id}&limit=12`),
      api.get(`/reviews/seller/${id}`),
    ])
      .then(([sRes, pRes, rRes]) => {
        setSeller(sRes.data.data.seller);
        setProducts(pRes.data.data.products || []);
        setReviews(rRes.data.data.reviews   || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Could not load seller profile');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChat = async () => {
    if (!isAuth) { navigate('/auth/login'); return; }
    if (!products || products.length === 0) {
      toast.error('This seller has no active listings to chat about');
      return;
    }
    setChatLoading(true);
    try {
      const { data } = await chatService.start(products[0]._id);
      navigate(`/chat/${data.data.chat._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start chat');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  if (error) return (
    <div className="page-container flex flex-col items-center justify-center min-h-[50vh] text-center">
      <p className="text-lg font-semibold mb-2" style={{ color: 'var(--accent-red)' }}>{error}</p>
      <button onClick={() => navigate(-1)} className="btn-ghost mt-4 flex items-center gap-2">
        <ArrowLeft size={16} /> Go Back
      </button>
    </div>
  );

  if (!seller) return null;

  const stats     = seller.sellerStats || {};
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  const isOwnProfile = isAuth && user?._id === id;

  return (
    <div className="page-container max-w-4xl mx-auto">

      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm mb-6 hover:text-[var(--accent-primary)] transition-colors"
        style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* ── Profile Card ─────────────────────────────────────────────────── */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* Avatar with popover */}
          <AvatarPopover seller={seller} />

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-syne font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
              {seller.name}
            </h1>

            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-3">
              {avgRating && (
                <div className="flex items-center gap-1.5">
                  <Star size={16} fill="var(--accent-yellow)" stroke="var(--accent-yellow)" />
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{avgRating}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({reviews.length} reviews)</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <ShoppingBag size={15} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {stats.totalSold || 0} sold
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={15} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Since {formatDate(seller.createdAt)}
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
              <span className="badge badge-green">{products.length} Active Listings</span>
              {stats.rating > 0 && (
                <span className="badge badge-yellow">⭐ {stats.rating?.toFixed(1)} Seller Rating</span>
              )}
            </div>

            {/* Message Seller button */}
            {!isOwnProfile && (
              <button
                onClick={handleChat}
                disabled={chatLoading}
                className="btn-primary flex items-center gap-2 mt-5"
              >
                {chatLoading ? <Spinner size={16} /> : <MessageCircle size={16} />}
                Message Seller
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Listings ─────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <h2 className="section-title mb-4">Listings ({products.length})</h2>
        <ProductGrid
          products={products}
          loading={false}
          emptyMessage="This seller has no active listings right now."
        />
      </div>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <div>
          <h2 className="section-title mb-4">Reviews ({reviews.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--accent-primary)' }}>
                    {getInitials(r.buyerId?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {r.buyerId?.name}
                    </p>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={11}
                          fill={i < r.rating ? 'var(--accent-yellow)' : 'none'}
                          stroke="var(--accent-yellow)" />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(r.createdAt)}
                  </span>
                </div>
                {r.title && (
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                )}
                {r.comment && (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>
                )}
                {r.productId?.title && (
                  <Link to={`/product/${r.productId._id}`}
                    className="text-xs mt-2 block hover:text-[var(--accent-primary)] transition-colors"
                    style={{ color: 'var(--text-muted)' }}>
                    📦 {r.productId.title}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}