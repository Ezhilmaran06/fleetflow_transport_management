import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Edit2, Trash2, Clock } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import RouteModal from './RouteModal';
import { useToast } from '../../context/ToastContext';

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [deletingRoute, setDeletingRoute] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showToast } = useToast();

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/routes', { params: { search } });
      setRoutes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [search]);

  const handleDelete = async () => {
    if (!deletingRoute) return;
    setDeleteLoading(true);
    try {
      await axiosClient.delete(`/routes/${deletingRoute._id}`);
      showToast('Route deactivated', 'success');
      setDeletingRoute(null);
      fetchRoutes();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <MapPin size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Standard Logistics Corridors</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Predefined freight transit routes with verified distances and durations
          </span>
        </div>

        <button
          className="ff-btn ff-btn-primary"
          onClick={() => {
            setEditingRoute(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} /> Plan New Route
        </button>
      </div>

      <div className="ff-card p-3 mb-4">
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <input
            type="text"
            className="ff-form-control"
            placeholder="Search routes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={4} />
      ) : routes.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={MapPin}
            title="No Logistics Routes Created"
            description="Create corridors to expedite trip dispatching with standard distance and transit times."
            actionLabel="Plan New Route"
            onAction={() => {
              setEditingRoute(null);
              setIsModalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Route Name</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Distance</th>
                <th>Estimated Duration</th>
                <th>Waypoints</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 700 }}>{r.name}</td>
                  <td>{r.origin}</td>
                  <td>{r.destination}</td>
                  <td>{r.distanceKm} km</td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <Clock size={14} color="var(--text-muted)" />
                      <span>{Math.floor(r.estimatedMinutes / 60)}h {r.estimatedMinutes % 60}m</span>
                    </div>
                  </td>
                  <td>{r.waypoints?.length > 0 ? r.waypoints.join(' • ') : 'Direct'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="d-inline-flex gap-1">
                      <button
                        className="ff-btn ff-btn-outline ff-btn-sm"
                        onClick={() => {
                          setEditingRoute(r);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="ff-btn ff-btn-outline ff-btn-sm text-danger"
                        onClick={() => setDeletingRoute(r)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RouteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchRoutes}
        route={editingRoute}
      />

      <ConfirmModal
        isOpen={!!deletingRoute}
        title="Deactivate Route"
        message={`Are you sure you want to deactivate route '${deletingRoute?.name}'?`}
        confirmText="Deactivate"
        isDanger={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingRoute(null)}
      />
    </div>
  );
};

export default RoutesPage;
