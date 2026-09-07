import React, { useState } from 'react';
import axios from 'axios';
import { 
  FileSpreadsheet, 
  Download, 
  Play, 
  Save, 
  Filter, 
  Layers, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  Table as TableIcon
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const MODULES = [
  { id: 'FLEET', label: 'Fleet Assets & Vehicles' },
  { id: 'DRIVERS', label: 'Drivers & Operators' },
  { id: 'TRIPS', label: 'Dispatches & Trips' },
  { id: 'DELIVERIES', label: 'Delivery Packages & Stops' },
  { id: 'MAINTENANCE', label: 'Maintenance Work Orders' },
  { id: 'FUEL', label: 'Fuel Logs & Consumption' },
  { id: 'EXPENSES', label: 'Operating Expenses' },
  { id: 'SAFETY', label: 'Safety Incidents & Audits' }
];

export default function ReportBuilderPage() {
  const { showSuccess, showError } = useToast();
  const [selectedModule, setSelectedModule] = useState('FLEET');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [previewLoading, setPreviewLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [savingReport, setSavingReport] = useState(false);

  const handleGeneratePreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await axios.post('/api/reports/generate', {
        module: selectedModule,
        filters: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined
        },
        format: 'JSON'
      });
      setPreviewData(res.data.data || []);
      showSuccess(`Retrieved ${res.data.data?.length || 0} records for preview`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to generate report preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const res = await axios.post('/api/reports/generate', {
        module: selectedModule,
        filters: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined
        },
        format: 'CSV'
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FleetFlow_${selectedModule}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccess('CSV export generated and downloaded successfully');
    } catch (err) {
      showError('Failed to export CSV file');
    } finally {
      setExportLoading(false);
    }
  };

  const handleSaveReportConfig = async (e) => {
    e.preventDefault();
    if (!reportName.trim()) return;
    setSavingReport(true);
    try {
      await axios.post('/api/reports/saved', {
        name: reportName.trim(),
        description: reportDesc.trim(),
        module: selectedModule,
        filters: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined
        },
        format: 'CSV'
      });
      showSuccess('Report configuration saved to Saved Reports');
      setSaveModalOpen(false);
      setReportName('');
      setReportDesc('');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save report configuration');
    } finally {
      setSavingReport(false);
    }
  };

  // Helper to get columns for preview table
  const getTableHeaders = (records) => {
    if (!records || records.length === 0) return [];
    const keys = Object.keys(records[0]);
    return keys.filter(k => !['_id', '__v', 'company', 'deletedBy', 'isDeleted'].includes(k)).slice(0, 7);
  };

  const renderCell = (val) => {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object') {
      if (val.name) return val.name;
      if (val.registrationNumber) return val.registrationNumber;
      if (val.firstName) return `${val.firstName} ${val.lastName || ''}`.trim();
      return JSON.stringify(val).substring(0, 30);
    }
    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
      return new Date(val).toLocaleDateString();
    }
    return String(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Custom Report Builder</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Build custom datasets, apply operational filters, preview live data, and export directly to CSV.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => setSaveModalOpen(true)}
          >
            <Save size={16} /> Save Configuration
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleExportCSV}
            disabled={exportLoading}
          >
            <Download size={16} /> {exportLoading ? 'Exporting...' : 'Export to CSV'}
          </button>
        </div>
      </div>

      {/* Query Configuration Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} /> Step 1: Configure Data Source &amp; Filters
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {/* Module Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Data Module *
            </label>
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setPreviewData(null);
              }}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            >
              {MODULES.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* End Date */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Record Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleGeneratePreview}
            disabled={previewLoading}
          >
            <Play size={16} /> {previewLoading ? 'Querying Records...' : 'Generate Live Preview'}
          </button>
        </div>
      </div>

      {/* Data Preview Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TableIcon size={18} /> Step 2: Live Data Preview {previewData ? `(${previewData.length} records)` : ''}
          </h3>
        </div>

        {previewLoading ? (
          <div style={{ padding: '1.5rem' }}>
            <SkeletonLoader count={5} height={44} />
          </div>
        ) : !previewData ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Layers size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p style={{ margin: 0 }}>Click "Generate Live Preview" to view matched database records before exporting.</p>
          </div>
        ) : previewData.length === 0 ? (
          <EmptyState 
            icon={FileSpreadsheet} 
            title="No Records Found" 
            message="No records matched the selected module and filter parameters in your company database." 
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {getTableHeaders(previewData).map(header => (
                    <th key={header} style={{ textTransform: 'capitalize' }}>
                      {header.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 25).map((row, idx) => (
                  <tr key={row._id || idx}>
                    {getTableHeaders(previewData).map(header => (
                      <td key={header}>
                        {renderCell(row[header])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 25 && (
              <div style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', background: 'var(--bg-surface-alt)' }}>
                Showing first 25 of {previewData.length} total records. Full dataset will be exported in CSV.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Configuration Modal */}
      {saveModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 460 }}>
            <h3 style={{ margin: '0 0 1rem' }}>Save Report Configuration</h3>
            <form onSubmit={handleSaveReportConfig}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Report Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Completed Trips"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Describe the purpose of this report template..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSaveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingReport}
                >
                  {savingReport ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
