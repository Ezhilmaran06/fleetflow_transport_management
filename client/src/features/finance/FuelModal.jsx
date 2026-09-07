import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const FuelModal = ({ isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    liters: 120,
    cost: 210,
    odometer: 10000,
    stationName: 'Shell Commercial Terminal',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      axiosClient.get('/vehicles?limit=100').then((res) => setVehicles(res.data)).catch(() => {});
      setFormData({
        vehicleId: '',
        liters: 120,
        cost: 210,
        odometer: 10000,
        stationName: 'Shell Commercial Terminal',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.liters || !formData.cost) {
      showToast('Please fill all required fuel fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/fuel', formData);
      showToast('Fuel transaction logged & odometer updated', 'success');
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
      <div className="ff-modal" style={{ maxWidth: 520 }}>
        <div className="ff-modal-header">
          <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Log Fuel Refill Transaction</h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ff-modal-body">
            <div className="mb-3">
              <label className="ff-form-label">Fleet Asset *</label>
              <select
                required
                name="vehicleId"
                className="ff-form-control"
                value={formData.vehicleId}
                onChange={handleChange}
              >
                <option value="">Select vehicle...</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.registrationNumber} — {v.make} {v.model} ({v.mileage} km)
                  </option>
                ))}
              </select>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Fuel Volume (Liters) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  name="liters"
                  className="ff-form-control"
                  value={formData.liters}
                  onChange={handleChange}
                />
              </div>

              <div className="col-6">
                <label className="ff-form-label">Total Cost ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="cost"
                  className="ff-form-control"
                  value={formData.cost}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Current Odometer (km) *</label>
                <input
                  type="number"
                  required
                  name="odometer"
                  className="ff-form-control"
                  value={formData.odometer}
                  onChange={handleChange}
                />
              </div>

              <div className="col-6">
                <label className="ff-form-label">Date *</label>
                <input
                  type="date"
                  required
                  name="date"
                  className="ff-form-control"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="ff-form-label">Fuel Station / Depot</label>
              <input
                type="text"
                name="stationName"
                className="ff-form-control"
                placeholder="Love's Travel Stop #42"
                value={formData.stationName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ff-modal-footer">
            <button type="button" className="ff-btn ff-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ff-btn ff-btn-primary" disabled={loading}>
              {loading ? 'Logging...' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuelModal;
