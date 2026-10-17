import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Upload,
  Calendar,
  AlertTriangle,
  MapPin,
  FileSpreadsheet,
  Share2,
  History,
  LogOut,
  UserCheck,
  Shield,
  Home
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand-logo">
          <div className="brand-badge">
            <Activity size={22} />
          </div>
          <span>CareTrail</span>
        </Link>

        <div className="nav-links">
          {!isAuthenticated ? (
            <>
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                <Home size={16} /> Home
              </Link>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === 'ROLE_PATIENT' && (
                <>
                  <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                    Dashboard
                  </Link>
                  <Link to="/timeline" className={`nav-link ${isActive('/timeline') ? 'active' : ''}`}>
                    <Calendar size={15} /> Timeline
                  </Link>
                  <Link to="/upload" className={`nav-link ${isActive('/upload') ? 'active' : ''}`}>
                    <Upload size={15} /> Upload Record
                  </Link>
                  <Link to="/gap-map" className={`nav-link ${isActive('/gap-map') ? 'active' : ''}`}>
                    <MapPin size={15} /> Gap Map
                  </Link>
                  <Link to="/continuity-brief" className={`nav-link ${isActive('/continuity-brief') ? 'active' : ''}`}>
                    <FileSpreadsheet size={15} /> Continuity Brief
                  </Link>
                  <Link to="/conflicts" className={`nav-link ${isActive('/conflicts') ? 'active' : ''}`}>
                    <AlertTriangle size={15} /> Conflicts
                  </Link>
                  <Link to="/sharing" className={`nav-link ${isActive('/sharing') ? 'active' : ''}`}>
                    <Share2 size={15} /> Sharing & Consent
                  </Link>
                  <Link to="/audit" className={`nav-link ${isActive('/audit') ? 'active' : ''}`}>
                    <History size={15} /> Access Log
                  </Link>
                </>
              )}

              {user.role === 'ROLE_PROVIDER' && (
                <>
                  <Link to="/provider" className={`nav-link ${isActive('/provider') ? 'active' : ''}`}>
                    Provider Dashboard
                  </Link>
                  <Link to="/provider/upload" className={`nav-link ${isActive('/provider/upload') ? 'active' : ''}`}>
                    <Upload size={15} /> Upload Record
                  </Link>
                </>
              )}

              {user.role === 'ROLE_ADMIN' && (
                <>
                  <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    <UserCheck size={16} /> Provider Verification
                  </Link>
                  <Link to="/admin/audit" className={`nav-link ${isActive('/admin/audit') ? 'active' : ''}`}>
                    <Shield size={16} /> Security Audit
                  </Link>
                </>
              )}

              <div className="user-pill">
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{user.fullName || user.username}</span>
                <span className={`user-role-badge ${
                  user.role === 'ROLE_PATIENT' ? 'role-patient' :
                  user.role === 'ROLE_PROVIDER' ? 'role-provider' : 'role-admin'
                }`}>
                  {user.role === 'ROLE_PATIENT' ? 'Patient' : user.role === 'ROLE_PROVIDER' ? 'Provider' : 'Admin'}
                </span>
              </div>

              <button className="btn btn-secondary btn-sm" onClick={handleLogout} title="Sign Out">
                <LogOut size={15} /> Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
