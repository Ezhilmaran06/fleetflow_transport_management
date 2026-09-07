import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Workflow, Plus, Compass, Truck, Users, RefreshCw, ArrowRight } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import TripModal from './TripModal';
import { useToast } from '../../context/ToastContext';

const KANBAN_COLUMNS = [
  { id: 'UNASSIGNED', label: 'Unassigned', color: '#94a3b8' },
  { id: 'READY', label: 'Ready', color: '#3b82f6' },
  { id: 'ASSIGNED', label: 'Assigned', color: '#6366f1' },
  { id: 'ACCEPTED', label: 'Accepted', color: '#06b6d4' },
  { id: 'IN_TRANSIT', label: 'In Transit', color: '#f59e0b' },
  { id: 'DELAYED', label: 'Delayed', color: '#ef4444' },
  { id: 'COMPLETED', label: 'Completed', color: '#10b981' }
];

const DispatchBoardPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [movingTripId, setMovingTripId] = useState(null);
  const { showToast } = useToast();

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/trips?limit=100');
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleMoveStatus = async (tripId, targetStatus) => {
    setMovingTripId(tripId);
    try {
      await axiosClient.put(`/trips/${tripId}/status`, { status: targetStatus });
      showToast(`Trip moved to ${targetStatus}`, 'success');
      fetchTrips();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setMovingTripId(null);
    }
  };

  const getTripsByStatus = (status) => {
    return trips.filter((t) => t.status === status);
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Workflow size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>
              Interactive Dispatch Board
            </h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Visual operations pipeline across trip lifecycle states
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={fetchTrips} title="Refresh Board">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="ff-btn ff-btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> Plan New Trip
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      {loading && trips.length === 0 ? (
        <div className="row g-3">
          {[1, 2, 3, 4].map((i) => (
            <div className="col-3" key={i}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 16,
            minHeight: 'calc(100vh - 210px)'
          }}
        >
          {KANBAN_COLUMNS.map((col) => {
            const columnTrips = getTripsByStatus(col.id);

            return (
              <div
                key={col.id}
                style={{
                  flex: '0 0 280px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 210px)'
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: col.color
                      }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{col.label}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 10,
                      padding: '2px 8px',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {columnTrips.length}
                  </span>
                </div>

                {/* Column Body Cards */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {columnTrips.map((trip) => (
                    <div
                      key={trip._id}
                      className="ff-card p-3"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Link
                          to={`/trips/${trip._id}`}
                          style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ff-primary)' }}
                        >
                          #{trip.tripNumber}
                        </Link>
                        <span
                          className={`ff-badge ${
                            trip.priority === 'URGENT' ? 'ff-badge-danger' : trip.priority === 'HIGH' ? 'ff-badge-warning' : 'ff-badge-secondary'
                          }`}
                        >
                          {trip.priority}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
                        {trip.origin} → {trip.destination}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
                        <div className="d-flex align-items-center gap-1">
                          <Truck size={12} />
                          <span>{trip.vehicle?.registrationNumber || 'No vehicle'}</span>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <Users size={12} />
                          <span>{trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'No driver'}</span>
                        </div>
                      </div>

                      {/* State transition triggers */}
                      <div
                        style={{
                          borderTop: '1px solid var(--border-color)',
                          paddingTop: 8,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Link to={`/trips/${trip._id}`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          Inspect
                        </Link>

                        {/* Quick progression buttons */}
                        {col.id === 'UNASSIGNED' && (
                          <button
                            className="ff-btn ff-btn-outline ff-btn-sm"
                            disabled={movingTripId === trip._id}
                            onClick={() => handleMoveStatus(trip._id, 'READY')}
                            title="Mark Ready"
                          >
                            Ready <ArrowRight size={12} />
                          </button>
                        )}
                        {col.id === 'READY' && (
                          <button
                            className="ff-btn ff-btn-outline ff-btn-sm"
                            disabled={movingTripId === trip._id}
                            onClick={() => handleMoveStatus(trip._id, 'ASSIGNED')}
                            title="Assign Trip"
                          >
                            Assign <ArrowRight size={12} />
                          </button>
                        )}
                        {col.id === 'ASSIGNED' && (
                          <button
                            className="ff-btn ff-btn-outline ff-btn-sm"
                            disabled={movingTripId === trip._id}
                            onClick={() => handleMoveStatus(trip._id, 'ACCEPTED')}
                            title="Accept"
                          >
                            Accept <ArrowRight size={12} />
                          </button>
                        )}
                        {col.id === 'ACCEPTED' && (
                          <button
                            className="ff-btn ff-btn-primary ff-btn-sm"
                            disabled={movingTripId === trip._id}
                            onClick={() => handleMoveStatus(trip._id, 'IN_TRANSIT')}
                            title="Start Journey"
                          >
                            Transit <ArrowRight size={12} />
                          </button>
                        )}
                        {col.id === 'IN_TRANSIT' && (
                          <button
                            className="ff-btn ff-btn-primary ff-btn-sm"
                            style={{ backgroundColor: 'var(--ff-success)' }}
                            disabled={movingTripId === trip._id}
                            onClick={() => handleMoveStatus(trip._id, 'COMPLETED')}
                            title="Complete"
                          >
                            Complete
                          </button>
                        )}
                        {col.id === 'DELAYED' && (
                          <button
                            className="ff-btn ff-btn-outline ff-btn-sm"
                            disabled={movingTripId === trip._id}
                            onClick={() => handleMoveStatus(trip._id, 'IN_TRANSIT')}
                          >
                            Resume
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {columnTrips.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      No dispatches
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaved={fetchTrips}
      />
    </div>
  );
};

export default DispatchBoardPage;
