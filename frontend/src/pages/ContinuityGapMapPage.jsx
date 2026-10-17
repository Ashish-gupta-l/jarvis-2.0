import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  MapPin,
  AlertCircle,
  FileQuestion,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Info,
  CheckSquare
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export const ContinuityGapMapPage = () => {
  const [gapMap, setGapMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const fetchGapMap = async () => {
    setLoading(true);
    try {
      const res = await api.get('/continuity/my-gap-map');
      if (res.success) {
        setGapMap(res.data);
      }
    } catch (err) {
      console.error('Failed to load Continuity Gap Map:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGapMap();
  }, []);

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    try {
      const res = await api.patch(`/continuity/follow-ups/${taskId}/status?status=${newStatus}&notes=${encodeURIComponent('Updated via Continuity Gap Map portal')}`);
      if (res.success) {
        fetchGapMap();
      }
    } catch (err) {
      alert('Failed to update task: ' + err.message);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Continuity Gap Map</h1>
          <p className="page-subtitle">
            Proactive mapping of missing diagnostic tests, unconfirmed follow-up orders, and unverified records across care episodes
          </p>
        </div>

        <Link to="/continuity-brief" className="btn btn-secondary">
          View Continuity Brief <ArrowRight size={16} />
        </Link>
      </div>

      {/* Critical Continuity Notice (Feature 12) */}
      <div className="callout-info" style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <Info size={22} color="#0f766e" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <div style={{ fontSize: '0.88rem', color: '#0f766e', lineHeight: 1.5 }}>
          <strong>Continuity Assessment Principle:</strong> A missing document or unconfirmed task in CareTrail highlights an information gap in the consolidated record; it does not constitute clinical proof that treatment, tests, or medication was omitted. CareTrail tracks documented evidence without generating autonomous medical diagnoses.
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
          <p>Compiling cross-institutional Continuity Gap Map...</p>
        </div>
      ) : !gapMap ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          <p>No continuity data available.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top Summary Bar */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Detected Continuity Gaps
                </span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
                  {gapMap.totalGapsCount}
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Identified across hospital discharges, outpatient consultations, and pharmacy records
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f87171' }}>
                    {gapMap.missingSupportingDocs?.length || 0}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Missing Tests</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>
                    {gapMap.unconfirmedFollowUps?.length || 0}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Unconfirmed Follow-ups</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>
                    {gapMap.unverifiedRecords?.length || 0}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Unverified Records</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Missing Supporting Documents */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <FileQuestion size={18} color="#e11d48" /> Missing Supporting Documents & Tests
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Post-care diagnostics</span>
            </div>

            {gapMap.missingSupportingDocs?.length === 0 ? (
              <p style={{ color: '#059669', fontSize: '0.88rem' }}>✓ No missing supporting documents detected.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {gapMap.missingSupportingDocs.map((item, idx) => (
                  <div key={idx} style={{ background: '#fff1f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#9f1239' }}>{item.title}</strong>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#e11d48', color: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {item.severity} PRIORITY
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>
                      {item.explanation}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                      {item.disclaimer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Follow-Up Tracker (Feature 13) */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Clock size={18} color="#0f766e" /> Follow-Up Instruction Tracker
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Documented clinician orders</span>
            </div>

            {gapMap.unconfirmedFollowUps?.length === 0 ? (
              <p style={{ color: '#059669', fontSize: '0.88rem' }}>✓ All documented follow-up tasks confirmed complete.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {gapMap.unconfirmedFollowUps.map((task) => (
                  <div key={task.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{task.taskDescription}</strong>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                          Due Date: <strong>{task.dueDate}</strong> • Source: Record #{task.sourceRecord?.id} ({task.sourceRecord?.title})
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '4px', background: task.status === 'COMPLETED' ? '#d1fae5' : '#fef3c7', color: task.status === 'COMPLETED' ? '#059669' : '#d97706' }}>
                          {task.status}
                        </span>

                        <button
                          className="btn btn-success btn-sm"
                          disabled={updatingTaskId === task.id}
                          onClick={() => handleUpdateTaskStatus(task.id, 'COMPLETED')}
                        >
                          <CheckSquare size={14} /> Mark Completed
                        </button>
                      </div>
                    </div>

                    {task.completionNotes && (
                      <p style={{ fontSize: '0.8rem', color: '#475569', background: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', marginTop: '0.4rem' }}>
                        Notes: {task.completionNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Records Pending Institutional Verification or Patient Review */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <ShieldAlert size={18} color="#0284c7" /> Records Needing Verification or Patient Review
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Trust Layer Review</span>
            </div>

            {gapMap.unverifiedRecords?.length === 0 ? (
              <p style={{ color: '#059669', fontSize: '0.88rem' }}>✓ All records are verified by issuing institutions.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {gapMap.unverifiedRecords.map((rec) => (
                  <div key={rec.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{rec.title}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '0.5rem' }}>({rec.recordDate} • {rec.issuingFacility || 'Unknown'})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <StatusBadge status={rec.verificationStatus} />
                      <Link to="/verification" className="btn btn-secondary btn-sm">
                        Inspect Trust Evidence
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContinuityGapMapPage;
