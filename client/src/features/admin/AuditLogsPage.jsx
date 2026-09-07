import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck 
} from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const MODULES = [
  'ALL',
  'AUTH',
  'FLEET',
  'DRIVERS',
  'DISPATCH',
  'MAINTENANCE',
  'FINANCE',
  'SAFETY',
  'COMMUNICATION',
  'USERS',
  'ROLES',
  'SETTINGS'
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/audit-logs', {
        params: {
          module: moduleFilter !== 'ALL' ? moduleFilter : undefined,
          page,
          limit: 15
        }
      });
      setLogs(res.data.data || []);
      setTotalPages(res.data.metadata?.totalPages || 1);
      setTotalCount(res.data.metadata?.total || 0);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('CREATE') || action.includes('REGISTER')) return '#10B981';
    if (action.includes('UPDATE') || action.includes('EDIT')) return '#2563EB';
    if (action.includes('DELETE') || action.includes('CANCEL')) return '#EF4444';
    return '#F59E0B';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>System Audit Trail</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Immutable chronological record of security operations, data modifications, and user access.
          </p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', borderRadius: 6, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', fontSize: '0.8125rem', fontWeight: 600 }}>
          <ShieldCheck size={16} /> Immutable Ledger Active
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter by Module:</span>
          <select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setPage(1);
            }}
            style={{ padding: '0.45rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
          >
            {MODULES.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Showing {logs.length} of {totalCount} total system events
        </div>
      </div>

      {/* Audit Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <SkeletonLoader count={6} height={46} />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState 
            icon={FileText} 
            title="No Audit Logs Found" 
            message="No system modification records match your active module selection." 
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Actor (User)</th>
                  <th>IP Address</th>
                  <th>Target Record ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const badgeColor = getActionBadgeColor(log.action || '');
                  return (
                    <tr key={log._id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-primary)' }}>
                          <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(log.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span 
                          className="badge" 
                          style={{ 
                            background: `${badgeColor}18`, 
                            color: badgeColor, 
                            fontWeight: 600,
                            fontFamily: 'monospace' 
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{log.module}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={14} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontSize: '0.8125rem' }}>
                            {log.actor ? `${log.actor.firstName || ''} ${log.actor.lastName || ''}`.trim() || String(log.actor).substring(0, 10) : 'System Worker'}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
                          <Globe size={13} style={{ color: 'var(--text-muted)' }} />
                          {log.ipAddress || '127.0.0.1'}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {log.recordId ? String(log.recordId).substring(0, 16) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              className="btn btn-outline" 
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Page {page} of {totalPages}
            </span>
            <button 
              className="btn btn-outline" 
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
