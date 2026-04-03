/**
 * OfferCard
 * Renders negotiation message bubbles in chat.
 * Handles: offer | counter_offer | offer_accepted | offer_declined
 */
import { useState } from 'react';
import { Check, X, ArrowUpDown, CreditCard, Tag, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CounterWidget from './CounterWidget';

export default function OfferCard({
  msg,            // full message object from DB
  chatId,         // string
  currentUserId,  // logged-in user's _id
  isSeller,       // boolean — is current user the seller?
  product,        // product object from chat
  onNewMessage,   // callback(msg) — add new message to chat
  onPay,          // callback(agreedPrice) — trigger Razorpay
}) {
  const [loading,      setLoading]      = useState(false);
  const [showCounter,  setShowCounter]  = useState(false);

  const { type, offer, _id: msgId, senderId } = msg;

  // Is this message from the currently logged-in user?
  const senderId_str = senderId?._id?.toString() || senderId?.toString();
  const isMyMessage  = senderId_str === currentUserId?.toString();

  // Call the appropriate respond endpoint
  const respond = async (action, counterPrice) => {
    setLoading(true);
    try {
      // Seller responds to buyer's offer → /respond
      // Buyer responds to seller's counter → /buyer-respond
      const endpoint = isSeller
        ? `/chat/${chatId}/offer/${msgId}/respond`
        : `/chat/${chatId}/offer/${msgId}/buyer-respond`;

      const body = { action };
      if (action === 'counter' && counterPrice !== undefined) {
        body.counterPrice = counterPrice;
      }

      const { data } = await api.post(endpoint, body);
      onNewMessage(data.data.message);
      setShowCounter(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not respond — please try again');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared card wrapper style ─────────────────────────────────────────────
  const cardStyle = (accentColor) => ({
    maxWidth:   290,
    borderRadius: 16,
    overflow:   'hidden',
    border:     `1px solid ${accentColor}33`,
    background: `linear-gradient(150deg, ${accentColor}0d, var(--bg-elevated))`,
    marginLeft: isMyMessage ? 'auto' : 0,
  });

  // ── OFFER or COUNTER_OFFER ────────────────────────────────────────────────
  if (type === 'offer' || type === 'counter_offer') {
    const isCounter   = type === 'counter_offer';
    const accent      = isCounter ? '#00C896' : 'var(--accent-primary)';
    const accentHex   = isCounter ? '#00C896' : '#FF6B35';
    const isPending   = offer?.status === 'pending';
    const roundLabel  = offer?.round > 1 ? ` · Round ${offer.round}` : '';

    // Who can respond to what:
    // - Seller can respond to buyer's 'offer' (type = 'offer')
    // - Buyer can respond to seller's 'counter_offer' (type = 'counter_offer')
    const canRespond = isPending && (isCounter ? !isSeller : isSeller);

    const statusLabel = {
      pending:  null,
      accepted: '✅ Accepted',
      declined: '❌ Declined',
      countered:'↕️ Countered',
    }[offer?.status];

    return (
      <div style={{ position: 'relative', width: 'max-content', maxWidth: 290, marginLeft: isMyMessage ? 'auto' : 0 }}>
        <div style={cardStyle(accentHex)}>

          {/* Header */}
          <div style={{
            padding: '9px 14px',
            borderBottom: `1px solid ${accentHex}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isCounter
                ? <ArrowUpDown size={13} color={accent} />
                : <Tag size={13} color={accent} />
              }
              <span style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isCounter ? `Counter Offer${roundLabel}` : `Price Offer${roundLabel}`}
              </span>
            </div>
            {statusLabel && (
              <span style={{ fontSize: 10, fontWeight: 700, color: accent }}>
                {statusLabel}
              </span>
            )}
            {isPending && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-muted)' }}>
                <Clock size={10} /> Pending
              </span>
            )}
          </div>

          {/* Price */}
          <div style={{ padding: '14px', textAlign: 'center' }}>
            <p style={{
              fontSize: 30, fontWeight: 900, lineHeight: 1,
              color: 'var(--text-primary)',
              fontFamily: 'Space Grotesk, monospace',
            }}>
              ₹{offer?.price?.toLocaleString('en-IN')}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 7 }}>
              <span style={{ fontSize: 12, color: accentHex, fontWeight: 700 }}>
                {offer?.discount}% off
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                was ₹{offer?.basePrice?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action buttons — seller responding to buyer offer */}
          {canRespond && !isCounter && (
            <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => respond('accept')}
                  disabled={loading}
                  style={{
                    flex: 1, padding: '9px 6px', borderRadius: 10, border: 'none',
                    background: '#00C896', color: '#000',
                    fontWeight: 700, fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <Check size={13} /> Accept
                </button>
                <button
                  onClick={() => respond('decline')}
                  disabled={loading}
                  style={{
                    flex: 1, padding: '9px 6px', borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'transparent', color: '#ff4444',
                    fontWeight: 700, fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <X size={13} /> Decline
                </button>
              </div>

              {/* Counter only available in round 1 */}
              {offer?.round < 2 && (
                <button
                  onClick={() => setShowCounter((v) => !v)}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '9px', borderRadius: 10,
                    border: '1px solid #00C896',
                    background: showCounter
                      ? 'rgba(0,200,150,0.1)'
                      : 'transparent',
                    color: '#00C896',
                    fontWeight: 700, fontSize: 12,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  <ArrowUpDown size={13} />
                  {showCounter ? 'Cancel Counter' : 'Counter Offer'}
                </button>
              )}
            </div>
          )}

          {/* Action buttons — buyer responding to seller's counter */}
          {canRespond && isCounter && (
            <div style={{ padding: '0 14px 14px', display: 'flex', gap: 8 }}>
              <button
                onClick={() => respond('accept')}
                disabled={loading}
                style={{
                  flex: 1, padding: '9px 6px', borderRadius: 10, border: 'none',
                  background: '#00C896', color: '#000',
                  fontWeight: 700, fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Check size={13} /> Accept
              </button>
              <button
                onClick={() => respond('decline')}
                disabled={loading}
                style={{
                  flex: 1, padding: '9px 6px', borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'transparent', color: '#ff4444',
                  fontWeight: 700, fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <X size={13} /> Decline
              </button>
            </div>
          )}
        </div>

        {/* Counter widget slides in below */}
        {showCounter && offer && (
          <CounterWidget
            buyerOffer={offer.price}
            basePrice={offer.basePrice}
            onSend={(cp) => respond('counter', cp)}
            onClose={() => setShowCounter(false)}
            loading={loading}
          />
        )}
      </div>
    );
  }

  // ── OFFER ACCEPTED ────────────────────────────────────────────────────────
  if (type === 'offer_accepted') {
    return (
      <div style={{
        maxWidth: 290,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(0,200,150,0.35)',
        background: 'linear-gradient(150deg, rgba(0,200,150,0.08), var(--bg-elevated))',
        marginLeft: isMyMessage ? 'auto' : 0,
      }}>

        {/* Header */}
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid rgba(0,200,150,0.15)',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <Check size={14} color="#00C896" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#00C896' }}>
            Deal Agreed! 🎉
          </span>
        </div>

        {/* Final price */}
        <div style={{ padding: '14px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Final Agreed Price</p>
          <p style={{
            fontSize: 32, fontWeight: 900, color: '#00C896',
            fontFamily: 'Space Grotesk, monospace', lineHeight: 1,
          }}>
            ₹{offer?.price?.toLocaleString('en-IN')}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            You saved ₹{(offer?.basePrice - offer?.price)?.toLocaleString('en-IN')} ({offer?.discount}% off)
          </p>
        </div>

        {/* Pay Now button — only for buyer */}
        {!isSeller && (
          <div style={{ padding: '0 16px 16px' }}>
            <button
              onClick={() => onPay(offer.price)}
              style={{
                width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                background: 'var(--accent-primary)', color: '#fff',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <CreditCard size={16} />
              Pay ₹{offer?.price?.toLocaleString('en-IN')}
            </button>
          </div>
        )}

        {/* Seller sees waiting message */}
        {isSeller && (
          <div style={{ padding: '0 16px 14px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              ⏳ Waiting for buyer to complete payment
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── OFFER DECLINED ────────────────────────────────────────────────────────
  if (type === 'offer_declined') {
    return (
      <div style={{
        maxWidth: 270,
        borderRadius: 14,
        padding: '12px 16px',
        border: '1px solid rgba(255,68,68,0.25)',
        background: 'rgba(255,68,68,0.05)',
        marginLeft: isMyMessage ? 'auto' : 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <X size={13} color="#ff4444" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#ff4444' }}>
            Offer Declined
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Item still available at ₹{offer?.basePrice?.toLocaleString('en-IN')}
        </p>
      </div>
    );
  }

  return null;
}