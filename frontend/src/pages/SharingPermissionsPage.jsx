import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Share2,
  Lock,
  Clock,
  ShieldCheck,
  AlertTriangle,
  UserX,
  CheckCircle2,
  Calendar,
  Building,
  Info
} from 'lucide-react';

export const SharingPermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [providers, setProviders] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [shareScope, setShareScope] = useState('FULL_TIMELINE');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [durationHours, setDurationHours] = useState(72);
  const [granting, setGranting] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [permRes, provRes, recRes] = await Promise.all([
        api.get('/sharing/patient-permissions'),
        api.get('/patient/available-providers'),
        api.get('/patient/timeline')
      ]);

      if (permRes.success) setPermissions(permRes.data);
      if (provRes.success) {
        setProviders(provRes.data);
        if (provRes.data.length > 0) setSelectedProviderId(provRes.data[0].id);
      }
      if (recRes.success) setRecords(recRes.data);
    } catch (err) {
      console.error('Failed to load sharing permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGrant = async (e) => {
    e.preventDefault();
    if (!selectedProviderId) return;

    setGranting(true);
    setSuccessMessage(null);
    try {
      const payload = {
        providerId: parseInt(selectedProviderId),
        shareScope,
        recordId: shareScope === 'SELECTED_RECORD' && selectedRecordId ? parseInt(selectedRecordId) : null,
        durationHours: parseInt(durationHours)
      };

      const res = await api.post('/sharing/grant', payload);
      if (res.success) {
        setSuccessMessage('Consent granted. The selected provider now has temporary authorized access.');
        fetchData();
      }
    } catch (err) {
      alert('Failed to grant consent: ' + err.message);
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (permissionId) => {
    if (!window.confirm('Are you sure you want to revoke future access for this healthcare provider?')) {
      return;
    }

    setRevokingId(permissionId);
    setSuccessMessage(null);
    try {
      const res = await api.post(`/sharing/${permissionId}/revoke`, {
        reason: 'Revoked by patient through sovereign consent manager'
      });
      if (res.success) {
        setSuccessMessage('Access revoked. Future requests from this provider are now rejected by the backend.');
        fetchData();
      }
    } catch (err) {
      alert('Failed to revoke access: ' + err.message);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Consent-Based Record Sharing</h1>
          <p className="page-subtitle">
            Authorize temporary, time-bound clinical access to specific providers and revoke future access on demand
          </p>
        </div>
      </div>

      {/* Revocation Limitation Notice (Feature 16) */}
      <div className="callout-info" style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <Info size={22} color="#0f766e" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <div style={{ fontSize: '0.88rem', color: '#0f766e', lineHeight: 1.5 }}>
          <strong>Consent & Revocation Notice:</strong> Revoking a permission immediately stops any future access or viewing through CareTrail APIs. However, revocation cannot guarantee deletion of medical records or briefs previously downloaded or saved into local electronic health records (EHR) by an authorized clinician while consent was active.
        </div>
      </div>

      {successMessage && (
        <div className="callout-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} color="#0f766e" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Grant New Permission Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Share2 size={18} color="#15803d" /> Grant Provider Consent
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#14532d', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, border: '1px solid #86efac' }}>
              Sovereign Patient Control 🍃
            </span>
          </div>

          <form onSubmit={handleGrant}>
            <div className="form-group">
              <label className="form-label">Select Verified Healthcare Provider *</label>
              <select
                className="form-select"
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
                required
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.institutionName} ({p.department || p.specialization}) — Dr. {p.user?.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sharing Scope *</label>
              <select
                className="form-select"
                value={shareScope}
                onChange={(e) => setShareScope(e.target.value)}
              >
                <option value="FULL_TIMELINE">Full Unified Medical Timeline & All Records</option>
                <option value="CONTINUITY_BRIEF_ONLY">Continuity Brief Only (Summary & Provenance)</option>
                <option value="SELECTED_RECORD">Single Selected Medical Record</option>
              </select>
            </div>

            {shareScope === 'SELECTED_RECORD' && (
              <div className="form-group">
                <label className="form-label">Select Medical Document *</label>
                <select
                  className="form-select"
                  value={selectedRecordId}
                  onChange={(e) => setSelectedRecordId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Record --</option>
                  {records.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} - {r.title} ({r.recordDate})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Access Duration (Hours) *</label>
              <select
                className="form-select"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
              >
                <option value="24">24 Hours (1 Day - Urgent Consultation)</option>
                <option value="72">72 Hours (3 Days - Inpatient / Outpatient Evaluation)</option>
                <option value="168">168 Hours (7 Days - Comprehensive Follow-up)</option>
                <option value="720">720 Hours (30 Days - Extended Inpatient / Chronic Care)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={granting || providers.length === 0}>
              <Lock size={15} /> {granting ? 'Authorizing...' : 'Authorize Clinical Access'}
            </button>
          </form>
        </div>

        {/* Existing Permissions Ledger */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={18} color="#0f766e" /> Active & Historical Consents
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{permissions.length} total</span>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>Loading consents...</p>
          ) : permissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p>No sharing consents have been granted yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {permissions.map((perm) => {
                const isCurrentlyActive = perm.isActive && new Date(perm.expiresAt) > new Date();
                return (
                  <div
                    key={perm.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: isCurrentlyActive ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                      background: isCurrentlyActive ? '#f0f9ff' : '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                          {perm.provider?.institutionName}
                        </strong>
                        <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Attending: Dr. {perm.provider?.user?.fullName} ({perm.provider?.department || 'Medical Staff'})
                        </p>
                      </div>

                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: isCurrentlyActive ? '#d1fae5' : '#fee2e2',
                          color: isCurrentlyActive ? '#059669' : '#991b1b'
                        }}
                      >
                        {isCurrentlyActive ? 'ACTIVE CONSENT' : perm.revokedAt ? 'REVOKED' : 'EXPIRED'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                      Scope: <strong>{perm.shareScope.replace(/_/g, ' ')}</strong>
                      {perm.record && (
                        <span> (#{perm.record.id}: {perm.record.title})</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                      <span>
                        Expires: <strong>{new Date(perm.expiresAt).toLocaleString()}</strong>
                      </span>

                      {isCurrentlyActive && (
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={revokingId === perm.id}
                          onClick={() => handleRevoke(perm.id)}
                        >
                          <UserX size={14} /> Revoke Future Access
                        </button>
                      )}
                    </div>

                    {perm.revokedAt && (
                      <p style={{ fontSize: '0.75rem', color: '#991b1b', fontStyle: 'italic' }}>
                        Revoked on {new Date(perm.revokedAt).toLocaleString()}: {perm.revocationReason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharingPermissionsPage;
