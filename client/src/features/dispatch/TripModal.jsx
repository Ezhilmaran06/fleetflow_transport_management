import React, { useState, useEffect } from 'react';
import { X, Compass, Check, AlertTriangle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const TripModal = ({ isOpen, onClose, onSaved }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    routeId: '',
    scheduledStart: '',
    scheduledEnd: '',
    distanceKm: 0,
    priority: 'NORMAL',
    notes: ''
  });

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      // Fetch available vehicles, drivers, and routes
      axiosClient.get('/vehicles?status=AVAILABLE&limit=100').then((res) => setVehicles(res.data)).catch(() => {});
      axiosClient.get('/drivers?status=AVAILABLE&limit=100').then((res) => setDrivers(res.data)).catch(() => {});
      axiosClient.get('/routes?limit=50').then((res) => setRoutes(res.data)).catch(() => {});

      // Default start time to now + 2 hours
      const d = new Date();
      d.setHours(d.getHours() + 2);
      setFormData({
        origin: '',
        destination: '',
        vehicleId: '',
        driverId: '',
        routeId: '',
        scheduledStart: d.toISOString().slice(0, 16),
        scheduledEnd: '',
        distanceKm: 150,
        priority: 'NORMAL',
        notes: ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRouteChange = (e) => {
    const rId = e.target.value;
    setFormData((prev) => {
      const selected = routes.find((r) => r._id === rId);
      if (selected) {
        return {
          ...prev,
          routeId: rId,
          origin: selected.origin,
          destination: selected.destination,
          distanceKm: selected.distanceKm
        };
      }
      return { ...prev, routeId: rId };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axiosClient.post('/trips', formData);
      showToast('Trip created and scheduled', 'success');
      onSaved();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicle = vehicles.find((v) => v._id === formData.vehicleId);
  const selectedDriver = drivers.find((d) => d._id === formData.driverId);

  return (
    <div className="ff-modal-overlay">
      <div className="ff-modal" style={{ maxWidth: 640 }}>
        <div className="ff-modal-header">
          <div>
            <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Plan & Dispatch New Trip</h5>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Step {step} of 3: {step === 1 ? 'Route & Locations' : step === 2 ? 'Assign Asset & Operator' : 'Review & Schedule'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="ff-modal-body">
          {/* Step 1: Locations */}
          {step === 1 && (
            <div>
              <div className="mb-3">
                <label className="ff-form-label">Predefined Route (Optional)</label>
                <select className="ff-form-control" value={formData.routeId} onChange={handleRouteChange}>
                  <option value="">Custom Route</option>
                  {routes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.origin} → {r.destination} • {r.distanceKm} km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="ff-form-label">Origin / Departure Hub *</label>
                  <input
                    type="text"
                    required
                    className="ff-form-control"
                    placeholder="e.g. Chicago Central Terminal"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="ff-form-label">Destination *</label>
                  <input
                    type="text"
                    required
                    className="ff-form-control"
                    placeholder="e.g. Detroit Distribution Depot"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="ff-form-label">Estimated Distance (km)</label>
                  <input
                    type="number"
                    className="ff-form-control"
                    value={formData.distanceKm}
                    onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="ff-form-label">Priority</label>
                  <select
                    className="ff-form-control"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Express</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Vehicle & Driver Assignment */}
          {step === 2 && (
            <div>
              <div className="mb-3">
                <label className="ff-form-label">Assign Vehicle Asset (Available Only)</label>
                <select
                  className="ff-form-control"
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                >
                  <option value="">Leave Unassigned (Pending Dispatch)</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} — {v.make} {v.model} ({v.type} • Fuel: {v.fuelLevel}%)
                    </option>
                  ))}
                </select>
                {vehicles.length === 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--ff-warning)' }}>
                    Notice: No vehicles are currently in 'AVAILABLE' status.
                  </span>
                )}
              </div>

              <div className="mb-3">
                <label className="ff-form-label">Assign Commercial Driver (Available Only)</label>
                <select
                  className="ff-form-control"
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                >
                  <option value="">Leave Unassigned (Pending Dispatch)</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.firstName} {d.lastName} — Lic: {d.licenseNumber} (Safety: {d.safetyScore}%)
                    </option>
                  ))}
                </select>
                {drivers.length === 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--ff-warning)' }}>
                    Notice: No drivers are currently in 'AVAILABLE' status.
                  </span>
                )}
              </div>

              <div className="row g-3 mb-2">
                <div className="col-6">
                  <label className="ff-form-label">Scheduled Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    className="ff-form-control"
                    value={formData.scheduledStart}
                    onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="ff-form-label">Estimated Completion</label>
                  <input
                    type="datetime-local"
                    className="ff-form-control"
                    value={formData.scheduledEnd}
                    onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                  marginBottom: 16
                }}
              >
                <h6 style={{ fontWeight: 700, margin: '0 0 10px' }}>Dispatch Review Summary</h6>
                <div className="row g-2" style={{ fontSize: '0.85rem' }}>
                  <div className="col-6">
                    <span style={{ color: 'var(--text-muted)' }}>Origin:</span>{' '}
                    <strong>{formData.origin}</strong>
                  </div>
                  <div className="col-6">
                    <span style={{ color: 'var(--text-muted)' }}>Destination:</span>{' '}
                    <strong>{formData.destination}</strong>
                  </div>
                  <div className="col-6">
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Distance:</span>{' '}
                    <strong>{formData.distanceKm} km</strong>
                  </div>
                  <div className="col-6">
                    <span style={{ color: 'var(--text-muted)' }}>Priority:</span>{' '}
                    <strong>{formData.priority}</strong>
                  </div>
                  <div className="col-6">
                    <span style={{ color: 'var(--text-muted)' }}>Vehicle:</span>{' '}
                    <strong>{selectedVehicle ? selectedVehicle.registrationNumber : 'Unassigned'}</strong>
                  </div>
                  <div className="col-6">
                    <span style={{ color: 'var(--text-muted)' }}>Driver:</span>{' '}
                    <strong>{selectedDriver ? `${selectedDriver.firstName} ${selectedDriver.lastName}` : 'Unassigned'}</strong>
                  </div>
                  <div className="col-12">
                    <span style={{ color: 'var(--text-muted)' }}>Scheduled Start:</span>{' '}
                    <strong>{new Date(formData.scheduledStart).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <label className="ff-form-label">Dispatch Notes & Instructions</label>
                <textarea
                  rows="2"
                  className="ff-form-control"
                  placeholder="Gate instructions, bill of lading references..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="ff-modal-footer">
          {step > 1 && (
            <button type="button" className="ff-btn ff-btn-outline" onClick={() => setStep(step - 1)}>
              Previous
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              className="ff-btn ff-btn-primary"
              disabled={step === 1 && (!formData.origin || !formData.destination)}
              onClick={() => setStep(step + 1)}
            >
              Continue to Step {step + 1}
            </button>
          ) : (
            <button type="button" className="ff-btn ff-btn-primary" disabled={loading} onClick={handleSubmit}>
              {loading ? 'Dispatching...' : 'Confirm & Create Trip'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripModal;
