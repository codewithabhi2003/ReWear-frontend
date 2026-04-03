/**
 * NegotiateWidget
 * Shown to the BUYER in chat. Lets them drag a slider to set their offer price.
 * Slides up above the input bar.
 */
import { useState, useRef, useCallback } from 'react';
import { X, Tag, ChevronLeft } from 'lucide-react';

export default function NegotiateWidget({ product, onSend, onClose }) {
  // Product may be a chat.productId object — handle both field names
  const basePrice   = product?.sellingPrice || product?.price || 0;
  // Allow minimum 30% of listing price
  const minPrice    = Math.ceil(basePrice * 0.30);
  // Start slider at 85% of listing price as a sensible default
  const [offerPrice, setOfferPrice] = useState(Math.round(basePrice * 0.85));

  const sliderRef = useRef(null);
  const dragging  = useRef(false);

  const discount = basePrice > 0
    ? Math.round(((basePrice - offerPrice) / basePrice) * 100)
    : 0;
  const saving = basePrice - offerPrice;

  // Percentage along the slider (0 = basePrice, 100 = minPrice)
  const pct = basePrice !== minPrice
    ? Math.max(0, Math.min(100, ((basePrice - offerPrice) / (basePrice - minPrice)) * 100))
    : 0;

  const priceFromPct = useCallback((p) => {
    const clamped = Math.min(100, Math.max(0, p));
    return Math.round(basePrice - (clamped / 100) * (basePrice - minPrice));
  }, [basePrice, minPrice]);

  const getPctFromEvent = useCallback((e) => {
    if (!sliderRef.current) return 0;
    const rect    = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return ((clientX - rect.left) / rect.width) * 100;
  }, []);

  const onDown  = (e) => { dragging.current = true;  setOfferPrice(priceFromPct(getPctFromEvent(e))); };
  const onMove  = (e) => { if (!dragging.current) return; setOfferPrice(priceFromPct(getPctFromEvent(e))); };
  const onUp    = ()  => { dragging.current = false; };

  // Color shifts from green (small discount) → amber → orange (large discount)
  const discountColor = discount < 20 ? '#00C896' : discount < 40 ? '#FFD32A' : '#FF6B35';

  if (basePrice === 0) return null;

  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 8,
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: 20,
      zIndex: 20,
      boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
      animation: 'slideUp 220ms ease',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag size={16} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>
            Make a Price Offer
          </span>
        </div>
        <button onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
          <X size={16} />
        </button>
      </div>

      {/* ── Product context ── */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18,
        padding: '10px 12px',
        background: 'var(--bg-primary)', borderRadius: 10,
        border: '1px solid var(--border)',
      }}>
        {product?.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.title}
            style={{ width: 40, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
          />
        )}
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>
            {product?.title || 'Item'}
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-primary)' }}>
            Listed at ₹{basePrice.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* ── Your offer display ── */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Your Offer
        </p>
        <p style={{ fontSize: 38, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, monospace', lineHeight: 1 }}>
          ₹{offerPrice.toLocaleString('en-IN')}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 13, color: discountColor, fontWeight: 700 }}>
            {discount}% off
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Saving ₹{saving.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* ── Drag Slider ── */}
      <div style={{ marginBottom: 20, userSelect: 'none', WebkitUserSelect: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            ₹{basePrice.toLocaleString('en-IN')} (full)
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Min ₹{minPrice.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Track */}
        <div
          ref={sliderRef}
          style={{ position: 'relative', height: 48, cursor: 'pointer', touchAction: 'none' }}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
        >
          {/* Background track */}
          <div style={{
            position: 'absolute', top: '50%', left: 0, right: 0,
            height: 6, transform: 'translateY(-50%)',
            background: 'var(--bg-primary)', borderRadius: 3,
          }} />

          {/* Filled portion */}
          <div style={{
            position: 'absolute', top: '50%', left: 0,
            height: 6, transform: 'translateY(-50%)',
            background: `linear-gradient(90deg, var(--accent-primary), ${discountColor})`,
            borderRadius: 3,
            width: `${pct}%`,
            transition: dragging.current ? 'none' : 'width 120ms',
          }} />

          {/* Thumb */}
          <div style={{
            position: 'absolute',
            top: '50%', left: `${pct}%`,
            transform: 'translate(-50%, -50%)',
            width: 30, height: 30, borderRadius: '50%',
            background: discountColor,
            border: '3px solid var(--bg-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 14px ${discountColor}66`,
            transition: dragging.current ? 'none' : 'left 120ms',
            cursor: 'grab',
          }}>
            <ChevronLeft size={13} color="var(--bg-primary)" />
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          ← Drag left to lower your offer
        </p>
      </div>

      {/* ── Quick presets ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[10, 20, 30, 40].map((d) => {
          const p      = Math.round(basePrice * (1 - d / 100));
          const active = discount === d;
          return (
            <button
              key={d}
              onClick={() => setOfferPrice(Math.max(minPrice, p))}
              style={{
                flex: 1, padding: '7px 4px', borderRadius: 8,
                border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border)'}`,
                background: active
                  ? 'color-mix(in srgb, var(--accent-primary) 12%, transparent)'
                  : 'var(--bg-primary)',
                color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {d}% off
            </button>
          );
        })}
      </div>

      {/* ── Send button ── */}
      <button
        onClick={() => onSend(offerPrice)}
        style={{
          width: '100%', padding: '13px', borderRadius: 12, border: 'none',
          background: 'var(--accent-primary)', color: '#fff',
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}
      >
        Send Offer — ₹{offerPrice.toLocaleString('en-IN')} ({discount}% off)
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}