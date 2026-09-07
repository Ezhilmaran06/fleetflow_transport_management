import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const RouteModal = ({ isOpen, onClose, onSaved, route = null }) => {
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [distanceKm, setDistanceKm] = useState(100);
  const [estimatedMinutes, setEstimatedMinutes] = useState(120);
  const [waypoints, setWaypoints] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (route) {
        setName(route.name || '');
        setOrigin(route.origin || '');
        setDestination(route.destination || '');
        setDistanceKm(route.distanceKm || 100);
        setEstimatedMinutes(route.estimatedMinutes || 120);
        setWaypoints(route.waypoints ? route.waypoints.join(', ') : '');
      } else {
        setName('');
        setOrigin('');
        setDestination('');
        setDistanceKm(100);
        setEstimatedMinutes(120);
        setWaypoints('');
      }
    }
  }, [isOpen, route]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      origin,
      destination,
      distanceKm: parseFloat(distanceKm),
      estimatedMinutes: parseInt(estimatedMinutes, 10),
      waypoints: waypoints ? waypoints.split(',').map((w) => w.trim()).filter(Boolean) : []
    };

    try {
      if (route) {
        await axiosClient.put(`/routes/${route._id}`, payload);
        showToast('Route updated successfully', 'success');
      } else {
        await axiosClient.post('/routes', payload);
        showToast('Route created successfully', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ff-modal-overlay">
      <div className="ff-modal" style={{ maxWidth: 540 }}>
        <div className="ff-modal-header">
          <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>
            {route ? 'Edit Operational Route' : 'Create Standard Route Corridor'}
          </h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ff-modal-body">
            <div className="mb-3">
              <label className="ff-form-label">Route Name *</label>
              <input
                type="text"
                required
                className="ff-form-control"
                placeholder="e.g. Great Lakes Express (ORD-DTW)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Origin Hub *</label>
                <input
                  type="text"
                  required
                  className="ff-form-control"
                  placeholder="Chicago IL"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="ff-form-label">Destination Hub *</label>
                <input
                  type="text"
                  required
                  className="ff-form-control"
                  placeholder="Detroit MI"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Distance (km) *</label>
                <input
                  type="number"
                  required
                  className="ff-form-control"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="ff-form-label">Estimated Transit Time (mins) *</label>
                <input
                  type="number"
                  required
                  className="ff-form-control"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="ff-form-label">Waypoints (Comma separated)</label>
              <input
                type="text"
                className="ff-form-control"
                placeholder="Gary IN, Kalamazoo MI, Ann Arbor MI"
                value={waypoints}
                onChange={(e) => setWaypoints(e.target.value)}
              />
            </div>
          </div>

          <div className="ff-modal-footer">
            <button type="button" className="ff-btn ff-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ff-btn ff-btn-primary" disabled={loading}>
              {loading ? 'Saving Route...' : route ? 'Save Changes' : 'Create Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteModal;
