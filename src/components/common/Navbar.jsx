import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, MessageCircle, User, LogOut,
  Menu, X, Package, Heart, LayoutDashboard, Shield,
  ChevronDown, Flag, Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useChat } from '../../context/ChatContext';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { user, isAuth, isAdmin, logout } = useAuth();
  const { cartCount, fetchCart } = useCart();
  const { unreadMessages } = useChat();
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending products count for admin badge
  useEffect(() => {
    if (!isAdmin) return;
    import('../../services/api').then(({ default: api }) => {
      api.get('/admin/products/pending?limit=1')
        .then(({ data }) => setPendingCount(data.data?.pagination?.total || 0))
        .catch(() => {});
    });
  }, [isAdmin]);
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled]        = useState(false);

  // Fetch cart once authenticated
  useEffect(() => { if (isAuth) fetchCart(); }, [isAuth]);

  // Track scroll for blur effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-[var(--accent-primary)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    }`;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        background: scrolled
          ? 'color-mix(in srgb, var(--bg-primary) 90%, transparent)'
          : 'var(--bg-primary)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ──────────────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span
              className="text-xl font-bold font-syne tracking-tight"
              style={{ color: 'var(--accent-primary)' }}
            >
              Re<span style={{ color: 'var(--text-primary)' }}>Wear</span>
            </span>
          </Link>

          {/* ── Desktop Center: Search + Nav links ───────────────────────────── */}
          <div className="hidden md:flex items-center gap-6 flex-1 mx-8">
            <SearchBar compact />
            <NavLink to="/browse" className={navLinkClass}>Browse</NavLink>
            {isAuth && (
              <>
                <NavLink to="/seller/dashboard" className={navLinkClass}>Sell</NavLink>
                <NavLink to="/seller/list-product" className={navLinkClass}>List Item</NavLink>
              </>
            )}
          </div>

          {/* ── Desktop Right: Icons + User ──────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            <ThemeToggle />

            {isAuth ? (
              <>
                {/* Admin shortcut — only for admins */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)', color: 'var(--accent-primary)', border: '1px solid color-mix(in srgb, var(--accent-primary) 25%, transparent)', position: 'relative' }}
                  >
                    <Shield size={14} />
                    Admin
                    {pendingCount > 0 && (
                      <span style={{
                        background: '#FF6B35', color: '#fff',
                        fontSize: 9, fontWeight: 900,
                        borderRadius: 20, padding: '1px 5px', minWidth: 16,
                        lineHeight: 1.4,
                      }}>
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Report / Feedback — always visible when logged in */}
                <Link
                  to="/report"
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ color: 'var(--text-muted)' }}
                  title="Report an issue or give feedback"
                >
                  <Flag size={20} />
                </Link>

                {/* Chat */}
                <Link
                  to="/chat"
                  className="relative p-2 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <MessageCircle size={22} />
                  {unreadMessages > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                                 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                      style={{ background: 'var(--accent-primary)' }}
                    >
                      {unreadMessages > 99 ? '99+' : unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative p-2 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                                 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                      style={{ background: 'var(--accent-primary)' }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <NotificationBell />

                {/* User dropdown */}
                <div className="relative ml-1">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors hover:bg-[var(--bg-elevated)]"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: 'var(--accent-primary)' }}
                      >
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium max-w-[100px] truncate" style={{ color: 'var(--text-primary)' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>

                  {userMenuOpen && (
                    <UserDropdown
                      user={user}
                      isAdmin={isAdmin}
                      onClose={() => setUserMenuOpen(false)}
                      onLogout={handleLogout}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/auth/login" className="btn-ghost text-sm px-4 py-2">Login</Link>
                <Link to="/auth/register" className="btn-primary text-sm px-4 py-2">Sign Up</Link>
              </div>
            )}
          </div>

          {/* ── Mobile Right ─────────────────────────────────────────────────── */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            {isAuth && (
              <>
                <Link to="/cart" className="relative p-2" style={{ color: 'var(--text-secondary)' }}>
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span
                      className="absolute top-0 right-0 min-w-[16px] h-[16px] px-1 rounded-full
                                 text-[9px] font-bold text-white flex items-center justify-center"
                      style={{ background: 'var(--accent-primary)' }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>
                <NotificationBell />
              </>
            )}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <MobileMenu
          user={user}
          isAuth={isAuth}
          isAdmin={isAdmin}
          unreadMessages={unreadMessages}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </nav>
  );
}

// ─── User Dropdown ─────────────────────────────────────────────────────────────
function UserDropdown({ user, isAdmin, onClose, onLogout }) {
  const navigate = useNavigate();
  const go = (path) => { navigate(path); onClose(); };

  return (
    <div
      className="absolute right-0 mt-2 w-52 rounded-xl shadow-card-hover z-50 overflow-hidden animate-slide-up"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      {/* User info */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
      </div>

      {/* Links */}
      {[
        { icon: <User size={15} />,          label: 'My Profile',       path: '/profile' },
        { icon: <Package size={15} />,        label: 'My Orders',        path: '/orders' },
        { icon: <Heart size={15} />,          label: 'Wishlist',         path: '/wishlist' },
        { icon: <LayoutDashboard size={15} />,label: 'Seller Dashboard', path: '/seller/dashboard' },
        ...(isAdmin ? [{ icon: <Shield size={15} />, label: 'Admin Panel', path: '/admin' }] : []),
      ].map((item) => (
        <button
          key={item.path}
          onClick={() => go(item.path)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[var(--bg-card)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}

      <div className="border-t" style={{ borderColor: 'var(--border)' }} />
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[var(--bg-card)]"
        style={{ color: 'var(--accent-red)' }}
      >
        <LogOut size={15} />
        Logout
      </button>
    </div>
  );
}

// ─── Mobile Menu ───────────────────────────────────────────────────────────────
function MobileMenu({ user, isAuth, isAdmin, unreadMessages, onClose, onLogout }) {
  const navigate = useNavigate();
  const go = (path) => { navigate(path); onClose(); };

  return (
    <div
      className="md:hidden border-t animate-slide-up"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <div className="px-4 py-3">
        <SearchBar className="w-full" />
      </div>

      <div className="px-4 pb-4 space-y-1">
        {[
          { label: 'Browse',         path: '/browse' },
          ...(isAuth ? [
            { label: 'Sell / Dashboard', path: '/seller/dashboard' },
            { label: 'List New Item',    path: '/seller/list-product' },
            { label: 'My Orders',        path: '/orders' },
            { label: 'Wishlist',         path: '/wishlist' },
            { label: `Messages${unreadMessages > 0 ? ` (${unreadMessages})` : ''}`, path: '/chat' },
            { label: 'My Profile',       path: '/profile' },
            ...(isAdmin ? [{ label: '⚡ Admin Panel', path: '/admin' }] : []),
          ] : []),
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => go(item.path)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-card)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            {item.label}
          </button>
        ))}

        {isAuth ? (
          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium mt-2"
            style={{ color: 'var(--accent-red)' }}
          >
            Logout
          </button>
        ) : (
          <div className="flex gap-2 pt-2">
            <button onClick={() => go('/auth/login')}    className="btn-ghost flex-1 text-sm">Login</button>
            <button onClick={() => go('/auth/register')} className="btn-primary flex-1 text-sm">Sign Up</button>
          </div>
        )}
      </div>
    </div>
  );
}