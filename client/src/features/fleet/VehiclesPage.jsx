import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Wrench,
  Download,
  LayoutGrid,
  List,
  RefreshCw
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import VehicleModal from './VehicleModal';
import { useToast } from '../../context/ToastContext';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // table or grid
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsModalOpen(true);
      setEditingVehicle(null);
    }
  }, [searchParams]);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/vehicles', {
        params: {
          search,
          status: statusFilter,
          type: typeFilter,
          page,
          limit: 10
        }
      });
      setVehicles(res.data);
      setMetadata(res.metadata || { total: res.data.length, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, page]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleDeleteConfirm = async () => {
    if (!deletingVehicle) return;
    setDeleteLoading(true);
    try {
      await axiosClient.delete(`/vehicles/${deletingVehicle._id}`);
      showToast(`Vehicle ${deletingVehicle.registrationNumber} deleted`, 'success');
      setDeletingVehicle(null);
      fetchVehicles();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (vehicles.length === 0) {
      showToast('No records available to export', 'warning');
      return;
    }
    const headers = ['RegistrationNumber', 'Make', 'Model', 'Year', 'Type', 'FuelType', 'Mileage', 'Status'];
    const rows = vehicles.map((v) => [
      v.registrationNumber,
      v.make,
      v.model,
      v.year,
      v.type,
      v.fuelType,
      v.mileage,
      v.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FleetFlow_Vehicles_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported filtered vehicles to CSV', 'success');
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Truck size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Fleet Asset Management</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {metadata.total} total fleet vehicles registered across active workspace
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={handleExportCSV} title="Export CSV">
            <Download size={15} /> Export
          </button>
          <button
            className="ff-btn ff-btn-primary"
            onClick={() => {
              setEditingVehicle(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="ff-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="ff-form-control"
                placeholder="Search by registration number, make, model, VIN..."
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
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_TRIP">In Trip</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="ff-form-control"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Types</option>
              <option value="TRUCK">Truck</option>
              <option value="VAN">Van</option>
              <option value="TRAILER">Trailer</option>
              <option value="EV">Electric (EV)</option>
              <option value="CONTAINER">Container</option>
            </select>
          </div>

          <div className="col-12 col-md-2 d-flex justify-content-end gap-2">
            <button
              className={`ff-btn ff-btn-sm ${viewMode === 'table' ? 'ff-btn-primary' : 'ff-btn-outline'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              className={`ff-btn ff-btn-sm ${viewMode === 'grid' ? 'ff-btn-primary' : 'ff-btn-outline'}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={fetchVehicles} title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : vehicles.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={Truck}
            title={search || statusFilter !== 'ALL' ? 'No vehicles match filters' : 'No vehicles registered in fleet'}
            description={
              search || statusFilter !== 'ALL'
                ? 'Try clearing the search query or resetting your status filters.'
                : 'Your FleetFlow workspace is ready. Start by adding your first vehicle to begin dispatch operations.'
            }
            actionLabel="Add Vehicle"
            onAction={() => {
              setEditingVehicle(null);
              setIsModalOpen(true);
            }}
          />
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Make & Model</th>
                <th>Type</th>
                <th>Assigned Driver</th>
                <th>Mileage</th>
                <th>Fuel Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id}>
                  <td>
                    <Link to={`/vehicles/${v._id}`} style={{ fontWeight: 700, color: 'var(--ff-primary)' }}>
                      {v.registrationNumber}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{v.make} {v.model}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.year} • VIN: {v.vin || 'N/A'}</div>
                  </td>
                  <td>
                    <span className="ff-badge ff-badge-secondary">{v.type}</span>
                  </td>
                  <td>
                    {v.assignedDriver ? (
                      <span style={{ fontWeight: 500 }}>
                        {v.assignedDriver.firstName} {v.assignedDriver.lastName}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>
                  <td>{v.mileage?.toLocaleString() || 0} km</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        style={{
                          width: 48,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'var(--border-color)',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${v.fuelLevel || 100}%`,
                            height: '100%',
                            backgroundColor: (v.fuelLevel || 100) < 25 ? 'var(--ff-danger)' : 'var(--ff-success)'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem' }}>{v.fuelLevel || 100}%</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={v.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="d-inline-flex gap-1">
                      <Link
                        to={`/vehicles/${v._id}`}
                        className="ff-btn ff-btn-outline ff-btn-sm"
                        title="Vehicle Details"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        className="ff-btn ff-btn-outline ff-btn-sm"
                        onClick={() => {
                          setEditingVehicle(v);
                          setIsModalOpen(true);
                        }}
                        title="Edit Vehicle"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="ff-btn ff-btn-outline ff-btn-sm text-danger"
                        onClick={() => setDeletingVehicle(v)}
                        title="Delete Vehicle"
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
            <div
              className="d-flex justify-content-between align-items-center p-3"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Page {metadata.page} of {metadata.totalPages} ({metadata.total} records)
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
      ) : (
        /* Grid View */
        <div className="row g-3">
          {vehicles.map((v) => (
            <div className="col-12 col-md-6 col-xl-4" key={v._id}>
              <div className="ff-card h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--ff-primary)' }}>
                      {v.registrationNumber}
                    </span>
                    <StatusBadge status={v.status} />
                  </div>
                  <h5 style={{ fontSize: '0.95rem', margin: '0 0 4px', fontWeight: 600 }}>
                    {v.make} {v.model} ({v.year})
                  </h5>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                    {v.type} • {v.fuelType} • VIN: {v.vin || 'N/A'}
                  </div>
                  <div
                    style={{
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: 10,
                      fontSize: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    <div className="d-flex justify-content-between">
                      <span style={{ color: 'var(--text-muted)' }}>Mileage:</span>
                      <span style={{ fontWeight: 600 }}>{v.mileage?.toLocaleString() || 0} km</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: 'var(--text-muted)' }}>Driver:</span>
                      <span style={{ fontWeight: 600 }}>
                        {v.assignedDriver ? `${v.assignedDriver.firstName} ${v.assignedDriver.lastName}` : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="d-flex justify-content-between align-items-center mt-3 pt-2"
                  style={{ borderTop: '1px solid var(--border-color)' }}
                >
                  <Link to={`/vehicles/${v._id}`} className="ff-btn ff-btn-outline ff-btn-sm">
                    <Eye size={14} /> Inspect
                  </Link>
                  <div className="d-flex gap-1">
                    <button
                      className="ff-btn ff-btn-outline ff-btn-sm"
                      onClick={() => {
                        setEditingVehicle(v);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="ff-btn ff-btn-outline ff-btn-sm text-danger"
                      onClick={() => setDeletingVehicle(v)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchVehicles}
        vehicle={editingVehicle}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingVehicle}
        title="Confirm Asset Removal"
        message={`Are you sure you want to remove vehicle ${deletingVehicle?.registrationNumber}? This will mark the asset as deleted and prevent new dispatches.`}
        confirmText="Remove Vehicle"
        isDanger={true}
        isLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingVehicle(null)}
      />
    </div>
  );
};

export default VehiclesPage;
