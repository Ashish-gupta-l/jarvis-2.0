import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('session_expired');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await login(username, password);
      if (data.role === 'ROLE_PATIENT') navigate('/dashboard');
      else if (data.role === 'ROLE_PROVIDER') navigate('/provider');
      else if (data.role === 'ROLE_ADMIN') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const setDemoCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="container" style={{ maxWidth: '460px', padding: '4rem 1.5rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', border: '1px solid #86efac' }}>
            <LogIn size={24} color="#15803d" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Sign In to CareTrail</h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.25rem' }}>
            Access your unified clinical continuity portal
          </p>
        </div>

        {sessionExpired && (
          <div className="callout-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertCircle size={16} color="#d97706" />
            <span style={{ fontSize: '0.85rem' }}>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="callout-conflict" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertCircle size={16} color="#e11d48" />
            <span style={{ fontSize: '0.85rem', color: '#e11d48' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '0.75rem' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '0.75rem' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
            Quick Demo Autofill:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setDemoCredentials('john_patient', 'Password123!')}
            >
              Patient (John)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setDemoCredentials('dr_sarah', 'DoctorPass123!')}
            >
              Doctor (Dr. Sarah)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setDemoCredentials('admin', 'AdminPass123!')}
            >
              Admin
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#15803d', fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
