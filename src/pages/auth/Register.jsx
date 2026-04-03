import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/common/Loader';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [agreed,  setAgreed]    = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (!agreed) {
      toast.error('Please accept the Privacy Policy and Terms to continue');
      return;
    }

    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success('Welcome to ReWear! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: 'var(--accent-red)', w: '25%' };
    if (p.length < 8)  return { label: 'Weak',      color: 'var(--accent-yellow)', w: '50%' };
    if (p.length < 12) return { label: 'Good',       color: 'var(--accent-green)',  w: '75%' };
    return { label: 'Strong', color: 'var(--accent-green)', w: '100%' };
  })();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <span className="text-3xl font-bold font-syne" style={{ color: 'var(--accent-primary)' }}>
              Re<span style={{ color: 'var(--text-primary)' }}>Wear</span>
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold font-syne" style={{ color: 'var(--text-primary)' }}>
            Create your account
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Buy and sell authentic branded fashion
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex justify-center gap-4 mb-6">
          {['Admin Verified', 'Secure Payments', 'Genuine Brands'].map((t) => (
            <span key={t} className="badge badge-green text-[10px]">{t}</span>
          ))}
        </div>

        {/* Card */}
        <div className="card p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Your full name"
                className="input"
                autoComplete="name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                className="input"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 6 characters"
                  className="input pr-11"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Strength bar */}
              {pwStrength && (
                <div className="mt-2">
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: pwStrength.w, background: pwStrength.color }}
                    />
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: pwStrength.color }}>{pwStrength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Repeat your password"
                className="input"
                autoComplete="new-password"
                required
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs mt-1" style={{ color: 'var(--accent-red)' }}>Passwords don't match</p>
              )}
            </div>

            {/* Privacy Policy Checkbox */}
            <div
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 14px', borderRadius: 12,
                background: 'var(--bg-elevated)',
                border: `1px solid ${agreed ? 'var(--accent-primary)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'border-color 200ms',
              }}
              onClick={() => setAgreed(v => !v)}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                border: `2px solid ${agreed ? 'var(--accent-primary)' : 'var(--border)'}`,
                background: agreed ? 'var(--accent-primary)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 200ms',
              }}>
                {agreed && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                I have read and agree to the{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                  Privacy Policy
                </a>
                {' '}and{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                  Terms of Service
                </a>
              </p>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || !agreed} className="btn-primary w-full mt-2" style={{ opacity: !agreed ? 0.6 : 1 }}>
              {loading ? <Spinner size={18} /> : <UserPlus size={18} />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="divider" />
            <span
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs"
              style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}
            >
              Already have an account?
            </span>
          </div>

          <Link to="/auth/login" className="btn-secondary w-full text-center block">
            Sign In Instead
          </Link>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          By registering you agree to our <a href="/privacy-policy" style={{ color: 'var(--accent-primary)' }}>Privacy Policy</a> & Terms.
        </p>
      </div>
    </div>
  );
}