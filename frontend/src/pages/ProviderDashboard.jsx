import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Stethoscope,
  Users,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Eye,
  ArrowRight,
  Building
} from 'lucide-react';

export const ProviderDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderData = async () => {
      setLoading(true);
      try {
        const [profileRes, patientsRes, permRes] = await Promise.all([
          api.get('/providers/my-profile'),
          api.get('/providers/authorized-patients'),
          api.get('/sharing/provider-permissions')
        ]);

        if (profileRes.success) setProfile(profileRes.data);
        if (patientsRes.success) setPatients(patientsRes.data);
        if (permRes.success) setPermissions(permRes.data);
      } catch (err) {
        console.error('Failed to load provider data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  const activePerms = permissions.filter((p) => p.isActive && new Date(p.expiresAt) > new Date());

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div className="page-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-title">{profile?.institutionName || 'Healthcare Provider Portal'}</h1>
            <span style={{ background: '#ccfbf1', color: '#0f766e', fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
              {profile?.verificationStatus === 'VERIFIED' ? 'Verified Institutional Provider' : 'Pending Administrative Review'}
            </span>
          </div>
          <p className="page-subtitle">
            Attending Clinician: <strong style={{ color: '#0f172a' }}>{user?.fullName}</strong> • Department: {profile?.department || 'General Medicine'} • License: {profile?.licenseNumber}
          </p>
        </div>

        <Link to="/provider/upload" className="btn btn-primary">
          <Upload size={16} /> Upload Clinical Record
        </Link>
      </div>

      {/* KPI stats */}
      <div className="grid-3" style={{ margin: '1.5rem 0 2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Consenting Patients</span>
            <Users size={18} color="#0f766e" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.4rem' }}>
            {patients.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#059669', marginTop: '0.2rem', display: 'block' }}>
            Patients with granted consent
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Active Consent Grants</span>
            <ShieldCheck size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0284c7', marginTop: '0.4rem' }}>
            {activePerms.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
            Unexpired authorized sessions
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Provider Verification</span>
            <Building size={18} color="#4f46e5" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: profile?.verificationStatus === 'VERIFIED' ? '#059669' : '#d97706', marginTop: '0.6rem' }}>
            {profile?.verificationStatus || 'PENDING'}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
            State Medical Board Registry
          </span>
        </div>
      </div>

      {/* Authorized Patients List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Users size={18} color="#0f766e" /> Patients with Granted Consent
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Access strictly governed by active patient authorization
          </span>
        </div>

        {loading ? (
          <p style={{ color: '#64748b', padding: '1.5rem 0' }}>Loading authorized patients...</p>
        ) : patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <Users size={32} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>No Patient Consents Granted Yet</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', maxWidth: '420px', margin: '0.25rem auto 1rem' }}>
              Patients must authorize your facility through their CareTrail portal before their unified medical history or Continuity Brief can be accessed.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {patients.map((patient) => {
              const patientPerms = activePerms.filter((p) => p.patient?.id === patient.id);
              return (
                <div
                  key={patient.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{patient.fullName}</strong>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', background: '#e2e8f0', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        ID #{patient.id}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Email: {patient.email} • Phone: {patient.phoneNumber || 'N/A'}
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {patientPerms.map((p) => (
                        <span key={p.id} style={{ fontSize: '0.72rem', background: '#d1fae5', color: '#059669', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                          ✓ {p.shareScope.replace(/_/g, ' ')} (Expires {new Date(p.expiresAt).toLocaleDateString()})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Link
                      to={`/continuity-brief?patientId=${patient.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      <FileSpreadsheet size={14} /> Open Continuity Brief
                    </Link>

                    <Link
                      to={`/provider/upload?patientId=${patient.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <Upload size={14} /> Upload Clinical Record
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
