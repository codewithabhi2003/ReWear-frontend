/**
 * ReportModal
 * Shown when user clicks "Report" on a product or seller page.
 */
import { useState } from 'react';
import { X, Flag, Send } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Spinner } from '../common/Loader';

const REASONS = [
  'Counterfeit / Fake item',
  'Misleading description',
  'Wrong / missing images',
  'Inappropriate content',
  'Spam or scam',
  'Price gouging',
  'Harassment by seller',
  'Other',
];

export default function ReportModal({ targetType, targetId, targetName, onClose }) {
  const [reason,  setReason]  = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const handleSubmit = async () => {
    if (!reason) { toast.error('Please select a reason'); return; }
    setLoading(true);
    try {
      await api.post('/reports', { targetType, targetId, reason, details });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 20, padding: 28, width: '100%', maxWidth: 440,
          animation: 'fadeIn 200ms ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          // ── Success state ──────────────────────────────────────────────
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
              background: 'color-mix(in srgb, var(--accent-green) 15%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 24 }}>✅</span>
            </div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>
              Report Submitted
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              Thank you. Our admin team will review this within 24 hours. We take all reports seriously.
            </p>
            <button onClick={onClose} className="btn-primary">Close</button>
          </div>
        ) : (
          // ── Report form ────────────────────────────────────────────────
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'color-mix(in srgb, var(--accent-red) 12%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Flag size={17} color="var(--accent-red)" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: 0 }}>
                    Report {targetType === 'seller' ? 'Seller' : 'Listing'}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                    {targetName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Reason */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Reason for report *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    style={{
                      padding: '9px 14px', borderRadius: 10, border: `1px solid ${reason === r ? 'var(--accent-red)' : 'var(--border)'}`,
                      background: reason === r ? 'color-mix(in srgb, var(--accent-red) 8%, transparent)' : 'var(--bg-elevated)',
                      color: reason === r ? 'var(--accent-red)' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: reason === r ? 600 : 400,
                      cursor: 'pointer', textAlign: 'left', transition: 'all 150ms',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Additional details <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Tell us more about the issue…"
                maxLength={500}
                rows={3}
                className="input resize-none"
                style={{ width: '100%' }}
              />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
                {details.length}/500
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={loading || !reason}
                style={{
                  flex: 1, padding: '11px', borderRadius: 12, border: 'none',
                  background: 'var(--accent-red)', color: '#fff',
                  fontWeight: 700, fontSize: 14, cursor: loading || !reason ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: !reason ? 0.5 : 1,
                }}
              >
                {loading ? <Spinner size={16} /> : <Send size={15} />}
                {loading ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </>
        )}

        <style>{`
          @keyframes fadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        `}</style>
      </div>
    </div>
  );
}