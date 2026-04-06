import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import AIChatWindow from './AIChatWindow';

export default function AIChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open ReWear AI Assistant"
          style={{
            position:     'fixed',
            bottom:       24,
            right:        24,
            zIndex:       9998,
            display:      'flex',
            alignItems:   'center',
            gap:          10,
            padding:      '12px 20px',
            borderRadius: 100,
            border:       'none',
            cursor:       'pointer',
            background:   'linear-gradient(135deg, var(--accent-primary) 0%, #FF9A3C 100%)',
            color:        '#fff',
            fontFamily:   "'Syne', sans-serif",
            fontWeight:   700,
            fontSize:     14,
            boxShadow:    '0 8px 32px rgba(255, 107, 53, 0.45)',
            transition:   'transform 200ms ease, box-shadow 200ms ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 107, 53, 0.55)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 107, 53, 0.45)';
          }}
        >
          <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{
              position:     'absolute',
              width:        28,
              height:       28,
              borderRadius: '50%',
              background:   'rgba(255,255,255,0.25)',
              animation:    'aiPulseRing 2s ease-out infinite',
            }} />
            <Sparkles size={18} />
          </span>

          <span style={{ letterSpacing: '0.02em' }}>Ask AI</span>

          <span style={{
            width:        8,
            height:       8,
            borderRadius: '50%',
            background:   '#00C896',
            boxShadow:    '0 0 6px #00C896',
            animation:    'aiGreenPulse 2s ease-in-out infinite',
            flexShrink:   0,
          }} />

          <style>{`
            @keyframes aiPulseRing {
              0%   { transform: scale(0.8); opacity: 0.8; }
              70%  { transform: scale(2.2); opacity: 0; }
              100% { transform: scale(2.2); opacity: 0; }
            }
            @keyframes aiGreenPulse {
              0%, 100% { opacity: 1; }
              50%       { opacity: 0.4; }
            }
          `}</style>
        </button>
      )}

      {open && <AIChatWindow onClose={() => setOpen(false)} />}
    </>
  );
}