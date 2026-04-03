// Full-page loading spinner
export function PageLoader() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
            style={{ borderTopColor: 'var(--accent-primary)' }}
          />
          <div
            className="absolute inset-2 rounded-full border-4 border-transparent animate-spin"
            style={{ borderTopColor: 'var(--accent-green)', animationDirection: 'reverse', animationDuration: '0.6s' }}
          />
        </div>
        <span className="font-syne text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
          ReWear
        </span>
      </div>
    </div>
  );
}

// Inline spinner (small)
export function Spinner({ size = 20 }) {
  return (
    <div
      className="rounded-full border-2 border-transparent animate-spin inline-block"
      style={{
        width: size,
        height: size,
        borderTopColor: 'var(--accent-primary)',
      }}
    />
  );
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton w-full aspect-square" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-5 w-1/3 rounded mt-1" />
      </div>
    </div>
  );
}

// Product grid skeleton (n cards)
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Generic line skeleton
export function LineSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
