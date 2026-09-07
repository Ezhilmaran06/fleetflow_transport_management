import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowLeft,
  Truck,
  Users,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  XCircle,
  Package
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTrip = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/trips/${id}`);
      setTrip(res.data);
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  const handleStatusTransition = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await axiosClient.put(`/trips/${trip._id}/status`, { status: newStatus });
      showToast(`Trip status transitioned to ${newStatus}`, 'success');
      fetchTrip();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading && !trip) {
    return <SkeletonCard />;
  }

  if (!trip) {
    return (
      <div className="ff-card">
        <EmptyState
          icon={Compass}
          title="Trip Not Found"
          description="The requested trip does not exist or has been removed."
          actionLabel="Back to Trips"
          onAction={() => navigate('/trips')}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/trips" className="ff-btn ff-btn-outline ff-btn-sm">
          <ArrowLeft size={14} /> Back to Trips
        </Link>
      </div>

      {/* Hero Header */}
      <div className="ff-card mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>
                Trip #{trip.tripNumber}
              </h2>
              <StatusBadge status={trip.status} />
              <span
                className={`ff-badge ${
                  trip.priority === 'URGENT' ? 'ff-badge-danger' : trip.priority === 'HIGH' ? 'ff-badge-warning' : 'ff-badge-secondary'
                }`}
              >
                {trip.priority}
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {trip.origin} <span style={{ color: 'var(--ff-primary)' }}>→</span> {trip.destination} • {trip.distanceKm} km
            </div>
          </div>

          {/* Real Backend Transition Buttons */}
          <div className="d-flex flex-wrap gap-2">
            {['UNASSIGNED', 'READY'].includes(trip.status) && (
              <button
                className="ff-btn ff-btn-primary ff-btn-sm"
                disabled={updatingStatus}
                onClick={() => handleStatusTransition('ASSIGNED')}
              >
                Mark Assigned
              </button>
            )}

            {trip.status === 'ASSIGNED' && (
              <button
                className="ff-btn ff-btn-primary ff-btn-sm"
                disabled={updatingStatus}
                onClick={() => handleStatusTransition('ACCEPTED')}
              >
                <Check size={14} /> Driver Accept
              </button>
            )}

            {['ASSIGNED', 'ACCEPTED'].includes(trip.status) && (
              <button
                className="ff-btn ff-btn-primary ff-btn-sm"
                disabled={updatingStatus}
                onClick={() => handleStatusTransition('IN_TRANSIT')}
              >
                <Play size={14} /> Start Journey (In Transit)
              </button>
            )}

            {trip.status === 'IN_TRANSIT' && (
              <>
                <button
                  className="ff-btn ff-btn-outline ff-btn-sm text-warning"
                  disabled={updatingStatus}
                  onClick={() => handleStatusTransition('DELAYED')}
                >
                  <AlertCircle size={14} /> Flag Delayed
                </button>
                <button
                  className="ff-btn ff-btn-primary ff-btn-sm"
                  style={{ backgroundColor: 'var(--ff-success)' }}
                  disabled={updatingStatus}
                  onClick={() => handleStatusTransition('COMPLETED')}
                >
                  <CheckCircle2 size={14} /> Complete Journey
                </button>
              </>
            )}

            {trip.status === 'DELAYED' && (
              <button
                className="ff-btn ff-btn-primary ff-btn-sm"
                disabled={updatingStatus}
                onClick={() => handleStatusTransition('IN_TRANSIT')}
              >
                Resume Transit
              </button>
            )}

            {!['COMPLETED', 'CANCELLED'].includes(trip.status) && (
              <button
                className="ff-btn ff-btn-outline ff-btn-sm text-danger"
                disabled={updatingStatus}
                onClick={() => handleStatusTransition('CANCELLED')}
              >
                <XCircle size={14} /> Cancel Trip
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Timing & Resources */}
        <div className="col-12 col-lg-4">
          {/* Schedule Card */}
          <div className="ff-card mb-4">
            <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 14 }}>Journey Schedule</h5>
            <div className="d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
              <div className="d-flex justify-content-between">
                <span style={{ color: 'var(--text-muted)' }}>Scheduled Start:</span>
                <span style={{ fontWeight: 600 }}>{new Date(trip.scheduledStart).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span style={{ color: 'var(--text-muted)' }}>Actual Start:</span>
                <span>{trip.actualStart ? new Date(trip.actualStart).toLocaleString() : 'Not departed yet'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span style={{ color: 'var(--text-muted)' }}>Actual End:</span>
                <span>{trip.actualEnd ? new Date(trip.actualEnd).toLocaleString() : 'In progress'}</span>
              </div>
            </div>
          </div>

          {/* Assigned Asset */}
          <div className="ff-card mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Vehicle Asset</h5>
              <Truck size={18} color="var(--ff-primary)" />
            </div>
            {trip.vehicle ? (
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  <Link to={`/vehicles/${trip.vehicle._id}`}>{trip.vehicle.registrationNumber}</Link>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {trip.vehicle.make} {trip.vehicle.model} ({trip.vehicle.year})
                </div>
                <div className="mt-2">
                  <StatusBadge status={trip.vehicle.status} />
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No vehicle asset assigned.
              </span>
            )}
          </div>

          {/* Assigned Driver */}
          <div className="ff-card mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Commercial Operator</h5>
              <Users size={18} color="var(--ff-success)" />
            </div>
            {trip.driver ? (
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  <Link to={`/drivers/${trip.driver._id}`}>
                    {trip.driver.firstName} {trip.driver.lastName}
                  </Link>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  License: {trip.driver.licenseNumber} • Phone: {trip.driver.phone}
                </div>
                <div className="mt-2">
                  <StatusBadge status={trip.driver.status} />
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No operator assigned.
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Stops & Deliveries */}
        <div className="col-12 col-lg-8">
          {/* Deliveries on this trip */}
          <div className="ff-card mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <Package size={18} color="var(--ff-primary)" />
                <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>
                  Trip Consignments & Deliveries ({trip.deliveries?.length || 0})
                </h5>
              </div>
            </div>

            {!trip.deliveries || trip.deliveries.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No customer deliveries currently linked to this trip.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="ff-table">
                  <thead>
                    <tr>
                      <th>Tracking #</th>
                      <th>Customer</th>
                      <th>Dropoff Address</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trip.deliveries.map((del) => (
                      <tr key={del._id}>
                        <td style={{ fontWeight: 600 }}>
                          <Link to={`/deliveries/${del._id}`}>#{del.trackingNumber}</Link>
                        </td>
                        <td>{del.customer?.name}</td>
                        <td>{del.dropoffAddress}</td>
                        <td>
                          <StatusBadge status={del.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {trip.notes && (
            <div className="ff-card">
              <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>Dispatch Notes</h5>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{trip.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetailPage;
