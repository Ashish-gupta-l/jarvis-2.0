import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DocumentViewerModal from '../components/DocumentViewerModal';
import OcrCorrectionModal from '../components/OcrCorrectionModal';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Edit3,
  FileText,
  AlertTriangle,
  Upload,
  RefreshCw,
  Clock,
  Building,
  UserCheck
} from 'lucide-react';

export const UnifiedTimelinePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [correctionRecord, setCorrectionRecord] = useState(null);
  const [correctionOpen, setCorrectionOpen] = useState(false);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      let url = '/patient/search?';
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (docTypeFilter) params.append('docType', docTypeFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(url + params.toString());
      if (res.success) {
        setRecords(res.data);
      }
    } catch (err) {
      console.error('Failed to load timeline records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [docTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTimeline();
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setDocTypeFilter('');
    setStartDate('');
    setEndDate('');
    api.get('/patient/timeline').then((res) => {
      if (res.success) setRecords(res.data);
    });
  };

  const handleCorrectionSuccess = (updatedData) => {
    fetchTimeline();
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Unified Medical Timeline</h1>
          <p className="page-subtitle">
            Consolidated, chronological view of consultations, prescriptions, labs, and discharges across healthcare providers
          </p>
        </div>

        <Link to="/upload" className="btn btn-primary">
          <Upload size={16} /> Upload New Record
        </Link>
      </div>

      {/* Filter and Search Bar (Feature 5) */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Search Keyword / Diagnosis / Rx</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="e.g. Metformin, Hypertension..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '0.8rem' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Document Type</label>
              <select
                className="form-select"
                value={docTypeFilter}
                onChange={(e) => setDocTypeFilter(e.target.value)}
              >
                <option value="">All Document Types</option>
                <option value="CONSULTATION">Consultation Record</option>
                <option value="PRESCRIPTION">Prescription</option>
                <option value="LAB_REPORT">Laboratory Report</option>
                <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                <option value="IMAGING">Medical Imaging</option>
                <option value="OTHER">Other Certificate</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <Search size={15} /> Search
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleResetSearch} title="Reset filters">
                <RefreshCw size={15} />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Chronological Timeline List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
          <p>Loading chronological medical timeline...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
          <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>No Records Match Your Filter</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>Try clearing your search query or date ranges.</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={handleResetSearch}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="timeline-list">
          {records.map((rec) => {
            const ext = rec.extractedMedicalData || {};
            return (
              <div key={rec.id} className="timeline-item">
                <div className="timeline-marker">
                  <Calendar size={13} color="#0284c7" />
                </div>

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {rec.recordDate}
                        </span>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a' }}>
                          {rec.title}
                        </h3>
                        {rec.isFlaggedDuplicate && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#fef3c7', color: '#d97706', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertTriangle size={12} /> Suspected Duplicate
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Building size={14} /> {rec.issuingFacility || 'Unknown Healthcare Facility'}
                        </span>
                        {rec.attendingPhysician && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <UserCheck size={14} /> {rec.attendingPhysician}
                          </span>
                        )}
                        <span>• Type: <strong>{rec.documentType}</strong></span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <StatusBadge status={rec.verificationStatus} />
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedRecord(rec);
                          setViewerOpen(true);
                        }}
                      >
                        <Eye size={14} /> View Original
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setCorrectionRecord(rec);
                          setCorrectionOpen(true);
                        }}
                      >
                        <Edit3 size={14} /> Review OCR
                      </button>
                    </div>
                  </div>

                  {/* Clinical Extraction Details */}
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9', marginTop: '0.75rem' }}>
                    {ext.extractedDiagnoses && (
                      <div style={{ marginBottom: '0.4rem', fontSize: '0.88rem' }}>
                        <strong style={{ color: '#334155' }}>Diagnoses: </strong>
                        <span style={{ color: '#0f172a' }}>{ext.extractedDiagnoses}</span>
                      </div>
                    )}
                    {ext.extractedMedications && (
                      <div style={{ marginBottom: '0.4rem', fontSize: '0.88rem' }}>
                        <strong style={{ color: '#334155' }}>Medications: </strong>
                        <span style={{ color: '#0f766e', fontWeight: 500 }}>{ext.extractedMedications}</span>
                      </div>
                    )}
                    {ext.extractedLabValues && (
                      <div style={{ marginBottom: '0.4rem', fontSize: '0.88rem' }}>
                        <strong style={{ color: '#334155' }}>Key Findings / Labs: </strong>
                        <span style={{ color: '#4338ca' }}>{ext.extractedLabValues}</span>
                      </div>
                    )}
                    {rec.notes && (
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        "{rec.notes}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Original Document Viewer Modal */}
      <DocumentViewerModal
        record={selectedRecord}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />

      {/* OCR Correction Modal */}
      <OcrCorrectionModal
        record={correctionRecord}
        isOpen={correctionOpen}
        onClose={() => setCorrectionOpen(false)}
        onSaveSuccess={handleCorrectionSuccess}
      />
    </div>
  );
};

export default UnifiedTimelinePage;
