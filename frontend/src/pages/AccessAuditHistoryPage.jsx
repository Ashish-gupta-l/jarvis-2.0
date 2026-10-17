import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  History,
  Shield,
  Eye,
  Upload,
  Share2,
  UserX,
  FileText,
  Lock,
  Clock
} from 'lucide-react';

export const AccessAuditHistoryPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/audit/my-logs');
        if (res.success) {
          setLogs(res.data);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const getActionBadge = (action) => {
    if (action.includes('SHARE')) return { color: '#0284c7', bg: '#e0f2fe', icon: Share2 };
    if (action.includes('REVOKE')) return { color: '#e11d48', bg: '#ffe4e6', icon: UserX };
    if (action.includes('UPLOAD')) return { color: '#059669', bg: '#d1fae5', icon: Upload };
    if (action.includes('VIEW') || action.includes('DOWNLOAD')) return { color: '#4f46e5', bg: '#e0e7ff', icon: Eye };
    if (action.includes('VERIFICATION')) return { color: '#0f766e', bg: '#ccfbf1', icon: Shield };
    return { color: '#475569', bg: '#f1f5f9', icon: History };
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Access & Security Audit Log</h1>
          <p className="page-subtitle">
            Tamper-evident, immutable audit trail of record views, downloads, consent grants, and verification events
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#059669', background: '#d1fae5', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: 600 }}>
          <Lock size={14} /> Immutable Audit Ledger
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <History size={18} color="#0284c7" /> Audit Event Stream
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{logs.length} logged events</span>
        </div>

        {loading ? (
          <p style={{ color: '#64748b', padding: '1rem 0' }}>Retrieving secure audit events...</p>
        ) : logs.length === 0 ? (
          <p style={{ color: '#64748b', padding: '1.5rem 0' }}>No access history recorded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action / Event</th>
                  <th>Actor / User</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const Icon = badge.icon;
                  return (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: badge.color,
                            background: badge.bg,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px'
                          }}
                        >
                          <Icon size={12} /> {log.action}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>
                        {log.user?.fullName || log.user?.username || 'System Automation'}
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>
                          Role: {log.user?.role || 'SYSTEM'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#334155', maxWidth: '380px' }}>
                        {log.details}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>
                        {log.ipAddress}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessAuditHistoryPage;
