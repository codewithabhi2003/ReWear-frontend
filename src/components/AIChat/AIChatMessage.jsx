import { useNavigate } from 'react-router-dom';

// ── Product card — fields match controller .select() ─────────────────────────
// Controller returns: _id, title, brand, sellingPrice, images, category, condition, size
function ProductCard({ product }) {
  const navigate = useNavigate();
  const img      = product.images?.[0] || '';

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      style={{
        display:      'flex',
        gap:          10,
        padding:      10,
        borderRadius: 12,
        border:       '1px solid var(--border)',
        background:   'var(--bg-elevated)',
        cursor:       'pointer',
        transition:   'border-color 150ms, transform 150ms',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
        e.currentTarget.style.transform   = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform   = 'translateY(0)';
      }}
    >
      {img && (
        <img
          src={img}
          alt={product.title}                   
          style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
        />
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{
          fontSize:     12,
          fontWeight:   700,
          color:        'var(--text-primary)',
          fontFamily:   "'Syne', sans-serif",
          whiteSpace:   'nowrap',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          margin:       0,
        }}>
          {product.brand} — {product.title}           {/* ✅ was product.name */}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0' }}>
          {product.category} · {product.condition}
          {product.size ? ` · Size ${product.size}` : ''}
        </p>
        <p style={{
          fontSize:   13,
          fontWeight: 700,
          color:      'var(--accent-primary)',
          fontFamily: "'Space Grotesk', sans-serif",
          margin:     0,
        }}>
          ₹{product.sellingPrice?.toLocaleString('en-IN')}  {/* ✅ was product.price */}
        </p>
      </div>
    </div>
  );
}

// ── Price estimate card — fields from AI JSON response ────────────────────────
function PriceEstimateCard({ data }) {
  return (
    <div style={{
      borderRadius: 14,
      border:       '1px solid var(--border)',
      background:   'var(--bg-elevated)',
      overflow:     'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding:    '10px 14px',
        background: 'linear-gradient(135deg, var(--accent-primary) 0%, #FF9A3C 100%)',
      }}>
        <p style={{
          color:      '#fff',
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize:   13,
          margin:     0,
        }}>
          💰 Price Estimate — {data.item}
        </p>
      </div>

      {/* Details */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Original Price</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
            ₹{data.originalPrice?.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Usage details */}
        {(data.usageDuration || data.usageFrequency || data.damage) && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
            {data.usageDuration && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                ⏱️ Used for: {data.usageDuration}
              </p>
            )}
            {data.usageFrequency && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                🔁 Frequency: {data.usageFrequency}
              </p>
            )}
            {data.damage && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                🔍 Condition: {data.damage}
              </p>
            )}
          </>
        )}

        {/* Breakdown */}
        {data.breakdown && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
            {[
              { icon: '📉', label: data.breakdown.baseDepreciation },
              { icon: '🔍', label: data.breakdown.conditionAdjustment },
              { icon: '🏷️', label: data.breakdown.brandMultiplier },
            ].map(({ icon, label }) => label && (
              <p key={label} style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                {icon} {label}
              </p>
            ))}
          </>
        )}

        {/* Final estimate */}
        <div style={{
          marginTop:      6,
          paddingTop:     10,
          borderTop:      '1px solid var(--border)',
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
            Estimated Resale Price
          </span>
          <span style={{
            fontSize:   18,
            fontWeight: 700,
            color:      'var(--accent-primary)',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            ₹{data.estimatedPrice?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main message renderer ────────────────────────────────────────────────────
export default function AIChatMessage({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth:      '88%',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    isUser ? 'flex-end' : 'flex-start',
        gap:           6,
      }}>

        {/* Text bubble + optional image preview */}
        {(msg.content || msg.imagePreview) && (
          <div style={{
            padding:      '9px 13px',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background:   isUser ? 'var(--accent-primary)' : 'var(--bg-elevated)',
            color:        isUser ? '#fff' : 'var(--text-primary)',
            border:       isUser ? 'none' : '1px solid var(--border)',
            fontSize:     13,
            lineHeight:   1.55,
            fontFamily:   "'DM Sans', sans-serif",
            whiteSpace:   'pre-wrap',
          }}>
            {msg.imagePreview && (
              <img
                src={msg.imagePreview}
                alt="uploaded"
                style={{
                  width:        160,
                  height:       160,
                  objectFit:    'cover',
                  borderRadius: 10,
                  display:      'block',
                  marginBottom: msg.content ? 8 : 0,
                }}
              />
            )}
            {msg.content && <span>{msg.content}</span>}
          </div>
        )}

        {/* Product results */}
        {msg.type === 'products' && msg.products?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
            {msg.products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        {/* No products found — content already shown in bubble above */}

        {/* Price estimate */}
        {msg.type === 'priceEstimate' && msg.data && (
          <PriceEstimateCard data={msg.data} />
        )}
      </div>
    </div>
  );
}