import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, ImagePlus } from 'lucide-react';
import AIChatMessage from './AIChatMessage';
import api from '../../services/api';

const SUGGESTIONS = [
  'Find me sneakers under ₹1500',
  'How do I list a product?',
  'Estimate price for my old jeans',
  'How does payment work?',
];

export default function AIChatWindow({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role:    'assistant',
      type:    'text',
      content: "Hi! I'm ReWear AI ✨\nI can help you find products, estimate resale prices, or guide you around the platform. What do you need?",
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
  };

  const getHistory = () =>
    messages
      .filter((m) => m.type === 'text')
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

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

    const imageFile    = image;
    const previewToSend = imagePreview;
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
        message:             text,
        imageUrl,
        conversationHistory: getHistory(),
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
    } catch {
      setMessages((p) => [...p, {
        role:    'assistant',
        type:    'text',
        content: 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:   'fixed',
          inset:      0,
          zIndex:     9998,
          background: 'var(--overlay)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Window */}
      <div style={{
        position:     'fixed',
        bottom:       24,
        right:        24,
        zIndex:       9999,
        width:        420,
        maxWidth:     'calc(100vw - 32px)',
        height:       600,
        maxHeight:    'calc(100vh - 48px)',
        borderRadius: 20,
        overflow:     'hidden',
        display:      'flex',
        flexDirection:'column',
        background:   'var(--bg-card)',
        border:       '1px solid var(--border)',
        boxShadow:    '0 24px 80px rgba(0,0,0,0.4)',
        animation:    'aiSlideUp 250ms cubic-bezier(0.16,1,0.3,1)',
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
          display:        'flex',
          alignItems:     'center',
          gap:            12,
          padding:        '14px 16px',
          background:     'linear-gradient(135deg, var(--accent-primary) 0%, #FF9A3C 100%)',
          flexShrink:     0,
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
              Product finder · Price estimator · Guide
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

        {/* ── Messages ── */}
        <div style={{
          flex:       1,
          overflowY:  'auto',
          padding:    '14px 14px 8px',
          display:    'flex',
          flexDirection: 'column',
          gap:        10,
        }}>
          {messages.map((msg, i) => (
            <AIChatMessage key={i} msg={msg} />
          ))}

          {/* Typing indicator */}
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
                  width:      6,
                  height:     6,
                  borderRadius: '50%',
                  background:  'var(--accent-primary)',
                  display:     'inline-block',
                  animation:   `aiBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Suggestions ── */}
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
          display:      'flex',
          alignItems:   'flex-end',
          gap:          8,
          padding:      '10px 12px',
          borderTop:    '1px solid var(--border)',
          background:   'var(--bg-secondary)',
          flexShrink:   0,
        }}>
          <button
            onClick={() => fileRef.current?.click()}
            title="Upload image"
            style={{
              padding:        8,
              borderRadius:   10,
              border:         'none',
              background:     'transparent',
              cursor:         'pointer',
              color:          'var(--text-muted)',
              flexShrink:     0,
              display:        'flex',
              alignItems:     'center',
              transition:     'color 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ImagePlus size={19} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Ask anything…"
            rows={1}
            style={{
              flex:        1,
              resize:      'none',
              background:  'var(--bg-input)',
              color:       'var(--text-primary)',
              border:      '1px solid var(--border)',
              borderRadius: 12,
              padding:     '9px 12px',
              fontSize:    13,
              fontFamily:  "'DM Sans', sans-serif",
              outline:     'none',
              maxHeight:   100,
              lineHeight:  1.5,
            }}
            onFocus={e  => e.target.style.borderColor = 'var(--accent-primary)'}
            onBlur={e   => e.target.style.borderColor = 'var(--border)'}
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
              cursor:         'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              flexShrink:     0,
              opacity:        loading || (!input.trim() && !image) ? 0.4 : 1,
              transition:     'opacity 150ms, transform 150ms',
            }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Send size={16} color="#fff" />
          </button>
        </div>
      </div>
    </>
  );
}