import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flag, MessageSquare, ChevronLeft, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Loader';

const REPORT_REASONS = [
  'Counterfeit / Fake item',
  'Misleading description',
  'Wrong / missing images',
  'Inappropriate content',
  'Spam or scam',
  'Price gouging',
  'Harassment by seller',
  'Other',
];

const FEEDBACK_TYPES = [
  { value: 'suggestion', label: '💡 Feature suggestion' },
  { value: 'bug',        label: '🐛 Bug report' },
  { value: 'compliment', label: '❤️  Compliment' },
  { value: 'other',      label: '💬 General feedback' },
];

export default function ReportFeedback() {
  const { isAuth } = useAuth();
  const navigate   = useNavigate();

  const [tab,     setTab]     = useState('report');
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);

  // Report fields
  const [targetType, setTargetType] = useState('product');
  const [targetUrl,  setTargetUrl]  = useState('');
  const [reason,     setReason]     = useState('');
  const [details,    setDetails]    = useState('');

  // Feedback fields
  const [fbType,    setFbType]    = useState('suggestion');
  const [fbMessage, setFbMessage] = useState('');

  const handleReport = async () => {
    if (!reason) { toast.error('Please select a reason'); return; }
    setLoading(true);
    try {
      const targetId = targetUrl.split('/').pop() || 'general';
      await api.post('/reports', { targetType, targetId, reason, details: details.slice(0, 500) });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally { setLoading(false); }
  };

  const handleFeedback = async () => {
    if (!fbMessage.trim()) { toast.error('Please write your feedback'); return; }
    setLoading(true);
    try {
      await api.post('/reports', {
        targetType: 'feedback',
        reason: fbType,
        details: fbMessage.slice(0, 500),
      });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!isAuth) {
    return (
      <div className="page-container max-w-md mx-auto text-center py-24">
        <Flag size={48} className="mx-auto mb-5 opacity-25" style={{ color: 'var(--text-muted)' }} />
        <h1 className="font-syne font-bold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
          Sign in to continue
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          You need to be logged in to submit a report or feedback.
        </p>
        <Link to="/auth/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="page-container max-w-md mx-auto text-center py-24">
        <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, #00C896 15%, transparent)' }}>
          <CheckCircle size={40} color="#00C896" />
        </div>
        <h1 className="font-syne font-bold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
          {tab === 'report' ? 'Report Submitted' : 'Feedback Sent!'}
        </h1>
        <p className="text-sm mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {tab === 'report'
            ? 'Thank you for keeping ReWear safe. Our admin team reviews all reports within 24 hours.'
            : 'Thank you! We read every submission and use it to improve ReWear.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setDone(false); setReason(''); setDetails(''); setFbMessage(''); }}
            className="btn-ghost"
          >
            Submit another
          </button>
          <Link to="/" className="btn-primary">Go home</Link>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="page-container max-w-xl mx-auto">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-8 hover:opacity-70 transition-opacity"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
      >
        <ChevronLeft size={16} /> Back
      </button>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="font-syne font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
          Report &amp; Feedback
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Spotted a problem? Have a suggestion? We're listening.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-3 mb-10">
        <button
          onClick={() => setTab('report')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: tab === 'report' ? 'var(--accent-primary)' : 'var(--bg-elevated)',
            color:      tab === 'report' ? '#fff' : 'var(--text-secondary)',
            border:     `1px solid ${tab === 'report' ? 'var(--accent-primary)' : 'var(--border)'}`,
            cursor: 'pointer',
          }}
        >
          <Flag size={15} /> Report a Problem
        </button>
        <button
          onClick={() => setTab('feedback')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: tab === 'feedback' ? 'var(--accent-primary)' : 'var(--bg-elevated)',
            color:      tab === 'feedback' ? '#fff' : 'var(--text-secondary)',
            border:     `1px solid ${tab === 'feedback' ? 'var(--accent-primary)' : 'var(--border)'}`,
            cursor: 'pointer',
          }}
        >
          <MessageSquare size={15} /> Send Feedback
        </button>
      </div>

      {/* ── REPORT FORM ─────────────────────────────────────────────────── */}
      {tab === 'report' && (
        <div className="space-y-8">

          {/* What to report */}
          <div>
            <p className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              What are you reporting?
            </p>
            <div className="flex gap-3">
              {[
                { value: 'product', label: '📦 A Listing' },
                { value: 'seller',  label: '👤 A Seller'  },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTargetType(value)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    border:     `1px solid ${targetType === value ? 'var(--accent-primary)' : 'var(--border)'}`,
                    background: targetType === value
                      ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)'
                      : 'var(--bg-elevated)',
                    color:  targetType === value ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
              Link to the {targetType}{' '}
              <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <input
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              placeholder={`Paste the ${targetType} page URL`}
              className="input"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Reason <span style={{ color: 'var(--accent-primary)' }}>*</span>
            </label>
            <div className="space-y-2.5">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all"
                  style={{
                    border:     `1px solid ${reason === r ? 'var(--accent-primary)' : 'var(--border)'}`,
                    background: reason === r
                      ? 'color-mix(in srgb, var(--accent-primary) 8%, transparent)'
                      : 'var(--bg-elevated)',
                  }}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    style={{ accentColor: 'var(--accent-primary)', width: 16, height: 16 }}
                  />
                  <span className="text-sm" style={{ color: reason === r ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: reason === r ? 600 : 400 }}>
                    {r}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
              Additional details{' '}
              <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Describe the issue…"
              maxLength={500}
              rows={4}
              className="input resize-none"
              style={{ width: '100%' }}
            />
            <p className="text-right text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              {details.length} / 500
            </p>
          </div>

          <button
            onClick={handleReport}
            disabled={loading || !reason}
            className="btn-primary w-full"
            style={{ opacity: !reason ? 0.5 : 1 }}
          >
            {loading ? <Spinner size={18} /> : <Send size={16} />}
            {loading ? 'Submitting…' : 'Submit Report'}
          </button>
        </div>
      )}

      {/* ── FEEDBACK FORM ────────────────────────────────────────────────── */}
      {tab === 'feedback' && (
        <div className="space-y-8">

          {/* Type */}
          <div>
            <label className="block font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Feedback type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FEEDBACK_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFbType(value)}
                  className="py-4 px-4 rounded-xl text-sm font-medium text-left transition-all"
                  style={{
                    border:     `1px solid ${fbType === value ? 'var(--accent-primary)' : 'var(--border)'}`,
                    background: fbType === value
                      ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)'
                      : 'var(--bg-elevated)',
                    color:  fbType === value ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: fbType === value ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
              Your message <span style={{ color: 'var(--accent-primary)' }}>*</span>
            </label>
            <textarea
              value={fbMessage}
              onChange={e => setFbMessage(e.target.value)}
              placeholder={
                fbType === 'suggestion' ? 'Describe the feature you\'d like to see...'
                : fbType === 'bug'      ? 'Describe the bug and how to reproduce it...'
                : fbType === 'compliment' ? 'Tell us what you love about ReWear...'
                : 'Write your feedback here...'
              }
              maxLength={500}
              rows={6}
              className="input resize-none"
              style={{ width: '100%' }}
            />
            <p className="text-right text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              {fbMessage.length} / 500
            </p>
          </div>

          <button
            onClick={handleFeedback}
            disabled={loading || !fbMessage.trim()}
            className="btn-primary w-full"
            style={{ opacity: !fbMessage.trim() ? 0.5 : 1 }}
          >
            {loading ? <Spinner size={18} /> : <Send size={16} />}
            {loading ? 'Sending…' : 'Send Feedback'}
          </button>
        </div>
      )}

    </div>
  );
}