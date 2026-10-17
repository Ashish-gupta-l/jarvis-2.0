import React, { useState, useEffect } from 'react';
import { X, FileText, Download, ShieldAlert, Loader2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { apiEndpoint } from '../services/api';

export const DocumentViewerModal = ({ record, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [contentUrl, setContentUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !record) {
      if (contentUrl) URL.revokeObjectURL(contentUrl);
      setContentUrl(null);
      setTextContent(null);
      setError(null);
      return;
    }

    const fetchDocument = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('caretrail_token');
        const response = await fetch(apiEndpoint(`/records/${record.id}/document`), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Access denied or document could not be loaded');
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/plain')) {
          const text = await response.text();
          setTextContent(text);
        } else {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setContentUrl(url);
        }
      } catch (err) {
        setError(err.message || 'Failed to stream original document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();

    return () => {
      if (contentUrl) URL.revokeObjectURL(contentUrl);
    };
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText className="text-primary" size={20} color="#15803d" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{record.title}</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
              Original File: {record.documentMetadata?.originalFileName || 'clinical_record'} • Date: {record.recordDate} • Facility: {record.issuingFacility || 'Unknown'}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#475569' }}>Trust Status:</span>
              <StatusBadge status={record.verificationStatus} />
            </div>
            {record.documentMetadata?.sha256Hash && (
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                SHA-256: {record.documentMetadata.sha256Hash.substring(0, 16)}...
              </span>
            )}
          </div>

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem' }}>
              <Loader2 size={32} className="spin" color="#15803d" />
              <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>Verifying permissions and streaming original file...</p>
            </div>
          )}

          {error && (
            <div className="callout-conflict" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <ShieldAlert size={20} color="#e11d48" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#9f1239' }}>Document Access Restricted</strong>
                <p style={{ fontSize: '0.85rem', color: '#e11d48', marginTop: '0.2rem' }}>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && textContent && (
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1, overflowY: 'auto' }}>
              <pre style={{ fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', color: '#1e293b' }}>
                {textContent}
              </pre>
            </div>
          )}

          {!loading && !error && contentUrl && (
            <div style={{ flex: 1, minHeight: '450px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <iframe
                src={contentUrl}
                title="Medical Document Preview"
                style={{ width: '100%', height: '100%', minHeight: '450px', border: 'none' }}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginRight: 'auto' }}>
            🔒 Access logged for compliance • Protected by CareTrail Trust Layer
          </p>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
