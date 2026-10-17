import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import RecordUploadPage from './pages/RecordUploadPage';
import UnifiedTimelinePage from './pages/UnifiedTimelinePage';
import VerificationStatusPage from './pages/VerificationStatusPage';
import ConflictReviewPage from './pages/ConflictReviewPage';
import ContinuityGapMapPage from './pages/ContinuityGapMapPage';
import ContinuityBriefPage from './pages/ContinuityBriefPage';
import SharingPermissionsPage from './pages/SharingPermissionsPage';
import AccessAuditHistoryPage from './pages/AccessAuditHistoryPage';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderUploadPage from './pages/ProviderUploadPage';
import AdminVerificationPage from './pages/AdminVerificationPage';
import AiAssistantPage from './pages/AiAssistantPage';
import ChatbotWidget from './components/ChatbotWidget';

import './App.css';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ROLE_PATIENT') return <Navigate to="/dashboard" replace />;
    if (user.role === 'ROLE_PROVIDER') return <Navigate to="/provider" replace />;
    if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/ai-assistant" element={<AiAssistantPage />} />

              {/* Patient Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
                    <RecordUploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timeline"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_PATIENT', 'ROLE_PROVIDER']}>
                    <UnifiedTimelinePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/verification"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_PATIENT', 'ROLE_PROVIDER', 'ROLE_ADMIN']}>
                    <VerificationStatusPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/conflicts"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_PATIENT', 'ROLE_PROVIDER']}>
                    <ConflictReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gap-map"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_PATIENT', 'ROLE_PROVIDER']}>
                    <ContinuityGapMapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/continuity-brief"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_PATIENT', 'ROLE_PROVIDER']}>
                    <ContinuityBriefPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sharing"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
                    <SharingPermissionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_PATIENT', 'ROLE_ADMIN']}>
                    <AccessAuditHistoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Provider Routes */}
              <Route
                path="/provider"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_PROVIDER']}>
                    <ProviderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/upload"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_PROVIDER']}>
                    <ProviderUploadPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminVerificationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminVerificationPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ChatbotWidget />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
