import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, ShoppingBag,
  ArrowLeft, Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard',   path: '/admin' },
  { icon: <Package size={18} />,         label: 'Products',    path: '/admin/products' },
  { icon: <Users size={18} />,           label: 'Users',       path: '/admin/users' },
  { icon: <ShoppingBag size={18} />,     label: 'Orders',      path: '/admin/orders' },
];

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const navigate  = useNavigate();

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-56 flex-shrink-0 border-r sticky top-16 h-[calc(100vh-64px)]"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        {/* Admin badge */}
        <div className="px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} style={{ color: 'var(--accent-primary)' }} />
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--accent-primary)' }}>Admin Panel</span>
          </div>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {user?.email}
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white'
                    : 'hover:bg-[var(--bg-elevated)]'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Back to site */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-full transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={16} /> Back to Site
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Nav ───────────────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t flex"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-medium transition-colors"
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
