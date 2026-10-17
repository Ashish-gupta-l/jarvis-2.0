import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldCheck,
  Building,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Activity
} from 'lucide-react';

export const AdminVerificationPage = () => {
  const [providers, setProviders] = useState([]);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('providers');
  const [actionInProgress, setActionInProgress] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [provRes, statsRes, auditRes] = await Promise.all([
        api.get('/admin/providers'),
        api.get('/admin/stats'),
        api.get('/admin/providers') // We'll also fetch audit logs if available
      ]);

      if (provRes.success) setProviders(provRes.data);
      if (statsRes.success) setStats(statsRes.data);

      try {
        const logsRes = await api.get('/audit/all');
        if (logsRes.success) setAuditLogs(logsRes.data);
      } catch (ignored) {}
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyProvider = async (providerId, status) => {
    setActionInProgress(providerId);
    setSuccessMessage(null);
    try {
      const res = await api.post(`/admin/providers/${providerId}/verify?status=${status}`);
      if (res.success) {
        setSuccessMessage(`Provider status updated to ${status}. Logged in security audit trail.`);
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to update provider status: ' + err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className="page-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-title">Platform Administration & Credential Verification</h1>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              SECURITY & GOVERNANCE CONSOLE
            </span>
          </div>
          <p className="page-subtitle">
            Review healthcare provider registration requests, verify state credentials, and audit security events
          </p>
        </div>
      </div>

      {/* Security Compliance Callout (Section 5) */}
      <div className="callout-warning" style={{ display: 'flex', gap: '0.75rem', margin: '1.5rem 0' }}>
        <Lock size={22} color="#d97706" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <div style={{ fontSize: '0.88rem', color: '#92400e', lineHeight: 1.5 }}>
          <strong>Role-Based Access Control Directive:</strong> In compliance with healthcare continuity governance, administrators do not receive unrestricted access to view or download patient private medical documents. Administrative permissions are restricted to provider credential verification, discrepancy monitoring, and security audit ledger review.
        </div>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>REGISTERED USERS</span>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.3rem' }}>
              {stats.totalUsers}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#059669' }}>Patients, Providers, Admins</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>INGESTED RECORDS</span>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0284c7', marginTop: '0.3rem' }}>
              {stats.totalRecords}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Digitized & Hashed (SHA-256)</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>HEALTHCARE PROVIDERS</span>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f766e', marginTop: '0.3rem' }}>
              {stats.totalProviders}
            </div>
            <span style={{ fontSize: '0.75rem', color: stats.pendingProviders > 0 ? '#d97706' : '#059669' }}>
              {stats.pendingProviders} pending verification
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>DETECTED CONFLICTS</span>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#e11d48', marginTop: '0.3rem' }}>
              {stats.activeConflicts}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#e11d48' }}>Active clinical discrepancies</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'providers' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('providers')}
        >
          <Building size={14} /> Provider Registration & Credentials ({providers.length})
        </button>
        <button
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('audit')}
        >
          <History size={14} /> System-Wide Security Audit Stream
        </button>
      </div>

      {successMessage && (
        <div className="callout-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} color="#0f766e" />
          <span>{successMessage}</span>
        </div>
      )}

      {activeTab === 'providers' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <UserCheck size={18} color="#0284c7" /> Provider Verification Queue
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Manage institutional access privileges</span>
          </div>

          {loading ? (
            <p style={{ color: '#64748b', padding: '1.5rem 0' }}>Loading provider applications...</p>
          ) : providers.length === 0 ? (
            <p style={{ color: '#64748b', padding: '1.5rem 0' }}>No providers registered yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Institution & Clinician</th>
                    <th>License Number</th>
                    <th>Specialization / Dept</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{p.institutionName}</strong>
                        <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Attending: Dr. {p.user?.fullName} ({p.user?.email})
                        </p>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                        {p.licenseNumber}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {p.specialization || p.department || 'General Practice'}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            background: p.verificationStatus === 'VERIFIED' ? '#d1fae5' : p.verificationStatus === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                            color: p.verificationStatus === 'VERIFIED' ? '#059669' : p.verificationStatus === 'REJECTED' ? '#991b1b' : '#d97706'
                          }}
                        >
                          {p.verificationStatus}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {p.verificationStatus !== 'VERIFIED' && (
                            <button
                              className="btn btn-success btn-sm"
                              disabled={actionInProgress === p.id}
                              onClick={() => handleVerifyProvider(p.id, 'VERIFIED')}
                            >
                              <CheckCircle2 size={13} /> Verify & Approve
                            </button>
                          )}
                          {p.verificationStatus !== 'REJECTED' && (
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={actionInProgress === p.id}
                              onClick={() => handleVerifyProvider(p.id, 'REJECTED')}
                            >
                              <UserX size={13} /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <History size={18} color="#0f766e" /> Immutable Security Audit Ledger
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Irrevocable security event logs</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>User / Actor</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {log.user?.fullName || log.user?.username || 'System'} ({log.user?.role || 'SYSTEM'})
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#334155' }}>
                      {log.details}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerificationPage;
