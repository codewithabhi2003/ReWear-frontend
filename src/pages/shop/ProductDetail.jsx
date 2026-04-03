import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, MessageCircle, Heart, Eye, ChevronLeft, Star, Package, Flag } from 'lucide-react';
import ReportModal from '../../components/common/ReportModal';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { BrandBadge, ConditionBadge } from '../../components/product/Badges';
import { formatPrice, calcDiscount, formatDate, getInitials } from '../../utils/helpers';
import ProductGrid from '../../components/product/ProductGrid';
import { PageLoader, Spinner } from '../../components/common/Loader';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuth } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const [product, setProduct]       = useState(null);
  const [reviews, setReviews]       = useState([]);
  const [related, setRelated]       = useState([]);
  const [selImage, setSelImage]     = useState(0);
  const [loading, setLoading]       = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [showReport, setShowReport]   = useState(false);
  const [addingCart, setAddingCart]   = useState(false);

  useEffect(() => {
    setLoading(true);
    setSelImage(0);
    Promise.all([
      productService.getById(id),
      reviewService.getByProduct(id),
    ]).then(([pRes, rRes]) => {
      setProduct(pRes.data.data.product);
      setReviews(rRes.data.data.reviews);
      // Fetch related products
      const p = pRes.data.data.product;
      productService.getAll({ category: p.category, limit: 4 })
        .then(({ data }) => setRelated(data.data.products.filter((r) => r._id !== id).slice(0, 4)));
    }).catch(() => {
      toast.error('Product not found');
      navigate('/browse');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuth) { navigate('/auth/login'); return; }
    setAddingCart(true);
    await addToCart(product._id);
    setAddingCart(false);
  };

  const handleBuyNow = async () => {
    if (!isAuth) { navigate('/auth/login'); return; }
    setAddingCart(true);
    await addToCart(product._id);
    setAddingCart(false);
    navigate('/checkout');
  };

  const handleChat = async () => {
    if (!isAuth) { navigate('/auth/login'); return; }
    setChatLoading(true);
    try {
      const { data } = await chatService.start(product._id);
      navigate(`/chat/${data.data.chat._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start chat');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return null;

  const {
    title, brand, category, gender, size, color, condition,
    sellingPrice, originalPrice, description, images,
    sellerId, views, status, createdAt,
  } = product;

  const discount    = calcDiscount(originalPrice, sellingPrice);
  const wishlisted  = isWishlisted(product._id);
  const isSold      = status === 'sold';
  const isOwner     = user?._id === (sellerId?._id || sellerId);
  const avgRating   = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="page-container">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm mb-6 hover:text-[var(--accent-primary)] transition-colors"
        style={{ color: 'var(--text-secondary)' }}>
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* ── Left: Image Gallery ─────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Main image */}
          <div
            className="relative aspect-square rounded-xl overflow-hidden"
            style={{ background: 'var(--bg-elevated)' }}
          >
            {images?.[selImage] ? (
              <img src={images[selImage]} alt={title}
                className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                No Image
              </div>
            )}
            {isSold && (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'var(--overlay)' }}>
                <span className="badge badge-red text-lg px-6 py-2 font-bold">SOLD</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images?.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelImage(i)}
                  className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all"
                  style={{ border: `2px solid ${i === selImage ? 'var(--accent-primary)' : 'var(--border)'}` }}
                >
                  <img src={img} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Details ─────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            <BrandBadge brand={brand} size="lg" />
            <span className="badge badge-muted">{category}</span>
            <span className="badge badge-muted capitalize">{gender}</span>
          </div>

          {/* Title */}
          <h1 className="font-syne font-bold text-2xl md:text-3xl leading-tight"
            style={{ color: 'var(--text-primary)' }}>
            {title}
          </h1>

          {/* Condition + Size */}
          <div className="flex items-center gap-3">
            <ConditionBadge condition={condition} size="lg" />
            <span className="badge badge-muted">Size: {size}</span>
            {color && <span className="badge badge-muted">{color}</span>}
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="price text-3xl">{formatPrice(sellingPrice)}</span>
            {originalPrice > sellingPrice && (
              <>
                <span className="price-original text-lg">{formatPrice(originalPrice)}</span>
                <span className="badge badge-green font-bold">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Seller card */}
          {sellerId && (
            <div className="card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {sellerId.avatar ? (
                  <img src={sellerId.avatar} alt={sellerId.name}
                    className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'var(--accent-primary)' }}>
                    {getInitials(sellerId.name)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{sellerId.name}</p>
                  <div className="flex items-center gap-1">
                    <Star size={12} fill="var(--accent-yellow)" stroke="var(--accent-yellow)" />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {sellerId.sellerStats?.rating?.toFixed(1) || '—'} · {sellerId.sellerStats?.totalSold || 0} sold
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/seller/${sellerId._id}`}
                  className="text-xs" style={{ color: 'var(--accent-primary)' }}>
                  View Profile
                </Link>
                {!isOwner && !isSold && (
                  <button onClick={handleChat} disabled={chatLoading}
                    className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-xs">
                    {chatLoading ? <Spinner size={14} /> : <MessageCircle size={14} />}
                    Chat
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!isOwner && !isSold && (
            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={addingCart}
                className="btn-secondary flex-1 flex items-center justify-center gap-2">
                {addingCart ? <Spinner size={16} /> : <ShoppingCart size={16} />}
                Add to Cart
              </button>
              <button onClick={handleBuyNow} disabled={addingCart}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                Buy Now
              </button>
              <button onClick={() => toggle(product._id)}
                className="btn-ghost px-4"
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
                <Heart size={18}
                  fill={wishlisted ? 'var(--accent-red)' : 'none'}
                  stroke={wishlisted ? 'var(--accent-red)' : 'var(--text-primary)'}
                />
              </button>
            </div>
          )}
          {isSold && (
            <div className="card p-4 text-center">
              <p className="font-semibold" style={{ color: 'var(--accent-red)' }}>This item has been sold</p>
              <Link to="/browse" className="text-sm mt-1 block" style={{ color: 'var(--accent-primary)' }}>
                Browse similar items →
              </Link>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><Eye size={13} /> {views} views</span>
            <span>Listed {formatDate(createdAt)}</span>
            {avgRating && (
              <span className="flex items-center gap-1">
                <Star size={13} fill="var(--accent-yellow)" stroke="none" />
                {avgRating} ({reviews.length} reviews)
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Description</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews ─────────────────────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">Reviews ({reviews.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'var(--accent-primary)' }}>
                    {getInitials(r.buyerId?.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.buyerId?.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={12}
                          fill={i < r.rating ? 'var(--accent-yellow)' : 'none'}
                          stroke="var(--accent-yellow)" />
                      ))}
                    </div>
                  </div>
                </div>
                {r.title && <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{r.title}</p>}
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── More from this seller ────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">More Like This</h2>
          <ProductGrid products={related} loading={false} />
        </section>
      )}
      {/* Report Modal */}
      {showReport && (
        <ReportModal
          targetType="product"
          targetId={product._id}
          targetName={product.title}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}