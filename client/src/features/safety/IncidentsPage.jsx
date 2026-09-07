import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertOctagon, Plus, Search, Filter, Eye, ShieldCheck, RefreshCw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import IncidentModal from './IncidentModal';

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState({ total: 0, totalPages: 1 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/safety', {
        params: { severity: severityFilter, status: statusFilter, page, limit: 10 }
      });
      setIncidents(res.data);
      setMetadata(res.metadata || { total: res.data.length, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [severityFilter, statusFilter, page]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <AlertOctagon size={22} color="var(--ff-danger)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Safety Incidents & Investigations</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {metadata.total} total incident investigations and accident reports on record
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link to="/compliance" className="ff-btn ff-btn-outline ff-btn-sm">
            <ShieldCheck size={15} /> Compliance Vault
          </Link>
          <button className="ff-btn ff-btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Report Incident
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="ff-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <select
              className="ff-form-control"
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Severity Levels</option>
              <option value="LOW">Low (Minor near miss)</option>
              <option value="MEDIUM">Medium (Damage / Repair)</option>
              <option value="HIGH">High (Equipment outage)</option>
              <option value="CRITICAL">Critical (Collision / Injury)</option>
            </select>
          </div>

          <div className="col-8 col-md-4">
            <select
              className="ff-form-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Investigation Statuses</option>
              <option value="REPORTED">Reported (Pending Review)</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Case Closed</option>
            </select>
          </div>

          <div className="col-4 col-md-3 d-flex justify-content-end">
            <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={fetchIncidents} title="Refresh">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : incidents.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={ShieldCheck}
            title={statusFilter !== 'ALL' ? 'No incidents match filter' : 'No safety incidents recorded'}
            description="Fleet safety records are clean. Log any collisions, vehicle damages, or near misses to maintain compliance."
            actionLabel="Report Incident"
            onAction={() => setIsModalOpen(true)}
          />
        </div>
      ) : (
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Incident #</th>
                <th>Title</th>
                <th>Vehicle</th>
                <th>Operator</th>
                <th>Location</th>
                <th>Date</th>
                <th>Severity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc._id}>
                  <td style={{ fontWeight: 700 }}>
                    <Link to={`/incidents/${inc._id}`}>#{inc.incidentNumber}</Link>
                  </td>
                  <td style={{ fontWeight: 600 }}>{inc.title}</td>
                  <td>
                    {inc.vehicle ? (
                      <Link to={`/vehicles/${inc.vehicle._id}`} style={{ fontWeight: 500 }}>
                        {inc.vehicle.registrationNumber}
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{inc.driver ? `${inc.driver.firstName} ${inc.driver.lastName}` : 'N/A'}</td>
                  <td>{inc.location}</td>
                  <td>{new Date(inc.incidentDate).toLocaleDateString()}</td>
                  <td>
                    <StatusBadge status={inc.severity} />
                  </td>
                  <td>
                    <StatusBadge status={inc.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/incidents/${inc._id}`} className="ff-btn ff-btn-outline ff-btn-sm">
                      <Eye size={14} /> Investigate
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {metadata.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Page {metadata.page} of {metadata.totalPages}
              </span>
              <div className="d-flex gap-2">
                <button className="ff-btn ff-btn-outline ff-btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </button>
                <button className="ff-btn ff-btn-outline ff-btn-sm" disabled={page >= metadata.totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <IncidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchIncidents}
      />
    </div>
  );
};

export default IncidentsPage;
