import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Upload, CheckCircle2, AlertTriangle, ArrowRight, Loader2, Info } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export const ProviderUploadPage = () => {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(useLocation().search);
  const initialPatientId = queryParams.get('patientId') || '';

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('CONSULTATION');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedRecord, setUploadedRecord] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/providers/authorized-patients');
        if (res.success && res.data.length > 0) {
          setPatients(res.data);
          if (!selectedPatientId) setSelectedPatientId(res.data[0].id);
        } else {
          // If no authorized patients, fetch all patients for prototype demonstration convenience
          const allRes = await api.get('/providers/all-patients');
          if (allRes.success && allRes.data.length > 0) {
            setPatients(allRes.data);
            if (!selectedPatientId) setSelectedPatientId(allRes.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load patient options:', err);
      }
    };

    fetchPatients();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedPatientId) {
      setError('Please select both a patient and a document file.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', selectedPatientId);
      if (title) formData.append('title', title);
      formData.append('documentType', documentType);
      formData.append('recordDate', recordDate);
      if (notes) formData.append('notes', notes);

      const token = localStorage.getItem('caretrail_token');
      const response = await fetch('/api/records/upload-provider', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const res = await response.json();
      if (!response.ok || !res.success) {
        throw new Error(res.message || 'Provider upload failed');
      }

      setUploadedRecord(res.data);
    } catch (err) {
      setError(err.message || 'Failed to upload provider record');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '2.5rem 1.5rem' }}>
      <div className="page-header" style={{ padding: '0 0 1.5rem' }}>
        <div>
          <h1 className="page-title">Provider Clinical Record Upload</h1>
          <p className="page-subtitle">
            Direct institutional upload for consultations, prescriptions, and lab panels (Auto-stamped as Issuer-Confirmed)
          </p>
        </div>
      </div>

      {uploadedRecord ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <CheckCircle2 size={32} color="#059669" />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Clinical Record Ingested Successfully!</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem', maxWidth: '520px', margin: '0.25rem auto 1.5rem' }}>
            The record has been stored and registered with status <strong>Issuer-Confirmed</strong>.
          </p>

          <div style={{ textAlign: 'left', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '1rem', color: '#0f172a' }}>{uploadedRecord.title}</span>
              <StatusBadge status={uploadedRecord.verificationStatus} />
            </div>

            <div className="grid-2" style={{ fontSize: '0.85rem', gap: '0.5rem' }}>
              <div><strong>Patient ID:</strong> #{uploadedRecord.patient?.id} ({uploadedRecord.patient?.fullName})</div>
              <div><strong>Issuing Facility:</strong> {uploadedRecord.issuingFacility}</div>
              <div><strong>Record Date:</strong> {uploadedRecord.recordDate}</div>
              <div><strong>Type:</strong> {uploadedRecord.documentType}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setUploadedRecord(null)}>
              Upload Another Record
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/provider')}>
              Back to Provider Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div className="callout-conflict" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <AlertTriangle size={18} color="#e11d48" />
              <span style={{ fontSize: '0.85rem', color: '#e11d48' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Target Patient *</label>
              <select
                className="form-select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} — {p.fullName} ({p.email})
                  </option>
                ))}
              </select>
            </div>

            {/* File Drag/Drop */}
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                background: file ? '#f0fdf4' : '#f8fafc',
                cursor: 'pointer',
                marginBottom: '1.5rem'
              }}
              onClick={() => document.getElementById('provider-file-input').click()}
            >
              <input
                id="provider-file-input"
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,.jpg,.jpeg,.png,.txt"
                onChange={handleFileChange}
              />
              <Upload size={22} color="#0f766e" style={{ margin: '0 auto 0.5rem' }} />
              {file ? (
                <div>
                  <p style={{ fontWeight: 600, color: '#059669', fontSize: '0.95rem' }}>{file.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                  Click to select laboratory report, discharge summary, or prescription file
                </p>
              )}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Record Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Outpatient Follow-up or Fasting Blood Panel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Document Type *</label>
                <select
                  className="form-select"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="CONSULTATION">Consultation Record</option>
                  <option value="PRESCRIPTION">Prescription</option>
                  <option value="LAB_REPORT">Laboratory Report</option>
                  <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                  <option value="IMAGING">Medical Imaging / Radiology</option>
                  <option value="OTHER">Other Clinical Record</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Service Date *</label>
              <input
                type="date"
                className="form-input"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Notes / Directives</label>
              <textarea
                className="form-textarea"
                placeholder="Document clinical diagnosis, prescribed dosage, or lab observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="callout-info" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Info size={18} color="#0f766e" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem', color: '#0f766e' }}>
                <strong>Trust Layer Ingestion:</strong> Because this document is uploaded directly by an authenticated healthcare provider, it is automatically cataloged with status <strong>Issuer-Confirmed</strong> and cross-checked against existing medications for adverse conflicts.
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Processing and indexing clinical document...</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>Upload & Register Clinical Record</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProviderUploadPage;
