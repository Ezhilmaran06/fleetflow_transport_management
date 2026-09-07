import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FileSpreadsheet, 
  Play, 
  Trash2, 
  Plus, 
  Calendar, 
  Tag, 
  Download 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function SavedReportsPage() {
  const { showSuccess, showError } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [runningReportId, setRunningReportId] = useState(null);

  useEffect(() => {
    fetchSavedReports();
  }, []);

  const fetchSavedReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reports/saved');
      setReports(res.data.data || []);
    } catch (err) {
      console.error('Error loading saved reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunReport = async (report) => {
    setRunningReportId(report._id);
    try {
      const res = await axios.post('/api/reports/generate', {
        module: report.module,
        filters: report.filters || {},
        format: 'CSV'
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccess(`Report "${report.name}" executed and downloaded`);
    } catch (err) {
      showError('Failed to execute and download report');
    } finally {
      setRunningReportId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/reports/saved/${deleteTarget._id}`);
      showSuccess('Saved report template removed');
      setReports(reports.filter(r => r._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete saved report');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Saved Reports & Templates</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Run pre-configured operational queries and generate standardized data exports.
          </p>
        </div>
        <Link to="/reports/builder" className="btn btn-primary">
          <Plus size={16} /> New Report Query
        </Link>
      </div>

      {/* Reports List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <SkeletonLoader count={4} height={52} />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState 
            icon={FileSpreadsheet} 
            title="No Saved Reports" 
            message="You haven't saved any custom report templates yet. Go to Report Builder to create and save one."
            actionText="Create Report Query"
            actionLink="/reports/builder"
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Module</th>
                  <th>Filters Applied</th>
                  <th>Created By</th>
                  <th>Date Saved</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{report.name}</div>
                      {report.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.description}</div>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', fontWeight: 600 }}>
                        {report.module}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {report.filters?.status && report.filters.status !== 'ALL' && (
                          <span style={{ marginRight: '0.5rem' }}>Status: {report.filters.status}</span>
                        )}
                        {report.filters?.startDate && (
                          <span>From: {report.filters.startDate}</span>
                        )}
                        {!report.filters?.status && !report.filters?.startDate && (
                          <span style={{ color: 'var(--text-muted)' }}>All records</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {report.createdBy ? `${report.createdBy.firstName || ''} ${report.createdBy.lastName || ''}`.trim() : 'System'}
                    </td>
                    <td>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
                          onClick={() => handleRunReport(report)}
                          disabled={runningReportId === report._id}
                        >
                          <Download size={14} /> {runningReportId === report._id ? 'Exporting...' : 'Run CSV'}
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.65rem', color: '#EF4444' }}
                          onClick={() => setDeleteTarget(report)}
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
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Saved Report"
        message={`Are you sure you want to delete the report template "${deleteTarget?.name}"?`}
        confirmText="Delete Report"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
