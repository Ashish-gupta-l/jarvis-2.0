import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  FileSpreadsheet,
  AlertTriangle,
  FileText,
  Clock,
  Printer,
  ShieldAlert,
  ExternalLink,
  Info,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import DocumentViewerModal from '../components/DocumentViewerModal';

export const ContinuityBriefPage = () => {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const queryParams = new URLSearchParams(useLocation().search);
  const targetPatientId = queryParams.get('patientId');

  useEffect(() => {
    const fetchBrief = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = targetPatientId ? `/continuity/brief/${targetPatientId}` : '/continuity/my-brief';
        const res = await api.get(endpoint);
        if (res.success) {
          setBrief(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to generate Continuity Brief. Authorization may be required.');
      } finally {
        setLoading(false);
      }
    };

    fetchBrief();
  }, [targetPatientId]);

  const openSourceDocument = async (recordId) => {
    try {
      const res = await api.get(`/records/${recordId}`);
      if (res.success) {
        setSelectedRecord(res.data);
        setViewerOpen(true);
      }
    } catch (err) {
      alert('Could not open source record: ' + err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container" style={{ maxWidth: '900px', padding: '2rem 1.5rem' }}>
      <div className="page-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-title">Clinical Continuity Brief</h1>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              SOURCE-LINKED CLINICAL RECONCILIATION
            </span>
          </div>
          <p className="page-subtitle">
            Consolidated summary with source provenance for attending healthcare providers
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
          <Printer size={15} /> Print / Export Brief
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          <p>Compiling verified clinical facts and provenance links...</p>
        </div>
      ) : error ? (
        <div className="callout-conflict" style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
          <ShieldAlert size={22} color="#e11d48" />
          <div>
            <strong style={{ fontSize: '0.95rem', color: '#9f1239' }}>Access Restricted to Continuity Brief</strong>
            <p style={{ fontSize: '0.85rem', color: '#e11d48', marginTop: '0.2rem' }}>{error}</p>
          </div>
        </div>
      ) : !brief ? (
        <p>No brief available.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
          {/* Patient Demographics Banner */}
          <div className="card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>
                  {brief.patientName || 'Patient Record'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>
                  National Health ID: <strong>{brief.nationalHealthId || 'CT-PID-100452'}</strong> • Blood Group: <strong>{brief.bloodGroup || 'Unknown'}</strong>
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Generated On:</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
              <div>
                <span style={{ fontWeight: 700, color: '#9f1239', textTransform: 'uppercase', fontSize: '0.72rem' }}>Documented Allergies:</span>
                <p style={{ fontWeight: 600, color: '#e11d48' }}>{brief.allergies}</p>
              </div>
              <div>
                <span style={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', fontSize: '0.72rem' }}>Chronic Conditions:</span>
                <p style={{ color: '#0f172a' }}>{brief.chronicConditions}</p>
              </div>
            </div>
          </div>

          {/* Section: Verification Limitations & Uncertainty Disclaimers (Feature 14) */}
          {brief.verificationLimitations?.length > 0 && (
            <div className="callout-warning">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#92400e', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                <ShieldAlert size={16} /> Verification Limitations & Clinical Scope Disclaimers:
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#92400e', lineHeight: 1.6 }}>
                {brief.verificationLimitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Section: Active Prescriptions & Regimens */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <FileText size={18} color="#0f766e" /> Active Prescriptions & Medications
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Source-Linked</span>
            </div>

            {brief.activePrescriptions?.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.88rem' }}>No active prescriptions registered.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medication & Regimen</th>
                      <th>Source Provider / Facility</th>
                      <th>Date</th>
                      <th>Trust Status</th>
                      <th>Provenance Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brief.activePrescriptions.map((claim, idx) => (
                      <tr key={idx} style={{ background: claim.isUncertainOrUnverified ? '#fffbeb' : 'inherit' }}>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{claim.claimValue}</td>
                        <td>{claim.sourceFacility || 'Unknown'}</td>
                        <td>{claim.sourceDate}</td>
                        <td>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', background: claim.isUncertainOrUnverified ? '#fef3c7' : '#d1fae5', color: claim.isUncertainOrUnverified ? '#d97706' : '#059669' }}>
                            {claim.verificationStatus}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => openSourceDocument(claim.sourceRecordId)}
                          >
                            <ExternalLink size={12} /> Source #{claim.sourceRecordId}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Known Diagnoses & Clinical Impressions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <CheckCircle2 size={18} color="#0284c7" /> Diagnoses & Clinical Impressions
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>As written in records</span>
            </div>

            {brief.diagnoses?.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.88rem' }}>No documented diagnoses found.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Diagnosis</th>
                      <th>Attending Facility</th>
                      <th>Date</th>
                      <th>Verification Status</th>
                      <th>Provenance Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brief.diagnoses.map((claim, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{claim.claimValue}</td>
                        <td>{claim.sourceFacility || 'Unknown'}</td>
                        <td>{claim.sourceDate}</td>
                        <td>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1' }}>
                            {claim.verificationStatus}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => openSourceDocument(claim.sourceRecordId)}
                          >
                            <ExternalLink size={12} /> Source #{claim.sourceRecordId}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Recent Investigations & Laboratory Findings */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Calendar size={18} color="#4f46e5" /> Recent Laboratory Findings & Diagnostics
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>CLIA & Diagnostic Lab Data</span>
            </div>

            {brief.recentInvestigations?.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.88rem' }}>No recent investigations recorded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {brief.recentInvestigations.map((claim, idx) => (
                  <div key={idx} style={{ padding: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{claim.claimValue}</strong>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                        {claim.sourceFacility} • {claim.sourceDate} • Status: {claim.verificationStatus}
                      </p>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openSourceDocument(claim.sourceRecordId)}
                    >
                      <ExternalLink size={12} /> View Lab #{claim.sourceRecordId}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Unresolved Record Conflicts */}
          {brief.unresolvedConflicts?.length > 0 && (
            <div className="card" style={{ borderLeft: '4px solid #e11d48' }}>
              <div className="card-header">
                <h3 className="card-title" style={{ color: '#9f1239' }}>
                  <AlertTriangle size={18} color="#e11d48" /> Unresolved Record Conflicts ({brief.unresolvedConflicts.length})
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#e11d48', fontWeight: 600 }}>ATTENTION REQUIRED</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {brief.unresolvedConflicts.map((c) => (
                  <div key={c.id} style={{ background: '#fff1f2', padding: '0.85rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#9f1239' }}>{c.description}</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                      <div style={{ background: '#ffffff', padding: '0.4rem', borderRadius: '4px', border: '1px solid #fecaca' }}>
                        <strong>Source 1:</strong> {c.conflictingValue1}
                      </div>
                      <div style={{ background: '#ffffff', padding: '0.4rem', borderRadius: '4px', border: '1px solid #fecaca' }}>
                        <strong>Source 2:</strong> {c.conflictingValue2}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Documented Follow-up Tasks */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Clock size={18} color="#0f766e" /> Documented Follow-up Tasks & Status
              </h3>
            </div>

            {brief.followUpTasks?.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.88rem' }}>No pending follow-up tasks documented.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {brief.followUpTasks.map((t) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{t.taskDescription}</strong>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                        Target Date: <strong>{t.dueDate}</strong> • Status: {t.status}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', background: t.status === 'COMPLETED' ? '#d1fae5' : '#fef3c7', color: t.status === 'COMPLETED' ? '#059669' : '#d97706' }}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        record={selectedRecord}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
};

export default ContinuityBriefPage;
