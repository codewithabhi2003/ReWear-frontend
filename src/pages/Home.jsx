import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { productService } from '../services/productService';
import ProductGrid from '../components/product/ProductGrid';

const BRANDS = ['Nike', 'Adidas', 'Zara', 'H&M', "Levi's", 'Mango', 'Puma', 'Uniqlo', 'New Balance', 'Tommy Hilfiger', 'Calvin Klein', 'Reebok', 'Stüssy', 'Carhartt'];

const CATEGORIES = [
  { name: 'Fits',        sub: 'Tops & Tees',     icon: '🔥', q: 'Tops',        color: '#FF6B35' },
  { name: 'Bottoms',     sub: 'Jeans & Pants',   icon: '⚡', q: 'Bottoms',     color: '#7C3AED' },
  { name: 'Drip',        sub: 'Dresses & Sets',  icon: '✨', q: 'Dresses',     color: '#EC4899' },
  { name: 'Layers',      sub: 'Jackets & More',  icon: '🧊', q: 'Outerwear',   color: '#06B6D4' },
  { name: 'Kicks',       sub: 'Sneakers & More', icon: '👟', q: 'Footwear',    color: '#10B981' },
  { name: 'Accessories', sub: 'Bags & Extras',   icon: '💎', q: 'Accessories', color: '#F59E0B' },
  { name: 'Ethnic',      sub: 'Kurtas & More',   icon: '🪬', q: 'Ethnic',      color: '#EF4444' },
  { name: 'Activewear',  sub: 'Gym & Sport',     icon: '⚡', q: 'Activewear',  color: '#00C896' },
];

const MARQUEE_ITEMS = ['Verified Brands', 'No Cap', 'Real Deals', 'Cop Before Its Gone', 'Sustainable Flex', 'Thrift Core', 'Drip Different', 'Auth Checked'];

const HOW_IT_WORKS = [
  { num: '01', icon: '📸', title: 'Snap & List',  sub: 'Takes 2 mins',       desc: "Click a few photos, set your price, drop it on ReWear. That's it." },
  { num: '02', icon: '🛡️', title: 'We Verify It', sub: 'Auth guaranteed',    desc: 'Our team checks every listing. Fakes never make it through. Ever.' },
  { num: '03', icon: '💸', title: 'Get Paid',      sub: 'Via Razorpay',       desc: 'Buyer pays, you ship, money lands. Clean, secure, no drama.' },
];

export default function Home() {
  const [featured, setFeatured]       = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingF, setLoadingF]       = useState(true);
  const [loadingN, setLoadingN]       = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    productService.getAll({ isFeatured: true, limit: 8 })
      .then(({ data }) => setFeatured(data.data.products))
      .catch(() => {}).finally(() => setLoadingF(false));

    productService.getAll({ sort: 'newest', limit: 8 })
      .then(({ data }) => setNewArrivals(data.data.products))
      .catch(() => {}).finally(() => setLoadingN(false));
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100vh] flex flex-col justify-center overflow-hidden px-4 sm:px-8 lg:px-16">

        {/* ── Animated floating dots ── */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {[
            { cx:8,  cy:12, r:3, color:'var(--accent-primary)', dur:8,  delay:0   },
            { cx:18, cy:70, r:5, color:'var(--accent-yellow)',  dur:12, delay:1   },
            { cx:6,  cy:88, r:2, color:'var(--accent-green)',   dur:10, delay:2   },
            { cx:92, cy:5,  r:3, color:'var(--text-muted)',     dur:9,  delay:0.5 },
            { cx:85, cy:30, r:5, color:'var(--accent-primary)', dur:14, delay:3   },
            { cx:95, cy:75, r:2, color:'var(--accent-yellow)',  dur:7,  delay:1.5 },
            { cx:50, cy:8,  r:3, color:'var(--accent-green)',   dur:11, delay:4   },
            { cx:30, cy:55, r:5, color:'var(--accent-primary)', dur:13, delay:0.8 },
            { cx:70, cy:45, r:2, color:'var(--text-muted)',     dur:9,  delay:2.5 },
            { cx:15, cy:45, r:3, color:'var(--accent-yellow)',  dur:10, delay:1.2 },
            { cx:60, cy:80, r:5, color:'var(--accent-primary)', dur:8,  delay:3.5 },
            { cx:25, cy:80, r:2, color:'var(--accent-green)',   dur:15, delay:0.3 },
            { cx:75, cy:20, r:3, color:'var(--accent-yellow)',  dur:12, delay:2.8 },
          ].map((dot, i) => (
            <circle key={i} cx={dot.cx + '%'} cy={dot.cy + '%'} r={dot.r} fill={dot.color} opacity="0.25">
              <animate attributeName="cy" values={dot.cy + '%;' + (dot.cy - 6) + '%;' + dot.cy + '%'}
                dur={dot.dur + 's'} repeatCount="indefinite" begin={dot.delay + 's'} />
              <animate attributeName="opacity" values="0.25;0.6;0.25"
                dur={dot.dur + 's'} repeatCount="indefinite" begin={dot.delay + 's'} />
              <animate attributeName="r" values={dot.r + ';' + (dot.r + 1.5) + ';' + dot.r}
                dur={dot.dur + 's'} repeatCount="indefinite" begin={dot.delay + 's'} />
            </circle>
          ))}
        </svg>

        {/* ── Animated diagonal lines (sliding) ── */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.05 }}>
          <defs>
            <pattern id="diagLines" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <line x1="0" y1="120" x2="120" y2="0" stroke="var(--text-primary)" strokeWidth="1" />
              <animateTransform attributeName="patternTransform" type="translate"
                from="0 0" to="120 0" dur="6s" repeatCount="indefinite" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagLines)" />
        </svg>

        {/* ── Animated corner triangle top-right ── */}
        <svg className="absolute top-0 right-0 w-72 h-72 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="288,0 288,288 140,0" fill="var(--accent-primary)">
            <animate attributeName="opacity" values="0.05;0.12;0.05" dur="4s" repeatCount="indefinite" />
          </polygon>
        </svg>

        {/* ── Animated corner triangle bottom-left ── */}
        <svg className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,192 192,192 0,60" fill="var(--accent-yellow)">
            <animate attributeName="opacity" values="0.04;0.10;0.04" dur="5s" repeatCount="indefinite" begin="1s" />
          </polygon>
        </svg>

        {/* ── Animated rings top-right ── */}
        <svg className="absolute pointer-events-none" style={{ top: '15%', right: '12%', width: 180, height: 180 }} xmlns="http://www.w3.org/2000/svg">
          <circle cx="90" cy="90" r="80" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5">
            <animate attributeName="opacity" values="0.08;0.2;0.08" dur="3s" repeatCount="indefinite" />
            <animate attributeName="r" values="80;88;80" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="90" cy="90" r="55" fill="none" stroke="var(--accent-primary)" strokeWidth="1" strokeDasharray="6 6">
            <animateTransform attributeName="transform" type="rotate" from="0 90 90" to="360 90 90" dur="12s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.12;0.25;0.12" dur="3s" repeatCount="indefinite" begin="0.5s" />
          </circle>
        </svg>

        {/* ── Animated ring bottom-left ── */}
        <svg className="absolute pointer-events-none" style={{ bottom: '20%', left: '8%', width: 120, height: 120 }} xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="55" fill="none" stroke="var(--accent-yellow)" strokeWidth="1.5" strokeDasharray="4 8">
            <animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="10s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.06;0.18;0.06" dur="4s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* ── Animated glow blobs ── */}
        <div className="absolute pointer-events-none"
          style={{ top: '5rem', left: '-10rem', width: 500, height: 500, borderRadius: '50%', filter: 'blur(120px)',
            background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)',
            animation: 'blobFloat1 8s ease-in-out infinite' }} />
        <div className="absolute pointer-events-none"
          style={{ bottom: 0, right: 0, width: 400, height: 400, borderRadius: '50%', filter: 'blur(100px)',
            background: 'color-mix(in srgb, #7C3AED 10%, transparent)',
            animation: 'blobFloat2 10s ease-in-out infinite' }} />
        <div className="absolute pointer-events-none"
          style={{ top: '40%', left: '40%', width: 300, height: 300, borderRadius: '50%', filter: 'blur(100px)',
            background: 'color-mix(in srgb, var(--accent-green) 8%, transparent)',
            animation: 'blobFloat3 12s ease-in-out infinite' }} />

        <div className="relative z-10 max-w-7xl mx-auto w-full pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold uppercase tracking-widest"
            style={{ background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)', color: 'var(--accent-primary)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-green)' }} />
            Live Drops · Auth Checked · Ships Fast
          </div>

          <div className="mb-6" style={{ overflow: "hidden" }}>
            <h1 className="font-syne font-black leading-[0.9] tracking-tight"
              style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              THRIFT
            </h1>
            <h1 className="font-syne font-black leading-[0.9] tracking-tight"
              style={{ fontSize: 'clamp(2.2rem, 7.5vw, 6.5rem)', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #FF9A3C 50%, var(--accent-yellow) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
              DIFFERENT.
            </h1>
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
            <div className="max-w-md">
              <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Cop verified branded fits at prices that actually make sense.
                No fakes. No overpriced resellers. Just real drip from real people.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link to="/browse" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
                  Shop Now <ArrowRight size={18} />
                </Link>
                <Link to="/seller/list-product" className="btn-secondary text-base px-8 py-4">
                  Flip Your Closet
                </Link>
              </div>
            </div>

          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, transparent, var(--border))' }} />
          <p className="text-[10px] uppercase tracking-[4px]" style={{ color: 'var(--text-muted)' }}>Scroll</p>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden py-4 border-y" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', animation: 'marquee 20s linear infinite', whiteSpace: 'nowrap' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 px-6 text-sm font-semibold uppercase tracking-widest"
              style={{ color: i % 4 === 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
              {item} <span style={{ color: 'var(--border)' }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── BRANDS ────────────────────────────────────────────────────────── */}
      <section className="page-container">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Brands We Carry</p>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((b) => (
            <button key={b} onClick={() => navigate(`/browse?brand=${encodeURIComponent(b)}`)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-primary)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
              {b}
            </button>
          ))}
        </div>
      </section>

      {/* ── CATEGORY BENTO GRID ───────────────────────────────────────────── */}
      <section className="page-container">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>What You're Looking For</p>
            <h2 className="section-title">Shop the Vibe</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.name} to={`/browse?category=${cat.q}`}
              className="group relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
              style={{
                background: `color-mix(in srgb, ${cat.color} 8%, var(--bg-card))`,
                border: `1px solid color-mix(in srgb, ${cat.color} 20%, var(--border))`,
                minHeight: i === 0 ? '220px' : '120px',
                gridColumn: i === 0 ? 'span 2' : undefined,
                gridRow:    i === 0 ? 'span 2' : undefined,
              }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 50%, color-mix(in srgb, ${cat.color} 15%, transparent), transparent 70%)` }} />
              <div className="relative z-10">
                <span className="block mb-3" style={{ fontSize: i === 0 ? '3rem' : '2rem' }}>{cat.icon}</span>
                {i === 0 && <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: cat.color }}>Most Popular</p>}
                <p className="font-syne font-black" style={{ fontSize: i === 0 ? '1.5rem' : '1rem', color: 'var(--text-primary)' }}>{cat.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{cat.sub}</p>
              </div>
              <div className="relative z-10 self-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <ArrowUpRight size={18} style={{ color: cat.color }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED DROPS ────────────────────────────────────────────────── */}
      <section className="page-container">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Hand Picked</p>
            <h2 className="section-title">Featured Drops 🔥</h2>
          </div>
          <Link to="/browse" className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>
            See all <ArrowRight size={15} />
          </Link>
        </div>
        <ProductGrid products={featured} loading={loadingF} emptyMessage="No featured drops yet." />
      </section>

      {/* ── SPLIT BANNER ──────────────────────────────────────────────────── */}
      <section className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-2xl p-8 flex flex-col justify-between" style={{ minHeight: '220px', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-primary) 20%, var(--bg-card)), var(--bg-card))', border: '1px solid color-mix(in srgb, var(--accent-primary) 25%, var(--border))' }}>
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full blur-3xl" style={{ background: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' }} />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-primary)' }}>For the Shoppers</p>
              <h3 className="font-syne font-black text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>Cop Verified<br />Fits for Less</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Every item auth-checked by our team. Buy with full confidence, no cap.</p>
            </div>
            <Link to="/browse" className="btn-primary self-start mt-4 flex items-center gap-2 relative z-10">
              Start Shopping <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl p-8 flex flex-col justify-between" style={{ minHeight: '220px', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-green) 15%, var(--bg-card)), var(--bg-card))', border: '1px solid color-mix(in srgb, var(--accent-green) 25%, var(--border))' }}>
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full blur-3xl" style={{ background: 'color-mix(in srgb, var(--accent-green) 20%, transparent)' }} />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-green)' }}>For the Sellers</p>
              <h3 className="font-syne font-black text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>Your Closet<br />is a Goldmine</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Got fits collecting dust? List them in 2 mins and get paid. Real talk.</p>
            </div>
            <Link to="/seller/list-product" className="self-start mt-4 px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105 relative z-10"
              style={{ background: 'var(--accent-green)', color: '#fff' }}>
              Flip Your Closet <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ──────────────────────────────────────────────────── */}
      <section className="page-container">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Just Dropped</p>
            <h2 className="section-title">Fresh Off the Rack ✨</h2>
          </div>
          <Link to="/browse?sort=newest" className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>
            See all <ArrowRight size={15} />
          </Link>
        </div>
        <ProductGrid products={newArrivals} loading={loadingN} emptyMessage="Be the first to list something 👀" />
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="page-container">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>No Cap</p>
          <h2 className="section-title">How It Actually Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.num} className="relative card p-6 text-center hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-3 right-4 font-grotesk font-black text-5xl opacity-[0.04]"
                style={{ color: 'var(--text-primary)', lineHeight: 1 }}>{step.num}</div>
              <div className="text-4xl mb-4">{step.icon}</div>
              <span className="badge badge-brand text-[10px] mb-3">{step.sub}</span>
              <h3 className="font-syne font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────────────── */}
      <section className="page-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🛡️', label: 'Auth Verified',    sub: 'Every single listing' },
            { icon: '⚡', label: 'Fast Checkout',     sub: 'Razorpay secured' },
            { icon: '🔁', label: 'Easy Returns',      sub: 'Hassle-free process' },
            { icon: '💬', label: 'Chat with Seller',  sub: 'Before you buy' },
          ].map((t) => (
            <div key={t.label} className="card p-4 flex items-center gap-3">
              <span className="text-2xl flex-shrink-0">{t.icon}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────────── */}
      <section className="page-container pb-16">
        <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center"
          style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%)', border: '1px solid var(--border)' }}>
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)' }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'color-mix(in srgb, #7C3AED 10%, transparent)' }} />
          <div className="relative z-10">
            <span className="text-4xl block mb-4">👟</span>
            <h2 className="font-syne font-black text-3xl md:text-5xl mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
              Your Next Fit is<br />
              <span style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-yellow))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Already Here.
              </span>
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Real branded fits. Real sellers. Real prices. No more paying retail when you don't have to.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/browse" className="btn-primary text-base px-10 py-4 flex items-center justify-center gap-2">
                Explore Drops <Sparkles size={16} />
              </Link>
              <Link to="/auth/register" className="btn-secondary text-base px-10 py-4">
                Join for Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%      { transform: translate(40px, -30px) scale(1.08); }
          66%      { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          40%      { transform: translate(-50px, -40px) scale(1.1); }
          70%      { transform: translate(30px, 20px) scale(0.92); }
        }
        @keyframes blobFloat3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50%      { transform: translate(-40px, -50px) scale(1.15); }
        }
      `}</style>
    </div>
  );
}