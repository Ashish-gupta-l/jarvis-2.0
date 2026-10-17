import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  ShieldCheck,
  GitMerge,
  MapPin,
  FileCheck2,
  Lock,
  ArrowRight,
  User,
  Stethoscope,
  ShieldAlert
} from 'lucide-react';

export const LandingPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (username, password, redirectPath) => {
    try {
      await login(username, password);
      navigate(redirectPath);
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(180deg, #f0fdfa 0%, #f8fafc 100%)', padding: '4.5rem 0 3.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', color: '#0369a1', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            <Activity size={14} /> Healthcare Continuity & Trust Layer Platform
          </div>

          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
            Unify Fragmented Medical Records with <span style={{ color: '#0284c7' }}>Transparent Trust</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#475569', marginTop: '1.25rem', lineHeight: 1.6 }}>
            Patients receive medical care across multiple hospitals, clinics, and labs. CareTrail consolidates fragmented records chronologically, detects discrepancies and medication conflicts, maps continuity gaps, and enables consent-based sharing with authorized providers.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
              Create Patient Account <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              Sign In to Portal
            </Link>
          </div>

          {/* Quick Demo Scenario Logins */}
          <div style={{ marginTop: '3rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚡ 1-Click Interactive Demonstration Scenarios
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flexDirection: 'column', padding: '0.85rem', alignItems: 'flex-start', textAlign: 'left' }}
                onClick={() => handleQuickLogin('john_patient', 'Password123!', '/dashboard')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#0284c7' }}>
                  <User size={16} /> John Doe (Patient)
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Unified timeline, 2 active conflicts, Gap Map, & consent sharing
                </span>
              </button>

              <button
                className="btn btn-secondary"
                style={{ flexDirection: 'column', padding: '0.85rem', alignItems: 'flex-start', textAlign: 'left' }}
                onClick={() => handleQuickLogin('dr_sarah', 'DoctorPass123!', '/provider')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#0f766e' }}>
                  <Stethoscope size={16} /> Dr. Sarah Jenkins (Provider)
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  St. Jude Regional Medical Center • Access authorized patient briefs
                </span>
              </button>

              <button
                className="btn btn-secondary"
                style={{ flexDirection: 'column', padding: '0.85rem', alignItems: 'flex-start', textAlign: 'left' }}
                onClick={() => handleQuickLogin('admin', 'AdminPass123!', '/admin')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#9f1239' }}>
                  <ShieldAlert size={16} /> Platform Administrator
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Review provider onboarding requests & system-wide security audit
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>Architectural Pillars</h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
              Built specifically for clinical reliability without making false claims about AI or paper certificates.
            </p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <ShieldCheck size={24} color="#0284c7" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Medical Document Trust Layer</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6 }}>
                Transparent verification workflow distinguishing between registered doctors, cryptographic PKI signatures, and institutional confirmation for ordinary paper records.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '8px', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <GitMerge size={24} color="#e11d48" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Record Conflict Detector</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6 }}>
                Automated rule-based detection for conflicting dosages, concurrent anticoagulants without bridging, temporal date anomalies, and mismatched patient identifiers.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '8px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <MapPin size={24} color="#0f766e" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Continuity Gap Map</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6 }}>
                Visual dashboard identifying missing post-discharge diagnostic tests, unconfirmed follow-up orders, and pending clinical reviews across providers.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FileCheck2 size={24} color="#d97706" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Source-Linked Continuity Brief</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6 }}>
                Every clinical claim links directly to its original source record with provider name, record date, and verification limitations clearly articulated.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '8px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Lock size={24} color="#4f46e5" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Granular Consent & Expiry</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6 }}>
                Patients retain sovereign control. Grant temporary, time-bound access to specific records or the brief, with instantaneous backend-enforced revocation.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Activity size={24} color="#475569" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Immutable Audit Ledger</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6 }}>
                Every view, upload, verification update, and consent grant is logged irrevocably with IP address and user-agent. Administrators cannot alter audit entries.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
