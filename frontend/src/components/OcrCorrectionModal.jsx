import React, { useState } from 'react';
import { X, Edit3, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const OcrCorrectionModal = ({ record, isOpen, onClose, onSaveSuccess }) => {
  if (!isOpen || !record) return null;

  const ext = record.extractedMedicalData || {};

  const [formData, setFormData] = useState({
    correctedTitle: record.title || '',
    correctedDate: record.recordDate || '',
    correctedProviderName: ext.extractedProviderName || record.attendingPhysician || '',
    correctedFacilityName: ext.extractedFacilityName || record.issuingFacility || '',
    correctedDiagnoses: ext.extractedDiagnoses || '',
    correctedMedications: ext.extractedMedications || '',
    correctedLabValues: ext.extractedLabValues || '',
    userNotes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.put(`/patient/records/${record.id}/correct-ocr`, formData);
      if (res.success) {
        onSaveSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit OCR corrections');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={20} color="#15803d" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Review & Correct Extracted Information</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Note: Corrections refine clinical index entries without modifying the original uploaded certificate.
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            {error && (
              <div className="callout-conflict" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <AlertCircle size={18} color="#e11d48" />
                <span style={{ fontSize: '0.85rem', color: '#e11d48' }}>{error}</span>
              </div>
            )}

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Original OCR Confidence:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669', marginLeft: '0.5rem' }}>
                {Math.round((ext.ocrConfidenceScore || 0.9) * 100)}%
              </span>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Record Title</label>
                <input
                  type="text"
                  name="correctedTitle"
                  className="form-input"
                  value={formData.correctedTitle}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Record Date</label>
                <input
                  type="date"
                  name="correctedDate"
                  className="form-input"
                  value={formData.correctedDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Attending Physician / Provider</label>
                <input
                  type="text"
                  name="correctedProviderName"
                  className="form-input"
                  value={formData.correctedProviderName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issuing Facility / Hospital</label>
                <input
                  type="text"
                  name="correctedFacilityName"
                  className="form-input"
                  value={formData.correctedFacilityName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Diagnoses (As Written / Verified)</label>
              <textarea
                name="correctedDiagnoses"
                className="form-textarea"
                value={formData.correctedDiagnoses}
                onChange={handleChange}
                placeholder="e.g. Essential Hypertension; Type 2 Diabetes"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Medications & Regimen</label>
              <textarea
                name="correctedMedications"
                className="form-textarea"
                value={formData.correctedMedications}
                onChange={handleChange}
                placeholder="e.g. Metformin 500mg daily; Lisinopril 10mg daily"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Laboratory Findings & Values</label>
              <textarea
                name="correctedLabValues"
                className="form-textarea"
                value={formData.correctedLabValues}
                onChange={handleChange}
                placeholder="e.g. HbA1c: 6.8%; Fasting Glucose: 126 mg/dL"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correction Rationale / Verification Notes</label>
              <input
                type="text"
                name="userNotes"
                className="form-input"
                value={formData.userNotes}
                onChange={handleChange}
                placeholder="e.g. Fixed physician name typo from paper scan"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Check size={16} />
              {submitting ? 'Saving...' : 'Save & Verify Annotations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OcrCorrectionModal;
