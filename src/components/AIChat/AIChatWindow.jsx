import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, ImagePlus, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AIChatMessage from './AIChatMessage';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SUGGESTIONS = [
  'Find me sneakers under ₹1500',
  'How do I negotiate a price?',
  'Estimate price for my old jeans',
  'How does payment work?',
];

// ── Logged-out screen ─────────────────────────────────────────────────────────
function LoggedOutPrompt({ onClose }) {
  const navigate = useNavigate();

  return (
    <div style={{
      flex:           1,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '32px 24px',
      gap:            20,
      textAlign:      'center',
    }}>
      {/* Icon */}
      <div style={{
        width:          64,
        height:         64,
        borderRadius:   '50%',
        background:     'linear-gradient(135deg, var(--accent-primary) 0%, #FF9A3C 100%)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}>
        <Sparkles size={28} color="#fff" />
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{
          fontSize:   18,
          fontWeight: 700,
          fontFamily: "'Syne', sans-serif",
          color:      'var(--text-primary)',
          margin:     0,
        }}>
          Meet ReWear AI ✨
        </p>
        <p style={{
          fontSize:   13,
          color:      'var(--text-secondary)',
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.6,
          margin:     0,
        }}>
          Find products, estimate resale prices, and get help navigating the platform — all in one chat.
        </p>
        <p style={{
          fontSize:   12,
          color:      'var(--text-muted)',
          fontFamily: "'DM Sans', sans-serif",
          margin:     0,
        }}>
          Please log in or sign up to start chatting.
        </p>
      </div>

      {/* Feature pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {['🔍 Find products', '💰 Price estimator', '📦 Order help', '🏷️ Negotiation guide'].map((f) => (
          <span key={f} style={{
            fontSize:     11,
            padding:      '5px 12px',
            borderRadius: 100,
            border:       '1px solid var(--border)',
            background:   'var(--bg-elevated)',
            color:        'var(--text-secondary)',
            fontFamily:   "'DM Sans', sans-serif",
            whiteSpace:   'nowrap',
          }}>
            {f}
          </span>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
        <button
          onClick={() => { onClose(); navigate('/login'); }}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            8,
            padding:        '12px 20px',
            borderRadius:   12,
            border:         'none',
            background:     'var(--accent-primary)',
            color:          '#fff',
            fontSize:       14,
            fontWeight:     600,
            fontFamily:     "'DM Sans', sans-serif",
            cursor:         'pointer',
            transition:     'opacity 150ms, transform 150ms',
            width:          '100%',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <LogIn size={16} />
          Log in to chat
        </button>

        <button
          onClick={() => { onClose(); navigate('/signup'); }}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            8,
            padding:        '12px 20px',
            borderRadius:   12,
            border:         '1px solid var(--border)',
            background:     'var(--bg-elevated)',
            color:          'var(--text-primary)',
            fontSize:       14,
            fontWeight:     600,
            fontFamily:     "'DM Sans', sans-serif",
            cursor:         'pointer',
            transition:     'all 150ms',
            width:          '100%',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.color       = 'var(--accent-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color       = 'var(--text-primary)';
          }}
        >
          <UserPlus size={16} />
          Create an account
        </button>
      </div>
    </div>
  );
}

// ── Main chat window ──────────────────────────────────────────────────────────
export default function AIChatWindow({ onClose }) {
  const { user } = useAuth();
  const userName  = user?.name || user?.username || null;

  const [messages, setMessages] = useState([
    {
      role:    'assistant',
      type:    'text',
      content: userName
        ? `Hi ${userName}! I'm ReWear AI ✨\nI can help you find products, estimate resale prices, or guide you around the platform. What do you need?`
        : "Hi! I'm ReWear AI ✨\nI can help you find products, estimate resale prices, or guide you around the platform. What do you need?",
    },
  ]);
  const [input,        setInput]        = useState('');
  const [image,        setImage]        = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading,      setLoading]      = useState(false);
  const bottomRef = useRef(null);
  const fileRef   = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const getHistory = () =>
    messages
      .filter((m) => m.role && (m.content || m.type === 'products' || m.type === 'priceEstimate'))
      .map((m) => {
        if (m.type === 'products') {
          const names = m.products?.map((p) => `${p.brand} ${p.title} ₹${p.sellingPrice}`).join(', ');
          return {
            role:    m.role,
            content: m.content
              ? `${m.content}${names ? ` Products shown: ${names}` : ''}`
              : `Showed products: ${names || 'none'}`,
          };
        }
        if (m.type === 'priceEstimate') {
          const d = m.data;
          return {
            role:    m.role,
            content: `Estimated resale price for ${d?.item}: ₹${d?.estimatedPrice} (original ₹${d?.originalPrice}, used ${d?.usageDuration}, ${d?.usageFrequency}, condition: ${d?.damage})`,
          };
        }
        return { role: m.role, content: m.content };
      })
      .slice(-20);

  const send = async (text = input) => {
    if (!text.trim() && !image) return;

    const userMsg = {
      role:         'user',
      type:         'text',
      content:      text || '',
      imagePreview: imagePreview || null,
    };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setLoading(true);

    const imageFile = image;
    setImage(null);
    setImagePreview(null);

    try {
      let imageUrl;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const { data: uploadData } = await api.post('/ai/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadData.imageUrl;
      }

      const { data } = await api.post('/ai/chat', {
        message: text,
        imageUrl,
        conversationHistory: getHistory(),
        userName,
      });

      if (data.type === 'products') {
        setMessages((p) => [...p, {
          role:     'assistant',
          type:     'products',
          content:  data.message,
          products: data.products,
        }]);
      } else if (data.type === 'priceEstimate') {
        setMessages((p) => [...p, {
          role:    'assistant',
          type:    'priceEstimate',
          content: '',
          data:    data.data,
        }]);
      } else {
        setMessages((p) => [...p, {
          role:    'assistant',
          type:    'text',
          content: data.message,
        }]);
      }
    } catch (err) {
      const msg     = err?.response?.data?.message || '';
      const isQuota = err?.response?.status === 503 || msg.toLowerCase().includes('limit');
      setMessages((p) => [...p, {
        role:    'assistant',
        type:    'text',
        content: isQuota
          ? "⏳ AI is on a short break — free-tier limit reached. Please try again in a few minutes."
          : "⚠️ Something went wrong. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         9998,
          background:     'var(--overlay)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* ── Window ── */}
      <div style={{
        position:      'fixed',
        bottom:        24,
        right:         24,
        zIndex:        9999,
        width:         420,
        maxWidth:      'calc(100vw - 32px)',
        height:        600,
        maxHeight:     'calc(100vh - 48px)',
        borderRadius:  20,
        overflow:      'hidden',
        display:       'flex',
        flexDirection: 'column',
        background:    'var(--bg-card)',
        border:        '1px solid var(--border)',
        boxShadow:     '0 24px 80px rgba(0,0,0,0.4)',
        animation:     'aiSlideUp 250ms cubic-bezier(0.16,1,0.3,1)',
      }}>
        <style>{`
          @keyframes aiSlideUp {
            from { opacity: 0; transform: translateY(24px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)    scale(1);    }
          }
          @keyframes aiBounce {
            0%,80%,100% { transform: scaleY(1); }
            40%         { transform: scaleY(1.4); }
          }
        `}</style>

        {/* ── Header ── */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        12,
          padding:    '14px 16px',
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, #FF9A3C 100%)',
          flexShrink: 0,
        }}>
          <div style={{
            width:          36,
            height:         36,
            borderRadius:   '50%',
            background:     'rgba(255,255,255,0.2)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, margin: 0 }}>
              ReWear AI
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, margin: 0 }}>
              {user ? 'Product finder · Price estimator · Guide' : 'Log in to start chatting'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width:          32,
              height:         32,
              borderRadius:   '50%',
              border:         'none',
              background:     'rgba(255,255,255,0.15)',
              cursor:         'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              transition:     'background 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <X size={16} color="#fff" />
          </button>
        </div>

        {/* ── Logged out: show login prompt ── */}
        {!user ? (
          <LoggedOutPrompt onClose={onClose} />
        ) : (
          <>
            {/* ── Messages ── */}
            <div style={{
              flex:          1,
              overflowY:     'auto',
              padding:       '14px 14px 8px',
              display:       'flex',
              flexDirection: 'column',
              gap:           10,
            }}>
              {messages.map((msg, i) => (
                <AIChatMessage key={i} msg={msg} />
              ))}

              {loading && (
                <div style={{
                  display:      'flex',
                  gap:          5,
                  alignItems:   'center',
                  padding:      '10px 14px',
                  borderRadius: 16,
                  background:   'var(--bg-elevated)',
                  width:        'fit-content',
                  border:       '1px solid var(--border)',
                }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{
                      width:        6,
                      height:       6,
                      borderRadius: '50%',
                      background:   'var(--accent-primary)',
                      display:      'inline-block',
                      animation:    `aiBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                    }} />
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Quick suggestions — only on first message ── */}
            {messages.length === 1 && (
              <div style={{
                padding:    '0 14px 10px',
                display:    'flex',
                flexWrap:   'wrap',
                gap:        6,
                flexShrink: 0,
              }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      fontSize:     11,
                      padding:      '5px 12px',
                      borderRadius: 100,
                      border:       '1px solid var(--border)',
                      background:   'var(--bg-elevated)',
                      color:        'var(--text-secondary)',
                      cursor:       'pointer',
                      fontFamily:   "'DM Sans', sans-serif",
                      transition:   'all 150ms',
                      whiteSpace:   'nowrap',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.color       = 'var(--accent-primary)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color       = 'var(--text-secondary)';
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* ── Image preview ── */}
            {imagePreview && (
              <div style={{ padding: '0 14px 8px', flexShrink: 0 }}>
                <div style={{ position: 'relative', width: 64, height: 64 }}>
                  <img
                    src={imagePreview}
                    alt="preview"
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
                  />
                  <button
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    style={{
                      position:       'absolute',
                      top:            -6,
                      right:          -6,
                      width:          18,
                      height:         18,
                      borderRadius:   '50%',
                      background:     'var(--accent-red)',
                      border:         'none',
                      cursor:         'pointer',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={10} color="#fff" />
                  </button>
                </div>
              </div>
            )}

            {/* ── Input bar ── */}
            <div style={{
              display:    'flex',
              alignItems: 'flex-end',
              gap:        8,
              padding:    '10px 12px',
              borderTop:  '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              flexShrink: 0,
            }}>
              <button
                onClick={() => fileRef.current?.click()}
                title="Upload image for price estimation"
                style={{
                  padding:      8,
                  borderRadius: 10,
                  border:       'none',
                  background:   'transparent',
                  cursor:       'pointer',
                  color:        'var(--text-muted)',
                  flexShrink:   0,
                  display:      'flex',
                  alignItems:   'center',
                  transition:   'color 150ms',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <ImagePlus size={19} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                placeholder="Ask anything…"
                rows={1}
                style={{
                  flex:         1,
                  resize:       'none',
                  background:   'var(--bg-input)',
                  color:        'var(--text-primary)',
                  border:       '1px solid var(--border)',
                  borderRadius: 12,
                  padding:      '9px 12px',
                  fontSize:     13,
                  fontFamily:   "'DM Sans', sans-serif",
                  outline:      'none',
                  maxHeight:    100,
                  lineHeight:   1.5,
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />

              <button
                onClick={() => send()}
                disabled={loading || (!input.trim() && !image)}
                style={{
                  width:          36,
                  height:         36,
                  borderRadius:   10,
                  border:         'none',
                  background:     'var(--accent-primary)',
                  cursor:         loading || (!input.trim() && !image) ? 'not-allowed' : 'pointer',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                  opacity:        loading || (!input.trim() && !image) ? 0.4 : 1,
                  transition:     'opacity 150ms, transform 150ms',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Send size={16} color="#fff" />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}