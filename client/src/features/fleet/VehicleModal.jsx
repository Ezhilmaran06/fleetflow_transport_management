import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const VehicleModal = ({ isOpen, onClose, onSaved, vehicle = null }) => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'TRUCK',
    fuelType: 'DIESEL',
    mileage: 0,
    fuelLevel: 100,
    capacityKg: 5000,
    vehicleGroup: '',
    notes: ''
  });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Fetch groups
      axiosClient.get('/vehicles/groups').then((res) => setGroups(res.data)).catch(() => {});

      if (vehicle) {
        setFormData({
          registrationNumber: vehicle.registrationNumber || '',
          vin: vehicle.vin || '',
          make: vehicle.make || '',
          model: vehicle.model || '',
          year: vehicle.year || new Date().getFullYear(),
          type: vehicle.type || 'TRUCK',
          fuelType: vehicle.fuelType || 'DIESEL',
          mileage: vehicle.mileage || 0,
          fuelLevel: vehicle.fuelLevel || 100,
          capacityKg: vehicle.capacityKg || 0,
          vehicleGroup: vehicle.vehicleGroup?._id || vehicle.vehicleGroup || '',
          notes: vehicle.notes || ''
        });
      } else {
        setFormData({
          registrationNumber: '',
          vin: '',
          make: '',
          model: '',
          year: new Date().getFullYear(),
          type: 'TRUCK',
          fuelType: 'DIESEL',
          mileage: 0,
          fuelLevel: 100,
          capacityKg: 5000,
          vehicleGroup: '',
          notes: ''
        });
      }
    }
  }, [isOpen, vehicle]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (vehicle) {
        await axiosClient.put(`/vehicles/${vehicle._id}`, formData);
        showToast('Vehicle updated successfully', 'success');
      } else {
        await axiosClient.post('/vehicles', formData);
        showToast('Vehicle added to fleet successfully', 'success');
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
      <div className="ff-modal" style={{ maxWidth: 600 }}>
        <div className="ff-modal-header">
          <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            {vehicle ? 'Edit Fleet Vehicle' : 'Register New Fleet Asset'}
          </h5>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ff-modal-body">
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Registration Number *</label>
                <input
                  type="text"
                  required
                  name="registrationNumber"
                  className="ff-form-control"
                  placeholder="e.g. TRK-8821"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="col-6">
                <label className="ff-form-label">VIN / Chassis Number</label>
                <input
                  type="text"
                  name="vin"
                  className="ff-form-control"
                  placeholder="1HTMK..."
                  value={formData.vin}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-4">
                <label className="ff-form-label">Make *</label>
                <input
                  type="text"
                  required
                  name="make"
                  className="ff-form-control"
                  placeholder="Volvo / Freightliner"
                  value={formData.make}
                  onChange={handleChange}
                />
              </div>
              <div className="col-5">
                <label className="ff-form-label">Model *</label>
                <input
                  type="text"
                  required
                  name="model"
                  className="ff-form-control"
                  placeholder="Cascadia / FH16"
                  value={formData.model}
                  onChange={handleChange}
                />
              </div>
              <div className="col-3">
                <label className="ff-form-label">Year *</label>
                <input
                  type="number"
                  required
                  name="year"
                  className="ff-form-control"
                  value={formData.year}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Vehicle Type</label>
                <select name="type" className="ff-form-control" value={formData.type} onChange={handleChange}>
                  <option value="TRUCK">Heavy Truck</option>
                  <option value="VAN">Delivery Van</option>
                  <option value="TRAILER">Trailer</option>
                  <option value="EV">Electric Vehicle (EV)</option>
                  <option value="CONTAINER">Container</option>
                  <option value="SEDAN">Fleet Sedan</option>
                </select>
              </div>
              <div className="col-6">
                <label className="ff-form-label">Fuel Type</label>
                <select name="fuelType" className="ff-form-control" value={formData.fuelType} onChange={handleChange}>
                  <option value="DIESEL">Diesel</option>
                  <option value="PETROL">Petrol</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-4">
                <label className="ff-form-label">Initial Mileage (km)</label>
                <input
                  type="number"
                  name="mileage"
                  className="ff-form-control"
                  value={formData.mileage}
                  onChange={handleChange}
                />
              </div>
              <div className="col-4">
                <label className="ff-form-label">Payload Capacity (kg)</label>
                <input
                  type="number"
                  name="capacityKg"
                  className="ff-form-control"
                  value={formData.capacityKg}
                  onChange={handleChange}
                />
              </div>
              <div className="col-4">
                <label className="ff-form-label">Vehicle Group</label>
                <select
                  name="vehicleGroup"
                  className="ff-form-control"
                  value={formData.vehicleGroup}
                  onChange={handleChange}
                >
                  <option value="">None (Standard)</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-2">
              <label className="ff-form-label">Notes & Operational Constraints</label>
              <textarea
                name="notes"
                rows="2"
                className="ff-form-control"
                placeholder="Air suspension, refrigeration unit, tail lift..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ff-modal-footer">
            <button type="button" className="ff-btn ff-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ff-btn ff-btn-primary" disabled={loading}>
              {loading ? 'Saving to Database...' : vehicle ? 'Save Changes' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleModal;
