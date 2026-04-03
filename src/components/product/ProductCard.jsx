import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice, calcDiscount } from '../../utils/helpers';
import { BrandBadge, ConditionBadge } from './Badges';

export default function ProductCard({ product }) {
  const { isAuth } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const [toggling, setToggling] = useState(false);

  if (!product) return null;

  const {
    _id, title, brand, condition, size,
    sellingPrice, originalPrice, images, status,
  } = product;

  const wishlisted = isWishlisted(_id);
  const discount   = calcDiscount(originalPrice, sellingPrice);
  const isSold     = status === 'sold';

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuth || toggling) return;
    setToggling(true);
    await toggle(_id);
    setToggling(false);
  };

  return (
    <Link to={`/product/${_id}`} className="block group">
      <div className="card card-hover relative overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[var(--bg-elevated)]">
          {images?.[0] ? (
            <img
              src={images[0]}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
              No Image
            </div>
          )}

          {/* Sold overlay */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'var(--overlay)' }}>
              <span className="badge badge-red text-sm px-4 py-1.5 font-bold">SOLD</span>
            </div>
          )}

          {/* Brand badge — top left */}
          <div className="absolute top-2 left-2">
            <BrandBadge brand={brand} />
          </div>

          {/* Discount badge — bottom left */}
          {discount && !isSold && (
            <div className="absolute bottom-2 left-2">
              <span className="badge badge-green text-[10px] font-bold">{discount}% OFF</span>
            </div>
          )}

          {/* Wishlist heart — top right */}
          {isAuth && !isSold && (
            <button
              onClick={handleWishlist}
              disabled={toggling}
              className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
                         transition-all duration-200 hover:scale-110"
              style={{ background: 'color-mix(in srgb, var(--bg-primary) 70%, transparent)' }}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                size={16}
                fill={wishlisted ? 'var(--accent-red)' : 'none'}
                stroke={wishlisted ? 'var(--accent-red)' : 'var(--text-primary)'}
                className="transition-all duration-200"
              />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            Size: {size}
          </p>
          <h3
            className="text-sm font-medium leading-snug line-clamp-1 mb-1.5"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h3>
          <ConditionBadge condition={condition} />

          {/* Price row */}
          <div className="flex items-center gap-2 mt-2">
            <span className="price text-base">{formatPrice(sellingPrice)}</span>
            {originalPrice > sellingPrice && (
              <span className="price-original text-xs">{formatPrice(originalPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
