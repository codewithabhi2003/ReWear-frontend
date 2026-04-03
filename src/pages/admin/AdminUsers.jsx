// AdminUsers.jsx
import { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { Spinner } from '../../components/common/Loader';

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [toggling, setToggling] = useState(null);

  const fetchUsers = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { search: q, limit: 50 } });
      setUsers(data.data.users);
    } catch { toast.error('Could not load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const toggleBlock = async (user) => {
    const action = user.isBlocked ? 'unblock' : 'block';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.name}?`)) return;
    setToggling(user._id);
    try {
      await api.put(`/admin/users/${user._id}/${action}`);
      setUsers((prev) => prev.map((u) =>
        u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u
      ));
      toast.success(`User ${action}ed`);
    } catch { toast.error('Action failed'); }
    finally { setToggling(null); }
  };

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">User Management</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="input pl-9"
          />
        </div>
        <button type="submit" className="btn-primary px-4">Search</button>
      </form>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--bg-elevated)' }}>
                <tr>
                  {['User', 'Email', 'Joined', 'Sold', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {u.avatar ? (
                          <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: 'var(--accent-primary)' }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                          {u.role === 'admin' && (
                            <span className="text-[10px] font-bold" style={{ color: 'var(--accent-primary)' }}>ADMIN</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{u.sellerStats?.totalSold || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isBlocked ? 'badge-red' : 'badge-green'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleBlock(u)}
                          disabled={toggling === u._id}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                          style={{
                            background: u.isBlocked
                              ? 'color-mix(in srgb, var(--accent-green) 10%, transparent)'
                              : 'color-mix(in srgb, var(--accent-red) 10%, transparent)',
                            color: u.isBlocked ? 'var(--accent-green)' : 'var(--accent-red)',
                          }}
                        >
                          {toggling === u._id
                            ? <Spinner size={12} />
                            : u.isBlocked
                              ? <><CheckCircle size={12} /> Unblock</>
                              : <><Ban size={12} /> Block</>
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>No users found</p>
          )}
        </div>
      )}
    </div>
  );
}
