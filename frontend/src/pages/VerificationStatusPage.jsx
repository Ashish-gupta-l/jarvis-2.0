import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  History,
  Info,
  Clock,
  Building,
  FileCheck,
  HelpCircle,
  XCircle
} from 'lucide-react';

export const VerificationStatusPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patient/timeline');
      if (res.success) {
        setRecords(res.data);
        if (res.data.length > 0 && !selectedRecord) {
          selectRecord(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const selectRecord = async (record) => {
    setSelectedRecord(record);
    setLoadingEvents(true);
    setStatusMessage(null);
    try {
      const res = await api.get(`/verification/${record.id}/history`);
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to load verification events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleRequestVerification = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setDispatching(true);
    try {
      const res = await api.post(`/verification/${selectedRecord.id}/request-institution-check?notes=${encodeURIComponent(inquiryNotes)}`);
      if (res.success) {
        setStatusMessage('Verification inquiry dispatched to issuing facility. Record updated to Verification Pending.');
        setInquiryNotes('');
        fetchRecords();
        selectRecord(selectedRecord);
      }
    } catch (err) {
      setStatusMessage('Error: ' + err.message);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Medical Document Trust Layer</h1>
          <p className="page-subtitle">
            Evidence-based verification tracking, institutional confirmations, cryptographic signatures, and audit logs
          </p>
        </div>
      </div>

      {/* Critical Verification Transparency Callout (Section 7) */}
      <div className="callout-info" style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <Info size={22} color="#0f766e" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <div style={{ fontSize: '0.88rem', color: '#0f766e', lineHeight: 1.5 }}>
          <strong>Transparency Principle:</strong> CareTrail distinguishes between verifying that a doctor is registered and verifying that the doctor actually issued a specific document. A valid digital signature verifies document integrity only within its cryptographic scope; it does not guarantee clinical infallibility. If an issuing clinic is uncontactable, the record remains unverified rather than falsely branded fraudulent.
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Document Selector Column */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FileCheck size={18} color="#15803d" /> Select Document to Inspect
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{records.length} total</span>
          </div>

          {loading ? (
            <p style={{ color: '#64748b', padding: '1rem 0' }}>Loading records...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {records.map((rec) => {
                const isSelected = selectedRecord?.id === rec.id;
                return (
                  <div
                    key={rec.id}
                    onClick={() => selectRecord(rec)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #15803d' : '1px solid #e2e8f0',
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{rec.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{rec.recordDate}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {rec.issuingFacility || 'Unknown Facility'}
                      </span>
                      <StatusBadge status={rec.verificationStatus} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Verification Evidence Log & Actions Column */}
        {selectedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Status Card */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a' }}>
                    {selectedRecord.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Facility: {selectedRecord.issuingFacility || 'Unspecified'} • Doctor: {selectedRecord.attendingPhysician || 'N/A'}
                  </p>
                </div>
                <StatusBadge status={selectedRecord.verificationStatus} />
              </div>

              {statusMessage && (
                <div className="callout-info" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {statusMessage}
                </div>
              )}

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Cryptographic Integrity & Metadata:
                </span>
                <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#334155' }}>
                  <div><strong>SHA-256 Hash:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{selectedRecord.documentMetadata?.sha256Hash || 'Computed on ingestion'}</span></div>
                  <div><strong>Storage Status:</strong> {selectedRecord.documentMetadata?.encryptionStatus || 'STORED_ENCRYPTED_AT_REST'}</div>
                  <div><strong>Digital Signature:</strong> {selectedRecord.documentMetadata?.hasDigitalSignature ? 'Validated via PKI' : 'None / Ordinary Paper Certificate'}</div>
                </div>
              </div>

              {/* Request Institutional Inquiry */}
              {selectedRecord.verificationStatus === 'PATIENT_UPLOADED_UNVERIFIED' && (
                <form onSubmit={handleRequestVerification} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <label className="form-label">
                    Initiate Institutional Verification Inquiry
                  </label>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    Send an authorized verification request to {selectedRecord.issuingFacility || 'the issuing healthcare institution'}.
                  </p>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Optional inquiry notes or reference number..."
                    value={inquiryNotes}
                    onChange={(e) => setInquiryNotes(e.target.value)}
                    style={{ marginBottom: '0.75rem' }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={dispatching}>
                    <Send size={14} /> {dispatching ? 'Dispatching...' : 'Request Issuer Confirmation'}
                  </button>
                </form>
              )}
            </div>

            {/* Evidence Log */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <History size={18} color="#0f766e" /> Verification Evidence Log
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Immutable audit trail</span>
              </div>

              {loadingEvents ? (
                <p style={{ color: '#64748b' }}>Loading evidence events...</p>
              ) : events.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>No verification events recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      style={{
                        padding: '0.85rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>
                          Method: {evt.methodUsed}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {new Date(evt.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#0f172a', marginBottom: '0.35rem' }}>
                        <strong>Status: </strong> {evt.previousStatus || 'NONE'} ➔ <span style={{ fontWeight: 600, color: '#059669' }}>{evt.newStatus}</span>
                      </div>

                      <p style={{ fontSize: '0.82rem', color: '#475569' }}>
                        {evt.evidenceDetails}
                      </p>

                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                        Actor: {evt.actorUser?.fullName || 'System Automation'} ({evt.actorUser?.role || 'SYSTEM'})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationStatusPage;
