import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('ROLE_PATIENT');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    // Patient fields
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    nationalHealthId: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    knownAllergies: '',
    chronicConditions: '',
    // Provider fields
    institutionName: '',
    department: '',
    licenseNumber: '',
    specialization: '',
    officeAddress: ''
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = { ...formData, role };
      const data = await register(payload);
      if (data.role === 'ROLE_PATIENT') navigate('/dashboard');
      else if (data.role === 'ROLE_PROVIDER') navigate('/provider');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '680px', padding: '3.5rem 1.5rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
            <UserPlus size={24} color="#0f766e" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>Create CareTrail Account</h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
            Join the Intelligent Healthcare Continuity Platform
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '8px' }}>
          <button
            type="button"
            className={`btn ${role === 'ROLE_PATIENT' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '6px' }}
            onClick={() => setRole('ROLE_PATIENT')}
          >
            <User size={16} /> Patient Account
          </button>
          <button
            type="button"
            className={`btn ${role === 'ROLE_PROVIDER' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '6px' }}
            onClick={() => setRole('ROLE_PROVIDER')}
          >
            <Stethoscope size={16} /> Healthcare Provider
          </button>
        </div>

        {error && (
          <div className="callout-conflict" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={16} color="#e11d48" />
            <span style={{ fontSize: '0.85rem', color: '#e11d48' }}>{error}</span>
          </div>
        )}

        {role === 'ROLE_PROVIDER' && (
          <div className="callout-info" style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Provider Onboarding Verification Workflow:</span>
            <p style={{ fontSize: '0.82rem', color: '#0f766e' }}>
              Provider accounts undergo administrative credential verification before full clinical authorization is activated. You can explore the provider dashboard in preview mode immediately.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                placeholder={role === 'ROLE_PATIENT' ? 'e.g. Jane Doe' : 'e.g. Dr. Arthur Miller, MD'}
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="Choose username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="email@example.org"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              className="form-input"
              placeholder="+1 (555) 000-0000"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          {/* Patient Details */}
          {role === 'ROLE_PATIENT' && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                Patient Health Profile
              </h4>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select name="bloodGroup" className="form-select" value={formData.bloodGroup} onChange={handleChange}>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">National Health ID (Optional)</label>
                <input
                  type="text"
                  name="nationalHealthId"
                  className="form-input"
                  placeholder="e.g. CT-PID-100452 (Auto-generated if left blank)"
                  value={formData.nationalHealthId}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Known Allergies</label>
                <input
                  type="text"
                  name="knownAllergies"
                  className="form-input"
                  placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                  value={formData.knownAllergies}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chronic Conditions</label>
                <input
                  type="text"
                  name="chronicConditions"
                  className="form-input"
                  placeholder="e.g. Hypertension, Asthma"
                  value={formData.chronicConditions}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Provider Details */}
          {role === 'ROLE_PROVIDER' && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                Healthcare Facility & Professional Credentials
              </h4>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Hospital / Institution Name *</label>
                  <input
                    type="text"
                    name="institutionName"
                    className="form-input"
                    placeholder="e.g. St. Jude Regional Medical Center"
                    value={formData.institutionName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Medical License Number *</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    className="form-input"
                    placeholder="e.g. MD-CARDIO-88492"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    name="department"
                    className="form-input"
                    placeholder="e.g. Cardiology, Pathology"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Clinical Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    className="form-input"
                    placeholder="e.g. Interventional Cardiology"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Office Address</label>
                <input
                  type="text"
                  name="officeAddress"
                  className="form-input"
                  placeholder="Street address, Suite, City"
                  value={formData.officeAddress}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '1.5rem' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#15803d', fontWeight: 600 }}>
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
