import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DocumentViewerModal from '../components/DocumentViewerModal';
import {
  Activity,
  Upload,
  Calendar,
  AlertTriangle,
  MapPin,
  FileSpreadsheet,
  Share2,
  ShieldAlert,
  Eye,
  CheckCircle,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [gapMap, setGapMap] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, timelineRes, conflictsRes, gapRes, permRes] = await Promise.all([
          api.get('/patient/profile'),
          api.get('/patient/timeline'),
          api.get('/conflicts/my-conflicts'),
          api.get('/continuity/my-gap-map'),
          api.get('/sharing/patient-permissions')
        ]);

        if (profileRes.success) setProfile(profileRes.data);
        if (timelineRes.success) setTimeline(timelineRes.data);
        if (conflictsRes.success) setConflicts(conflictsRes.data);
        if (gapRes.success) setGapMap(gapRes.data);
        if (permRes.success) setPermissions(permRes.data);
      } catch (err) {
        console.error('Failed to load patient dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const unresolvedConflicts = conflicts.filter((c) => !c.isResolved);
  const activePermissions = permissions.filter((p) => p.isActive);

  const handleViewDocument = (record) => {
    setSelectedRecord(record);
    setViewerOpen(true);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Top Banner Greeting */}
      <div className="page-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-title">Welcome back, {user?.fullName || 'Patient'}</h1>
            <span style={{ background: '#dcfce7', color: '#14532d', fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '9999px', border: '1px solid #86efac' }}>
              Patient Portal 🍃
            </span>
          </div>
          <p className="page-subtitle">
            National Health ID: <strong style={{ color: '#0f172a' }}>{profile?.nationalHealthId || 'CT-PID-100452'}</strong> • Blood Group: <strong style={{ color: '#0f172a' }}>{profile?.bloodGroup || 'O+'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/upload" className="btn btn-primary">
            <Upload size={16} /> Upload New Document
          </Link>
          <Link to="/continuity-brief" className="btn btn-secondary">
            <FileSpreadsheet size={16} /> Continuity Brief
          </Link>
        </div>
      </div>

      {/* Critical Conflict Callout if any */}
      {unresolvedConflicts.length > 0 && (
        <div className="callout-conflict" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertTriangle size={24} color="#e11d48" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#9f1239' }}>
                {unresolvedConflicts.length} Clinical Record Conflict(s) Detected
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#e11d48', marginTop: '0.2rem' }}>
                Rule-based analysis discovered medication discrepancies between your healthcare providers. Review conflicting values and share with your attending physician.
              </p>
            </div>
          </div>
          <Link to="/conflicts" className="btn btn-danger btn-sm">
            Review Discrepancies <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid-4" style={{ margin: '1.5rem 0 2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Consolidated Records</span>
            <FileText size={18} color="#15803d" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.4rem' }}>
            {timeline.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '0.2rem', display: 'block' }}>
            Unified across all providers
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Record Conflicts</span>
            <AlertTriangle size={18} color="#e11d48" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: unresolvedConflicts.length > 0 ? '#e11d48' : '#059669', marginTop: '0.4rem' }}>
            {unresolvedConflicts.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
            {unresolvedConflicts.length > 0 ? 'Requires clinical review' : 'All reconciled'}
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Continuity Gaps</span>
            <MapPin size={18} color="#0f766e" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f766e', marginTop: '0.4rem' }}>
            {gapMap?.totalGapsCount || 0}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
            Missing docs & follow-ups
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Active Sharing</span>
            <Share2 size={18} color="#4f46e5" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#4f46e5', marginTop: '0.4rem' }}>
            {activePermissions.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
            Authorized provider consents
          </span>
        </div>
      </div>

      {/* Two Column Layout: Recent Records & Health Profile */}
      <div className="grid-2">
        {/* Recent Timeline Snippet */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={18} color="#15803d" /> Recent Medical Records
            </h3>
            <Link to="/timeline" style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              Full Timeline <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <p style={{ color: '#64748b', padding: '1rem 0' }}>Loading records...</p>
          ) : timeline.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
              <p>No medical documents uploaded yet.</p>
              <Link to="/upload" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Upload Your First Document
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {timeline.slice(0, 4).map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}>{rec.title}</h4>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                      {rec.recordDate} • {rec.issuingFacility || 'Unknown Facility'}
                    </p>
                    <div style={{ marginTop: '0.35rem' }}>
                      <StatusBadge status={rec.verificationStatus} />
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleViewDocument(rec)}
                  >
                    <Eye size={14} /> View File
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patient Clinical Profile & Allergies */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Activity size={18} color="#0f766e" /> Clinical Profile & Vitals
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#ccfbf1', color: '#0f766e', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              Sovereign Patient ID
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9f1239', textTransform: 'uppercase' }}>
                ⚠️ Documented Allergies:
              </span>
              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e11d48', marginTop: '0.2rem' }}>
                {profile?.knownAllergies || 'No severe allergies reported'}
              </p>
            </div>

            <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Chronic Conditions:
              </span>
              <p style={{ fontSize: '0.88rem', color: '#1e293b', marginTop: '0.2rem' }}>
                {profile?.chronicConditions || 'None registered'}
              </p>
            </div>

            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Emergency Contact:</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                  {profile?.emergencyContactName || 'Mary Doe (Spouse)'}
                </p>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {profile?.emergencyContactPhone || '+1 (555) 234-5679'}
                </p>
              </div>

              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Date of Birth & Gender:</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                  {profile?.dateOfBirth ? profile.dateOfBirth : '1982-05-14'} ({profile?.gender || 'Male'})
                </p>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
              <Link to="/gap-map" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                <MapPin size={14} /> View Continuity Gaps
              </Link>
              <Link to="/sharing" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                <Share2 size={14} /> Manage Provider Sharing
              </Link>
            </div>
          </div>
        </div>
      </div>

      <DocumentViewerModal
        record={selectedRecord}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
};

export default PatientDashboard;
