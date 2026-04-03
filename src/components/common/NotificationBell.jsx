import { useState, useRef, useEffect } from 'react';
import { Bell, X, Package, CheckCircle, MessageCircle, ShoppingBag, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/helpers';

const TYPE_ICON = {
  order_placed:      <ShoppingBag size={16} />,
  order_confirmed:   <CheckCircle size={16} />,
  order_packed:      <Package size={16} />,
  order_shipped:     <Package size={16} />,
  order_delivered:   <CheckCircle size={16} />,
  new_order:         <ShoppingBag size={16} />,
  product_approved:  <CheckCircle size={16} />,
  product_rejected:  <X size={16} />,
  new_message:       <MessageCircle size={16} />,
  wishlist_price_drop:<Star size={16} />,
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) fetchNotifications();
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) await markAsRead(notif._id);
    setOpen(false);
    navigate(notif.link);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg transition-all hover:bg-[var(--bg-elevated)]"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full
                       text-[10px] font-bold text-white flex items-center justify-center"
            style={{ background: 'var(--accent-red)' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-xl shadow-card-hover z-50 overflow-hidden animate-slide-up"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Notifications {unreadCount > 0 && <span style={{ color: 'var(--accent-primary)' }}>({unreadCount})</span>}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs transition-colors"
                style={{ color: 'var(--accent-primary)' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center" style={{ color: 'var(--text-muted)' }}>
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-card)]"
                  style={{ background: n.isRead ? 'transparent' : 'color-mix(in srgb, var(--accent-primary) 5%, transparent)' }}
                >
                  <span
                    className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--bg-input)', color: 'var(--accent-primary)' }}
                  >
                    {TYPE_ICON[n.type] || <Bell size={14} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--accent-primary)' }} />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2.5 text-center" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => { setOpen(false); navigate('/notifications'); }}
              className="text-xs font-medium"
              style={{ color: 'var(--accent-primary)' }}
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
