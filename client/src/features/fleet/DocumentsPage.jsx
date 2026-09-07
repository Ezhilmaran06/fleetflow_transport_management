import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Search, Filter, Download, Trash2, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import DocumentUploadModal from './DocumentUploadModal';
import { useToast } from '../../context/ToastContext';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerTypeFilter, setOwnerTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState({ total: 0, totalPages: 1 });

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showToast } = useToast();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/documents', {
        params: {
          ownerType: ownerTypeFilter,
          status: statusFilter,
          page,
          limit: 10
        }
      });
      setDocuments(res.data);
      setMetadata(res.metadata || { total: res.data.length, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [ownerTypeFilter, statusFilter, page]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async () => {
    if (!deletingDoc) return;
    setDeleteLoading(true);
    try {
      await axiosClient.delete(`/documents/${deletingDoc._id}`);
      showToast('Document deleted successfully', 'success');
      setDeletingDoc(null);
      fetchDocuments();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <FileText size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Document Center & Compliance Vault</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Track vehicle registrations, insurance policies, permits, and driver commercial licenses
          </span>
        </div>

        <button className="ff-btn ff-btn-primary" onClick={() => setIsUploadOpen(true)}>
          <Plus size={16} /> Upload Document
        </button>
      </div>

      {/* Filter Bar */}
      <div className="ff-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <select
              className="ff-form-control"
              value={ownerTypeFilter}
              onChange={(e) => {
                setOwnerTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Categories (Vehicles, Drivers, Company)</option>
              <option value="VEHICLE">Vehicles Only</option>
              <option value="DRIVER">Drivers Only</option>
              <option value="COMPANY">Company Only</option>
            </select>
          </div>

          <div className="col-12 col-md-4">
            <select
              className="ff-form-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Validity Statuses</option>
              <option value="VALID">Valid</option>
              <option value="EXPIRING">Expiring Within 30 Days</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <div className="col-12 col-md-3 d-flex justify-content-end">
            <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={fetchDocuments}>
              Refresh Vault
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : documents.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={FileText}
            title="No Documents Found"
            description="Upload insurance policies, registration certs, or operator licenses to automatically monitor expiry dates."
            actionLabel="Upload Document"
            onAction={() => setIsUploadOpen(true)}
          />
        </div>
      ) : (
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Category</th>
                <th>Document Type</th>
                <th>Document / Policy #</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc._id}>
                  <td style={{ fontWeight: 600 }}>{doc.title}</td>
                  <td>
                    <span className="ff-badge ff-badge-secondary">{doc.ownerType}</span>
                  </td>
                  <td>{doc.documentType.replace(/_/g, ' ')}</td>
                  <td>{doc.documentNumber || 'N/A'}</td>
                  <td style={{ fontWeight: 500 }}>{new Date(doc.expiryDate).toLocaleDateString()}</td>
                  <td>
                    <StatusBadge status={doc.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="d-inline-flex gap-1">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ff-btn ff-btn-outline ff-btn-sm"
                        title="View File"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        className="ff-btn ff-btn-outline ff-btn-sm text-danger"
                        onClick={() => setDeletingDoc(doc)}
                        title="Delete Document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={fetchDocuments}
      />

      <ConfirmModal
        isOpen={!!deletingDoc}
        title="Confirm Document Removal"
        message={`Are you sure you want to remove '${deletingDoc?.title}'? This will permanently delete the compliance file.`}
        confirmText="Delete Document"
        isDanger={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingDoc(null)}
      />
    </div>
  );
};

export default DocumentsPage;
