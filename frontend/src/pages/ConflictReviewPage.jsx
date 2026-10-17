import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  AlertTriangle,
  GitMerge,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';

export const ConflictReviewPage = () => {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/conflicts/my-conflicts');
      if (res.success) {
        setConflicts(res.data);
      }
    } catch (err) {
      console.error('Failed to load conflicts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, []);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedConflict || !resolutionNotes.trim()) return;

    setResolving(true);
    try {
      const res = await api.post(`/conflicts/${selectedConflict.id}/resolve`, {
        resolutionNotes
      });
      if (res.success) {
        setSuccessMessage('Conflict marked as resolved with clinical rationale.');
        setSelectedConflict(null);
        setResolutionNotes('');
        fetchConflicts();
      }
    } catch (err) {
      alert('Failed to resolve conflict: ' + err.message);
    } finally {
      setResolving(false);
    }
  };

  const unresolved = conflicts.filter((c) => !c.isResolved);
  const resolved = conflicts.filter((c) => c.isResolved);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Record Conflict Review</h1>
          <p className="page-subtitle">
            Rule-based detection of discrepancies, conflicting medication regimens, date anomalies, and mismatched patient identifiers
          </p>
        </div>
      </div>

      <div className="callout-warning" style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <Info size={22} color="#d97706" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <div style={{ fontSize: '0.88rem', color: '#92400e', lineHeight: 1.5 }}>
          <strong>Safety Directive:</strong> CareTrail detects and flags contradictory clinical information across institutions, but does not automatically decide which record is medically correct. Please discuss conflicting medications or dosages with your attending clinician.
        </div>
      </div>

      {successMessage && (
        <div className="callout-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} color="#0f766e" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Unresolved Conflicts Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} color="#e11d48" /> Active Discrepancies ({unresolved.length})
        </h2>

        {loading ? (
          <p style={{ color: '#64748b' }}>Analyzing records for clinical discrepancies...</p>
        ) : unresolved.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 0.5rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>No Active Conflicts Detected</h3>
            <p style={{ fontSize: '0.85rem' }}>All uploaded records are consistent across providers.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {unresolved.map((conflict) => (
              <div key={conflict.id} className="card" style={{ borderLeft: '4px solid #e11d48' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#e11d48', background: '#ffe4e6', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {conflict.conflictType.replace(/_/g, ' ')}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', marginTop: '0.4rem' }}>
                      {conflict.description}
                    </h3>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedConflict(conflict)}
                  >
                    Reconcile Discrepancy
                  </button>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid-2" style={{ gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Source Record 1 (#{conflict.record1.id}):
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                      {conflict.record1.title} ({conflict.record1.recordDate})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Facility: {conflict.record1.issuingFacility || 'Unknown'}
                    </div>
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#991b1b', fontWeight: 500 }}>
                      {conflict.conflictingValue1}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Source Record 2 (#{conflict.record2.id}):
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                      {conflict.record2.title} ({conflict.record2.recordDate})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Facility: {conflict.record2.issuingFacility || 'Unknown'}
                    </div>
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#991b1b', fontWeight: 500 }}>
                      {conflict.conflictingValue2}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Conflicts History */}
      {resolved.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#475569', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} color="#059669" /> Resolved Discrepancies ({resolved.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {resolved.map((res) => (
              <div key={res.id} className="card" style={{ opacity: 0.85 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{res.description}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#059669', background: '#d1fae5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    Resolved on {new Date(res.resolvedAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ marginTop: '0.5rem', padding: '0.65rem', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.82rem', color: '#334155' }}>
                  <strong>Clinical Reconciliation Note:</strong> {res.resolutionNotes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reconcile Modal Dialog */}
      {selectedConflict && (
        <div className="modal-backdrop" onClick={() => setSelectedConflict(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Reconcile Record Discrepancy</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedConflict(null)}>✕</button>
            </div>

            <form onSubmit={handleResolve}>
              <div className="modal-body">
                <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1rem' }}>
                  {selectedConflict.description}
                </p>

                <div className="form-group">
                  <label className="form-label">
                    Document Clinical Reconciliation Rationale *
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="e.g. Consulted with Dr. Jenkins; patient confirmed taking Metformin 500mg daily. Paper dosage of 1000mg was superseded."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '0.3rem' }}>
                    This explanation will be logged into your access and continuity history.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedConflict(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={resolving || !resolutionNotes.trim()}>
                  {resolving ? 'Recording...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConflictReviewPage;
