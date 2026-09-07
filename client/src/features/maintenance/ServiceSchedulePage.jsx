import React, { useState, useEffect } from 'react';
import { Calendar, Wrench, ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import WorkOrderModal from './WorkOrderModal';

const ServiceSchedulePage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/maintenance?status=CREATED,APPROVED,ASSIGNED&limit=50');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  return (
    <div>
      <div className="mb-3">
        <Link to="/maintenance" className="ff-btn ff-btn-outline ff-btn-sm">
          <ArrowLeft size={14} /> Back to Work Orders
        </Link>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Calendar size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Fleet Preventative Service Schedule</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Scheduled upcoming mechanical inspections and maintenance intervals
          </span>
        </div>

        <button className="ff-btn ff-btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Schedule Service
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={4} />
      ) : orders.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={Calendar}
            title="No Scheduled Upcoming Services"
            description="All fleet assets are currently up to date on maintenance intervals."
            actionLabel="Schedule Service"
            onAction={() => setIsModalOpen(true)}
          />
        </div>
      ) : (
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Scheduled Date</th>
                <th>Vehicle</th>
                <th>Work Order #</th>
                <th>Service Type</th>
                <th>Issue Description</th>
                <th>Priority</th>
                <th>Technician</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontWeight: 700, color: 'var(--ff-primary)' }}>
                    {new Date(o.scheduledDate).toLocaleDateString()}
                  </td>
                  <td>
                    {o.vehicle ? (
                      <Link to={`/vehicles/${o.vehicle._id}`} style={{ fontWeight: 600 }}>
                        {o.vehicle.registrationNumber}
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>#{o.workOrderNumber}</td>
                  <td>
                    <span className="ff-badge ff-badge-secondary">{o.serviceType}</span>
                  </td>
                  <td>{o.issueDescription}</td>
                  <td>
                    <StatusBadge status={o.priority} />
                  </td>
                  <td>{o.technician || 'Pending Assignment'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <WorkOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchSchedule}
      />
    </div>
  );
};

export default ServiceSchedulePage;
