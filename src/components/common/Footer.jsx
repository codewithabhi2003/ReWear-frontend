import { Link } from 'react-router-dom';
import { Instagram, Twitter, Github } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-20 border-t"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/">
              <span className="text-2xl font-bold font-syne" style={{ color: 'var(--accent-primary)' }}>
                Re<span style={{ color: 'var(--text-primary)' }}>Wear</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Authentic second-hand branded fashion. Shop smart. Sell easy. Trust guaranteed.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[Instagram, Twitter, Github].map((Icon, i) => (
                <a
                  key={i} href="#"
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-card)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Shop</h4>
            <ul className="space-y-2.5">
              {[
                ['Browse All',   '/browse'],
                ['Tops',         '/browse?category=Tops'],
                ['Footwear',     '/browse?category=Footwear'],
                ['Accessories',  '/browse?category=Accessories'],
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                    style={{ color: 'var(--text-secondary)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Sell</h4>
            <ul className="space-y-2.5">
              {[
                ['List an Item',     '/seller/list-product'],
                ['My Listings',      '/seller/listings'],
                ['Seller Dashboard', '/seller/dashboard'],
                ['Seller Orders',    '/seller/orders'],
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                    style={{ color: 'var(--text-secondary)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Account</h4>
            <ul className="space-y-2.5">
              {[
                ['My Profile',  '/profile'],
                ['My Orders',   '/orders'],
                ['Wishlist',    '/wishlist'],
                ['Messages',    '/chat'],
                ['Report / Feedback', '/report'],
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                    style={{ color: 'var(--text-secondary)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {year} ReWear. All rights reserved.
          </p>
          <div className="flex items-center flex-wrap justify-center gap-4">
            <Link to="/privacy-policy"
              className="text-xs transition-colors hover:text-[var(--accent-primary)]"
              style={{ color: 'var(--text-muted)' }}>
              Privacy Policy
            </Link>
            <Link to="/privacy-policy"
              className="text-xs transition-colors hover:text-[var(--accent-primary)]"
              style={{ color: 'var(--text-muted)' }}>
              Terms of Service
            </Link>
            <a href="mailto:support@rewear.in"
              className="text-xs transition-colors hover:text-[var(--accent-primary)]"
              style={{ color: 'var(--text-muted)' }}>
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}