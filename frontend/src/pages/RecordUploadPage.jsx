import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { apiEndpoint } from '../services/api';
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, Loader2, Info } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export const RecordUploadPage = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('CONSULTATION');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [issuingFacility, setIssuingFacility] = useState('');
  const [attendingPhysician, setAttendingPhysician] = useState('');
  const [notes, setNotes] = useState('');

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedRecord, setUploadedRecord] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop().toLowerCase();
      if (!['pdf', 'jpg', 'jpeg', 'png', 'txt'].includes(ext)) {
        setError('Unsupported file type. Please upload a PDF, JPG, JPEG, PNG, or TXT file.');
        return;
      }
      if (selected.size > 25 * 1024 * 1024) {
        setError('File size exceeds 25MB maximum limit.');
        return;
      }
      setFile(selected);
      setError(null);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      formData.append('documentType', documentType);
      formData.append('recordDate', recordDate);
      if (issuingFacility) formData.append('issuingFacility', issuingFacility);
      if (attendingPhysician) formData.append('attendingPhysician', attendingPhysician);
      if (notes) formData.append('notes', notes);

      const token = localStorage.getItem('caretrail_token');
      const response = await fetch(apiEndpoint('/records/upload-patient'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const res = await response.json();
      if (!response.ok || !res.success) {
        throw new Error(res.message || 'Upload failed');
      }

      setUploadedRecord(res.data);
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '2.5rem 1.5rem' }}>
      <div className="page-header" style={{ padding: '0 0 1.5rem' }}>
        <div>
          <h1 className="page-title">Upload Medical Record</h1>
          <p className="page-subtitle">
            Upload paper certificates, prescriptions, lab reports, or discharge summaries from any provider
          </p>
        </div>
      </div>

      {uploadedRecord ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <CheckCircle2 size={32} color="#059669" />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Document Uploaded & Digitized!</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem', maxWidth: '520px', margin: '0.25rem auto 1.5rem' }}>
            The document has been securely stored with cryptographic SHA-256 integrity and processed through OCR extraction.
          </p>

          <div style={{ textAlign: 'left', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '1rem', color: '#0f172a' }}>{uploadedRecord.title}</span>
              <StatusBadge status={uploadedRecord.verificationStatus} />
            </div>

            {uploadedRecord.isFlaggedDuplicate && (
              <div className="callout-warning" style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0' }}>
                <AlertTriangle size={18} color="#d97706" />
                <span style={{ fontSize: '0.85rem' }}>
                  Suspected duplicate detected. This record has been flagged for comparison rather than deleted automatically.
                </span>
              </div>
            )}

            <div className="grid-2" style={{ fontSize: '0.85rem', gap: '0.5rem' }}>
              <div><strong>Record Date:</strong> {uploadedRecord.recordDate}</div>
              <div><strong>Facility:</strong> {uploadedRecord.issuingFacility || 'Patient Provided'}</div>
              <div><strong>Physician:</strong> {uploadedRecord.attendingPhysician || 'N/A'}</div>
              <div><strong>Type:</strong> {uploadedRecord.documentType}</div>
            </div>

            {uploadedRecord.extractedMedicalData && (
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Extracted Clinical Entities (OCR):
                </span>
                <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.2rem' }}>
                  <strong>Diagnoses:</strong> {uploadedRecord.extractedMedicalData.extractedDiagnoses || 'None detected'}
                </p>
                <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.2rem' }}>
                  <strong>Medications:</strong> {uploadedRecord.extractedMedicalData.extractedMedications || 'None detected'}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setUploadedRecord(null)}>
              Upload Another Document
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/timeline')}>
              View in Unified Timeline <ArrowRight size={16} />
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
            {/* File Drag & Drop / Selector */}
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                background: file ? '#f0fdf4' : '#f8fafc',
                cursor: 'pointer',
                marginBottom: '1.5rem',
                transition: 'all 0.15s ease'
              }}
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <input
                id="file-upload-input"
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,.jpg,.jpeg,.png,.txt"
                onChange={handleFileChange}
              />
              <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', border: '1px solid #86efac' }}>
                <Upload size={22} color="#15803d" />
              </div>
              {file ? (
                <div>
                  <p style={{ fontWeight: 600, color: '#059669', fontSize: '0.95rem' }}>{file.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for processing
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>
                    Click to select or drop a medical document
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Supports PDF, JPG, JPEG, PNG, and TXT files (Max 25MB)
                  </p>
                </div>
              )}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Document Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Outpatient Prescription or Blood Panel"
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
                  <option value="OTHER">Other Medical Certificate</option>
                </select>
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Date of Service / Certificate *</label>
                <input
                  type="date"
                  className="form-input"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issuing Facility / Clinic</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Metro Clinic or Dr. Office"
                  value={issuingFacility}
                  onChange={(e) => setIssuingFacility(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Attending Physician</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dr. Emily Davis"
                  value={attendingPhysician}
                  onChange={(e) => setAttendingPhysician(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Notes / Context</label>
              <textarea
                className="form-textarea"
                placeholder="Add any specific context, dosage notes, or symptoms discussed during this appointment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="callout-info" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Info size={18} color="#0f766e" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem', color: '#0f766e' }}>
                <strong>Trust Layer Ingestion Policy:</strong> Patient-uploaded paper certificates are registered with status <em>"Patient-uploaded — not yet verified"</em>. OCR will digitize the text, and you can review and correct extracted fields without mutating your original file.
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Digitizing document & computing SHA-256 hash...</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>Upload & Ingest Document</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RecordUploadPage;
