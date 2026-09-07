import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Plus, Search, Filter, CheckCircle2, Play, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import WorkOrderModal from './WorkOrderModal';
import { useToast } from '../../context/ToastContext';

const MaintenancePage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transitioningId, setTransitioningId] = useState(null);
  const { showToast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/maintenance', {
        params: { status: statusFilter, priority: priorityFilter, page, limit: 10 }
      });
      setOrders(res.data);
      setMetadata(res.metadata || { total: res.data.length, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setTransitioningId(orderId);
    try {
      await axiosClient.put(`/maintenance/${orderId}/status`, { status: newStatus });
      showToast(`Work order transitioned to ${newStatus}. Asset state synchronized.`, 'success');
      fetchOrders();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setTransitioningId(null);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Wrench size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Maintenance & Work Orders</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Synchronized vehicle availability engine • Assets under service automatically locked from dispatch
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link to="/service-schedule" className="ff-btn ff-btn-outline ff-btn-sm">
            <Calendar size={15} /> Service Schedule
          </Link>
          <button className="ff-btn ff-btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> New Work Order
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="ff-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <select
              className="ff-form-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Work Order Statuses</option>
              <option value="CREATED">Created</option>
              <option value="APPROVED">Approved (Locked Asset)</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress (Locked Asset)</option>
              <option value="COMPLETED">Completed (Asset Restored)</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="col-8 col-md-4">
            <select
              className="ff-form-control"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="col-4 col-md-3 d-flex justify-content-end">
            <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={fetchOrders} title="Refresh">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : orders.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={Wrench}
            title={statusFilter !== 'ALL' ? 'No work orders match filter' : 'No maintenance orders scheduled'}
            description="Create work orders to track vehicle repairs, preventative maintenance, and workshop costs."
            actionLabel="New Work Order"
            onAction={() => setIsModalOpen(true)}
          />
        </div>
      ) : (
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Vehicle</th>
                <th>Issue / Description</th>
                <th>Service Type</th>
                <th>Scheduled Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Workflow Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((m) => (
                <tr key={m._id}>
                  <td style={{ fontWeight: 700 }}>#{m.workOrderNumber}</td>
                  <td>
                    {m.vehicle ? (
                      <Link to={`/vehicles/${m.vehicle._id}`} style={{ fontWeight: 600 }}>
                        {m.vehicle.registrationNumber}
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{m.issueDescription}</td>
                  <td>
                    <span className="ff-badge ff-badge-secondary">{m.serviceType}</span>
                  </td>
                  <td>{new Date(m.scheduledDate).toLocaleDateString()}</td>
                  <td>
                    <StatusBadge status={m.priority} />
                  </td>
                  <td>
                    <StatusBadge status={m.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="d-inline-flex gap-1">
                      {m.status === 'CREATED' && (
                        <button
                          className="ff-btn ff-btn-outline ff-btn-sm"
                          disabled={transitioningId === m._id}
                          onClick={() => handleStatusChange(m._id, 'APPROVED')}
                          title="Approve Order & Lock Vehicle to MAINTENANCE"
                        >
                          Approve
                        </button>
                      )}
                      {['APPROVED', 'ASSIGNED'].includes(m.status) && (
                        <button
                          className="ff-btn ff-btn-primary ff-btn-sm"
                          disabled={transitioningId === m._id}
                          onClick={() => handleStatusChange(m._id, 'IN_PROGRESS')}
                        >
                          <Play size={12} /> Start Service
                        </button>
                      )}
                      {m.status === 'IN_PROGRESS' && (
                        <button
                          className="ff-btn ff-btn-primary ff-btn-sm"
                          style={{ backgroundColor: 'var(--ff-success)' }}
                          disabled={transitioningId === m._id}
                          onClick={() => handleStatusChange(m._id, 'COMPLETED')}
                          title="Complete Service & Return Asset to AVAILABLE"
                        >
                          <CheckCircle2 size={12} /> Complete
                        </button>
                      )}
                    </div>
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

      <WorkOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchOrders}
      />
    </div>
  );
};

export default MaintenancePage;
