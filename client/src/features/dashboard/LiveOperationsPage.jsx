import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Radio, RefreshCw, AlertCircle, Compass, Truck, Users, Clock, ShieldAlert } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const LiveOperationsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchLiveTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/trips?status=IN_TRANSIT&limit=50');
      setTrips(res.data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveTrips();
    const interval = setInterval(fetchLiveTrips, 15000); // controlled polling
    return () => clearInterval(interval);
  }, [fetchLiveTrips]);

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Radio size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>
              Live Operations Command
            </h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Real-time transit monitoring • Polling every 15s • Last updated: {lastRefreshed.toLocaleTimeString()}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button className="ff-btn ff-btn-outline ff-btn-sm" onClick={fetchLiveTrips}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {loading && trips.length === 0 ? (
        <SkeletonTable rows={5} />
      ) : trips.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={Compass}
            title="No Active In-Transit Operations"
            description="There are currently no active trips dispatched in transit. Inspect the dispatch board to assign and release pending trips."
            actionLabel="Open Dispatch Board"
            onAction={() => (window.location.href = '/dispatch-board')}
          />
        </div>
      ) : (
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Distance</th>
                <th>Started At</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip._id}>
                  <td style={{ fontWeight: 600 }}>#{trip.tripNumber}</td>
                  <td>
                    {trip.vehicle ? (
                      <span style={{ fontWeight: 600 }}>{trip.vehicle.registrationNumber}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    {trip.driver ? (
                      <span>{trip.driver.firstName} {trip.driver.lastName}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                    )}
                  </td>
                  <td>{trip.origin}</td>
                  <td>{trip.destination}</td>
                  <td>{trip.distanceKm || 0} km</td>
                  <td>{trip.actualStart ? new Date(trip.actualStart).toLocaleTimeString() : 'Pending'}</td>
                  <td>
                    <span
                      className={`ff-badge ${
                        trip.priority === 'URGENT'
                          ? 'ff-badge-danger'
                          : trip.priority === 'HIGH'
                          ? 'ff-badge-warning'
                          : 'ff-badge-secondary'
                      }`}
                    >
                      {trip.priority}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={trip.status} />
                  </td>
                  <td>
                    <Link to={`/trips/${trip._id}`} className="ff-btn ff-btn-outline ff-btn-sm">
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LiveOperationsPage;
