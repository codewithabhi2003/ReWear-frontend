import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flag, Check, X, Eye, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { timeAgo } from '../../utils/helpers';
import { Spinner } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:   { bg: 'rgba(255,211,42,0.12)',  color: '#FFD32A' },
  reviewed:  { bg: 'rgba(0,160,255,0.12)',   color: '#00a0ff' },
  resolved:  { bg: 'rgba(0,200,150,0.12)',   color: '#00C896' },
  dismissed: { bg: 'rgba(120,120,120,0.12)', color: '#888'    },
};

export default function AdminReports() {
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter,  setFilter]    = useState('pending');
  const [updating, setUpdating] = useState(null); // report id being updated

  const fetchReports = (status = filter) => {
    setLoading(true);
    api.get(`/reports?status=${status}&limit=50`)
      .then(({ data }) => setReports(data.data.reports))
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(filter); }, [filter]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/reports/${id}`, { status });
      setReports((prev) =>
        prev.map((r) => r._id === id ? { ...r, status } : r)
      );
      toast.success(`Report marked as ${status}`);
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const FILTERS = ['pending', 'reviewed', 'resolved', 'dismissed', 'all'];

  return (
    <div style={{ padding: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Flag size={20} style={{ color: 'var(--accent-primary)' }} />
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', margin: 0 }}>
            Reports
          </h1>
          {reports.length > 0 && (
            <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)', color: 'var(--accent-primary)' }}>
              {reports.length}
            </span>
          )}
        </div>
        <button onClick={() => fetchReports(filter)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: filter === f ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              fontSize: 12, fontWeight: 600, textTransform: 'capitalize', transition: 'all 150ms',
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Flag size={36} style={{ margin: '0 auto 12px', opacity: 0.25 }} />
          <p>No {filter === 'all' ? '' : filter} reports</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reports.map((r) => {
            const sc = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
            return (
              <div key={r._id} className="card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>

                  {/* Left — report info */}
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color, textTransform: 'capitalize' }}>
                        {r.status}
                      </span>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {r.targetType}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {timeAgo(r.createdAt)}
                      </span>
                    </div>

                    {/* Target */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      {r.targetSnapshot?.image && (
                        <img src={r.targetSnapshot.image} alt=""
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
                      )}
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {r.targetSnapshot?.title || 'Unknown'}
                        </p>
                        {r.targetSnapshot?.url && (
                          <Link to={r.targetSnapshot.url}
                            style={{ fontSize: 12, color: 'var(--accent-primary)', textDecoration: 'none' }}
                            target="_blank">
                            View {r.targetType} ↗
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Reason */}
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: r.details ? 4 : 0 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Reason:</strong> {r.reason}
                    </p>
                    {r.details && (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4, lineHeight: 1.5 }}>
                        "{r.details}"
                      </p>
                    )}

                    {/* Reporter */}
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                      Reported by: {r.reportedBy?.name} ({r.reportedBy?.email})
                    </p>
                  </div>

                  {/* Right — action buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(r._id, 'reviewed')}
                          disabled={updating === r._id}
                          style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Eye size={12} /> Mark Reviewed
                        </button>
                        <button onClick={() => updateStatus(r._id, 'resolved')}
                          disabled={updating === r._id}
                          style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#00C896', color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          {updating === r._id ? <Spinner size={12} /> : <Check size={12} />} Resolve
                        </button>
                        <button onClick={() => updateStatus(r._id, 'dismissed')}
                          disabled={updating === r._id}
                          style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: '#ff4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <X size={12} /> Dismiss
                        </button>
                      </>
                    )}
                    {r.status === 'reviewed' && (
                      <>
                        <button onClick={() => updateStatus(r._id, 'resolved')}
                          disabled={updating === r._id}
                          style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#00C896', color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          {updating === r._id ? <Spinner size={12} /> : <Check size={12} />} Resolve
                        </button>
                        <button onClick={() => updateStatus(r._id, 'dismissed')}
                          disabled={updating === r._id}
                          style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: '#ff4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <X size={12} /> Dismiss
                        </button>
                      </>
                    )}
                    {['resolved', 'dismissed'].includes(r.status) && (
                      <button onClick={() => updateStatus(r._id, 'pending')}
                        disabled={updating === r._id}
                        style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}