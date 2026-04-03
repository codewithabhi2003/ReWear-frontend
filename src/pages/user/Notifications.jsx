import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/helpers';

export default function Notifications() {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => { fetchNotifications(); }, []);

  const handleClick = async (n) => {
    if (!n.isRead) await markAsRead(n._id);
    navigate(n.link);
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell size={24} style={{ color: 'var(--accent-primary)' }} />
          <h1 className="section-title">Notifications</h1>
          {unreadCount > 0 && <span className="badge badge-brand">{unreadCount} new</span>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm" style={{ color: 'var(--accent-primary)' }}>
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Bell size={48} className="mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <p className="font-syne font-bold text-xl" style={{ color: 'var(--text-primary)' }}>All caught up!</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => handleClick(n)}
              className="w-full card p-4 text-left flex items-start gap-4 hover:bg-[var(--bg-elevated)] transition-colors"
              style={{ background: n.isRead ? 'var(--bg-card)' : 'color-mix(in srgb, var(--accent-primary) 5%, var(--bg-card))' }}
            >
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--accent-primary)' }} />
              )}
              {n.isRead && <div className="w-2 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
