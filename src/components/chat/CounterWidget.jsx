/**
 * CounterWidget
 * Shown to the SELLER inside OfferCard when they click "Counter Offer".
 * Lets them drag a slider to set a counter price (between buyer offer and listing price).
 */
import { useState, useRef, useCallback } from 'react';
import { X, ArrowUpDown } from 'lucide-react';

export default function CounterWidget({ buyerOffer, basePrice, onSend, onClose, loading }) {
  // Counter must be: buyerOffer < counter < basePrice
  const minCounter = buyerOffer + 1;
  const maxCounter = basePrice - 1;

  // Default to midpoint between buyer offer and listing price
  const defaultCounter = Math.round((buyerOffer + basePrice) / 2);
  const [counterPrice, setCounterPrice] = useState(
    Math.max(minCounter, Math.min(maxCounter, defaultCounter))
  );

  const sliderRef = useRef(null);
  const dragging  = useRef(false);

  const discount   = basePrice > 0
    ? Math.round(((basePrice - counterPrice) / basePrice) * 100)
    : 0;
  const aboveOffer = counterPrice - buyerOffer;

  // Percentage along slider (0 = minCounter, 100 = maxCounter)
  const range = maxCounter - minCounter;
  const pct   = range > 0
    ? Math.max(0, Math.min(100, ((counterPrice - minCounter) / range) * 100))
    : 50;

  const priceFromPct = useCallback((p) => {
    const clamped = Math.min(100, Math.max(0, p));
    return Math.round(minCounter + (clamped / 100) * (maxCounter - minCounter));
  }, [minCounter, maxCounter]);

  const getPctFromEvent = useCallback((e) => {
    if (!sliderRef.current) return 0;
    const rect    = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return ((clientX - rect.left) / rect.width) * 100;
  }, []);

  const onDown = (e) => { dragging.current = true;  setCounterPrice(priceFromPct(getPctFromEvent(e))); };
  const onMove = (e) => { if (!dragging.current) return; setCounterPrice(priceFromPct(getPctFromEvent(e))); };
  const onUp   = ()  => { dragging.current = false; };

  if (minCounter >= maxCounter) return null;

  return (
    <div style={{
      marginTop: 12,
      background: 'var(--bg-primary)',
      border: '1px solid var(--accent-green)',
      borderRadius: 14,
      padding: '16px',
      animation: 'slideDown 200ms ease',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <ArrowUpDown size={15} color="var(--accent-green)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>
            Your Counter Offer
          </span>
        </div>
        <button onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
          <X size={14} />
        </button>
      </div>

      {/* ── Context row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 8, textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Listed Price</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            ₹{basePrice.toLocaleString('en-IN')}
          </p>
        </div>
        <div style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 8, textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Buyer Offered</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-primary)' }}>
            ₹{buyerOffer.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* ── Counter price display ── */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Your Counter
        </p>
        <p style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent-green)', fontFamily: 'Space Grotesk, monospace', lineHeight: 1 }}>
          ₹{counterPrice.toLocaleString('en-IN')}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 700 }}>
            {discount}% off original
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: 12, color: 'var(--accent-yellow)', fontWeight: 600 }}>
            ₹{aboveOffer.toLocaleString('en-IN')} above buyer
          </span>
        </div>
      </div>

      {/* ── Slider ── */}
      <div style={{ marginBottom: 16, userSelect: 'none', WebkitUserSelect: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Min ₹{(buyerOffer + 1).toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Max ₹{(basePrice - 1).toLocaleString('en-IN')}
          </span>
        </div>

        <div
          ref={sliderRef}
          style={{ position: 'relative', height: 48, cursor: 'pointer', touchAction: 'none' }}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        >
          <div style={{
            position: 'absolute', top: '50%', left: 0, right: 0,
            height: 6, transform: 'translateY(-50%)',
            background: 'var(--bg-elevated)', borderRadius: 3,
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: 0,
            height: 6, transform: 'translateY(-50%)',
            background: 'linear-gradient(90deg, var(--accent-green), #00e6af)',
            borderRadius: 3, width: `${pct}%`,
            transition: dragging.current ? 'none' : 'width 120ms',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: `${pct}%`,
            transform: 'translate(-50%, -50%)',
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--accent-green)',
            border: '3px solid var(--bg-card)',
            boxShadow: '0 0 12px rgba(0,200,150,0.45)',
            transition: dragging.current ? 'none' : 'left 120ms',
            cursor: 'grab',
          }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          → Drag right to increase counter price
        </p>
      </div>

      {/* ── Send button ── */}
      <button
        onClick={() => onSend(counterPrice)}
        disabled={loading}
        style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none',
          background: 'var(--accent-green)', color: '#000',
          fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Sending…' : `Send Counter — ₹${counterPrice.toLocaleString('en-IN')} (${discount}% off)`}
      </button>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        :root {
          --accent-green:  #00C896;
          --accent-yellow: #FFD32A;
        }
      `}</style>
    </div>
  );
}