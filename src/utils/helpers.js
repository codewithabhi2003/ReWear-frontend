// ─── Price ────────────────────────────────────────────────────────────────────
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const calcDiscount = (original, selling) => {
  if (!original || original <= selling) return null;
  return Math.round(((original - selling) / original) * 100);
};

// ─── Date ─────────────────────────────────────────────────────────────────────
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60)   return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400)return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800)return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Condition ────────────────────────────────────────────────────────────────
export const conditionColor = (condition) => {
  const map = {
    'Brand New with Tags': 'badge-green',
    'Like New':            'badge-green',
    'Good':                'badge-yellow',
    'Fair':                'badge-muted',
  };
  return map[condition] || 'badge-muted';
};

// ─── Order Status ─────────────────────────────────────────────────────────────
export const orderStatusColor = (status) => {
  const map = {
    'Payment Pending': 'badge-yellow',
    'Confirmed':       'badge-green',
    'Packed':          'badge-green',
    'Shipped':         'badge-brand',
    'Delivered':       'badge-green',
    'Cancelled':       'badge-red',
    'Refunded':        'badge-yellow',
  };
  return map[status] || 'badge-muted';
};

// ─── Avatar fallback ──────────────────────────────────────────────────────────
export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// ─── Truncate ─────────────────────────────────────────────────────────────────
export const truncate = (str, n = 60) =>
  str?.length > n ? str.slice(0, n) + '…' : str;
