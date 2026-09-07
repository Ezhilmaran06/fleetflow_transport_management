import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Download,
  Award,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import DriverModal from './DriverModal';
import { useToast } from '../../context/ToastContext';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [deletingDriver, setDeletingDriver] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsModalOpen(true);
      setEditingDriver(null);
    }
  }, [searchParams]);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/drivers', {
        params: { search, status: statusFilter, page, limit: 10 }
      });
      setDrivers(res.data);
      setMetadata(res.metadata || { total: res.data.length, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleDeleteConfirm = async () => {
    if (!deletingDriver) return;
    setDeleteLoading(true);
    try {
      await axiosClient.delete(`/drivers/${deletingDriver._id}`);
      showToast(`Driver ${deletingDriver.firstName} ${deletingDriver.lastName} deleted`, 'success');
      setDeletingDriver(null);
      fetchDrivers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (drivers.length === 0) {
      showToast('No drivers to export', 'warning');
      return;
    }
    const headers = ['FirstName', 'LastName', 'Email', 'Phone', 'LicenseNumber', 'Status', 'SafetyScore'];
    const rows = drivers.map((d) => [
      d.firstName,
      d.lastName,
      d.email,
      d.phone,
      d.licenseNumber,
      d.status,
      d.safetyScore
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FleetFlow_Drivers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported drivers to CSV', 'success');
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Users size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Driver Management</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {metadata.total} commercial operators enrolled across company
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link to="/driver-performance" className="ff-btn ff-btn-outline ff-btn-sm">
            <Award size={15} /> Performance Rankings
          </Link>
          <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={handleExportCSV}>
            <Download size={15} /> Export
          </button>
          <button
            className="ff-btn ff-btn-primary"
            onClick={() => {
              setEditingDriver(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Driver
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="ff-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="ff-form-control"
                placeholder="Search by driver name, license number, phone, email..."
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

          <div className="col-8 col-md-4">
            <select
              className="ff-form-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div className="col-4 col-md-2 d-flex justify-content-end">
            <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={fetchDrivers} title="Refresh">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : drivers.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={Users}
            title={search || statusFilter !== 'ALL' ? 'No drivers match search criteria' : 'No drivers registered yet'}
            description="Onboard your commercial operators with license verifications to begin assigning routes and trips."
            actionLabel="Onboard Driver"
            onAction={() => {
              setEditingDriver(null);
              setIsModalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>License Number</th>
                <th>Contact</th>
                <th>Assigned Vehicle</th>
                <th>Trips Completed</th>
                <th>Safety Score</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d._id}>
                  <td>
                    <Link to={`/drivers/${d._id}`} style={{ fontWeight: 700, color: 'var(--ff-primary)' }}>
                      {d.firstName} {d.lastName}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{d.licenseNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Exp: {new Date(d.licenseExpiry).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{d.phone}</td>
                  <td>
                    {d.assignedVehicle ? (
                      <Link to={`/vehicles/${d.assignedVehicle._id}`} style={{ fontWeight: 600 }}>
                        {d.assignedVehicle.registrationNumber}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{d.totalTripsCompleted || 0}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontWeight: 700, color: d.safetyScore >= 90 ? 'var(--ff-success)' : 'var(--ff-warning)' }}>
                        {d.safetyScore || 100}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={d.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="d-inline-flex gap-1">
                      <Link to={`/drivers/${d._id}`} className="ff-btn ff-btn-outline ff-btn-sm" title="Inspect">
                        <Eye size={14} />
                      </Link>
                      <button
                        className="ff-btn ff-btn-outline ff-btn-sm"
                        onClick={() => {
                          setEditingDriver(d);
                          setIsModalOpen(true);
                        }}
                        title="Edit Driver"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="ff-btn ff-btn-outline ff-btn-sm text-danger"
                        onClick={() => setDeletingDriver(d)}
                        title="Delete Driver"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {metadata.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Page {metadata.page} of {metadata.totalPages} ({metadata.total} operators)
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

      {/* Driver Modal */}
      <DriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchDrivers}
        driver={editingDriver}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deletingDriver}
        title="Confirm Driver Removal"
        message={`Are you sure you want to remove operator ${deletingDriver?.firstName} ${deletingDriver?.lastName}? Active trip conflicts will be verified.`}
        confirmText="Remove Driver"
        isDanger={true}
        isLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingDriver(null)}
      />
    </div>
  );
};

export default DriversPage;
