import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Workflow,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import TripModal from './TripModal';
import { useToast } from '../../context/ToastContext';

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingTrip, setDeletingTrip] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/trips', {
        params: {
          search,
          status: statusFilter,
          priority: priorityFilter,
          page,
          limit: 10
        }
      });
      setTrips(res.data);
      setMetadata(res.metadata || { total: res.data.length, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, page]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDelete = async () => {
    if (!deletingTrip) return;
    setDeleteLoading(true);
    try {
      await axiosClient.delete(`/trips/${deletingTrip._id}`);
      showToast('Trip removed', 'success');
      setDeletingTrip(null);
      fetchTrips();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (trips.length === 0) {
      showToast('No trips to export', 'warning');
      return;
    }
    const headers = ['TripNumber', 'Origin', 'Destination', 'DistanceKm', 'Priority', 'Status', 'ScheduledStart'];
    const rows = trips.map((t) => [
      t.tripNumber,
      t.origin,
      t.destination,
      t.distanceKm,
      t.priority,
      t.status,
      t.scheduledStart
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `FleetFlow_Trips_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported trips to CSV', 'success');
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Compass size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Trip Logistics Management</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {metadata.total} total journeys planned, in-transit, and completed
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link to="/dispatch-board" className="ff-btn ff-btn-outline ff-btn-sm">
            <Workflow size={15} /> Kanban Dispatch Board
          </Link>
          <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={handleExportCSV}>
            <Download size={15} /> Export
          </button>
          <button className="ff-btn ff-btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Create Trip
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="ff-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="ff-form-control"
                placeholder="Search trip number, origin, destination..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{ paddingLeft: 34 }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="ff-form-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="UNASSIGNED">Unassigned</option>
              <option value="READY">Ready</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELAYED">Delayed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="ff-form-control"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Priorities</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="col-12 col-md-2 d-flex justify-content-end">
            <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={fetchTrips} title="Refresh">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : trips.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={Compass}
            title={search || statusFilter !== 'ALL' ? 'No trips match filter criteria' : 'No trips dispatched yet'}
            description="Plan a new freight trip by pairing an available vehicle and operator."
            actionLabel="Create Trip"
            onAction={() => setIsModalOpen(true)}
          />
        </div>
      ) : (
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Origin → Destination</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Distance</th>
                <th>Scheduled Start</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t._id}>
                  <td>
                    <Link to={`/trips/${t._id}`} style={{ fontWeight: 700, color: 'var(--ff-primary)' }}>
                      #{t.tripNumber}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.origin}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>→ {t.destination}</div>
                  </td>
                  <td>
                    {t.vehicle ? (
                      <Link to={`/vehicles/${t.vehicle._id}`} style={{ fontWeight: 500 }}>
                        {t.vehicle.registrationNumber}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    {t.driver ? (
                      <Link to={`/drivers/${t.driver._id}`} style={{ fontWeight: 500 }}>
                        {t.driver.firstName} {t.driver.lastName}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                    )}
                  </td>
                  <td>{t.distanceKm} km</td>
                  <td>{new Date(t.scheduledStart).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`ff-badge ${
                        t.priority === 'URGENT' ? 'ff-badge-danger' : t.priority === 'HIGH' ? 'ff-badge-warning' : 'ff-badge-secondary'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="d-inline-flex gap-1">
                      <Link to={`/trips/${t._id}`} className="ff-btn ff-btn-outline ff-btn-sm" title="Inspect Trip">
                        <Eye size={14} />
                      </Link>
                      <button
                        className="ff-btn ff-btn-outline ff-btn-sm text-danger"
                        onClick={() => setDeletingTrip(t)}
                        title="Delete Trip"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {metadata.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Page {metadata.page} of {metadata.totalPages} ({metadata.total} journeys)
              </span>
              <div className="d-flex gap-2">
                <button
                  className="ff-btn ff-btn-outline ff-btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button
                  className="ff-btn ff-btn-outline ff-btn-sm"
                  disabled={page >= metadata.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <TripModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchTrips}
      />

      <ConfirmModal
        isOpen={!!deletingTrip}
        title="Cancel & Remove Trip"
        message={`Are you sure you want to remove trip #${deletingTrip?.tripNumber}? This operation will be logged to the audit ledger.`}
        confirmText="Remove Trip"
        isDanger={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTrip(null)}
      />
    </div>
  );
};

export default TripsPage;
