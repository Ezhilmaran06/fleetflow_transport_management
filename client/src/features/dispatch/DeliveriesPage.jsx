import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Truck, Plus, Search, Filter, Eye, Trash2, Download, Package, RefreshCw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import DeliveryModal from './DeliveryModal';
import { useToast } from '../../context/ToastContext';

const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingDelivery, setDeletingDelivery] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/deliveries', {
        params: { search, status: statusFilter, page, limit: 10 }
      });
      setDeliveries(res.data);
      setMetadata(res.metadata || { total: res.data.length, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleDelete = async () => {
    if (!deletingDelivery) return;
    setDeleteLoading(true);
    try {
      await axiosClient.delete(`/deliveries/${deletingDelivery._id}`);
      showToast('Delivery order removed', 'success');
      setDeletingDelivery(null);
      fetchDeliveries();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (deliveries.length === 0) {
      showToast('No delivery records to export', 'warning');
      return;
    }
    const headers = ['TrackingNumber', 'Customer', 'DropoffAddress', 'WeightKg', 'Pieces', 'Status'];
    const rows = deliveries.map((d) => [
      d.trackingNumber,
      d.customer?.name || 'N/A',
      d.dropoffAddress,
      d.packageDetails?.weightKg || 0,
      d.packageDetails?.pieces || 1,
      d.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `FleetFlow_Deliveries_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported deliveries to CSV', 'success');
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Truck size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Consignment & Delivery Tracking</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {metadata.total} total shipments managed with digital proof of delivery
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={handleExportCSV}>
            <Download size={15} /> Export
          </button>
          <button className="ff-btn ff-btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Create Delivery
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="ff-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="ff-form-control"
                placeholder="Search tracking #, pickup address, dropoff..."
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
              <option value="ALL">All Delivery Statuses</option>
              <option value="PENDING">Pending Pickup</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="DELAYED">Delayed</option>
              <option value="FAILED">Failed Attempt</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="col-4 col-md-2 d-flex justify-content-end">
            <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={fetchDeliveries} title="Refresh">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : deliveries.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={Package}
            title={search || statusFilter !== 'ALL' ? 'No shipments match criteria' : 'No deliveries scheduled yet'}
            description="Create client consignments and assign them to journeys for live dropoff verification."
            actionLabel="Create Delivery"
            onAction={() => setIsModalOpen(true)}
          />
        </div>
      ) : (
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Tracking Number</th>
                <th>Customer</th>
                <th>Destination Address</th>
                <th>Cargo Details</th>
                <th>Trip Ref</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((del) => (
                <tr key={del._id}>
                  <td>
                    <Link to={`/deliveries/${del._id}`} style={{ fontWeight: 700, color: 'var(--ff-primary)' }}>
                      #{del.trackingNumber}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{del.customer?.name || 'Customer'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{del.customer?.phone}</div>
                  </td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {del.dropoffAddress}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{del.packageDetails?.description || 'Cargo'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {del.packageDetails?.weightKg} kg • {del.packageDetails?.pieces} pcs
                    </div>
                  </td>
                  <td>
                    {del.trip ? (
                      <Link to={`/trips/${del.trip._id}`} style={{ fontWeight: 500 }}>
                        #{del.trip.tripNumber}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Direct</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={del.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="d-inline-flex gap-1">
                      <Link to={`/deliveries/${del._id}`} className="ff-btn ff-btn-outline ff-btn-sm" title="View Delivery">
                        <Eye size={14} />
                      </Link>
                      <button
                        className="ff-btn ff-btn-outline ff-btn-sm text-danger"
                        onClick={() => setDeletingDelivery(del)}
                        title="Delete Delivery"
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
                Page {metadata.page} of {metadata.totalPages} ({metadata.total} shipments)
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

      <DeliveryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchDeliveries}
      />

      <ConfirmModal
        isOpen={!!deletingDelivery}
        title="Remove Delivery Consignment"
        message={`Are you sure you want to delete delivery #${deletingDelivery?.trackingNumber}?`}
        confirmText="Delete Order"
        isDanger={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingDelivery(null)}
      />
    </div>
  );
};

export default DeliveriesPage;
