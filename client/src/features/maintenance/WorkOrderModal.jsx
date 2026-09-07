import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const WorkOrderModal = ({ isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    issueDescription: '',
    priority: 'MEDIUM',
    serviceType: 'ROUTINE',
    technician: '',
    scheduledDate: '',
    estimatedCost: 250,
    notes: ''
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      axiosClient.get('/vehicles?limit=100').then((res) => setVehicles(res.data)).catch(() => {});
      const now = new Date();
      now.setDate(now.getDate() + 1);
      setFormData({
        vehicleId: '',
        issueDescription: '',
        priority: 'MEDIUM',
        serviceType: 'ROUTINE',
        technician: '',
        scheduledDate: now.toISOString().split('T')[0],
        estimatedCost: 250,
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
    if (!formData.vehicleId || !formData.issueDescription) {
      showToast('Vehicle and issue description are required', 'warning');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/maintenance', formData);
      showToast('Maintenance work order scheduled', 'success');
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
          <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Create Maintenance Work Order</h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ff-modal-body">
            <div className="mb-3">
              <label className="ff-form-label">Fleet Vehicle *</label>
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
                    {v.registrationNumber} — {v.make} {v.model} ({v.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Service Type</label>
                <select
                  name="serviceType"
                  className="ff-form-control"
                  value={formData.serviceType}
                  onChange={handleChange}
                >
                  <option value="ROUTINE">Routine Maintenance</option>
                  <option value="REPAIR">Corrective Repair</option>
                  <option value="INSPECTION">DOT / Safety Inspection</option>
                  <option value="TIRE_SERVICE">Tire Rotation & Replacement</option>
                  <option value="EMERGENCY">Emergency Breakdown</option>
                </select>
              </div>

              <div className="col-6">
                <label className="ff-form-label">Priority</label>
                <select
                  name="priority"
                  className="ff-form-control"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical Urgent</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="ff-form-label">Issue Description *</label>
              <input
                type="text"
                required
                name="issueDescription"
                className="ff-form-control"
                placeholder="e.g. Brake pad wear warning, oil change interval reached"
                value={formData.issueDescription}
                onChange={handleChange}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Assigned Technician / Shop</label>
                <input
                  type="text"
                  name="technician"
                  className="ff-form-control"
                  placeholder="Certified Fleet Services"
                  value={formData.technician}
                  onChange={handleChange}
                />
              </div>

              <div className="col-6">
                <label className="ff-form-label">Estimated Cost ($)</label>
                <input
                  type="number"
                  name="estimatedCost"
                  className="ff-form-control"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="ff-form-label">Scheduled Date *</label>
              <input
                type="date"
                required
                name="scheduledDate"
                className="ff-form-control"
                value={formData.scheduledDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ff-modal-footer">
            <button type="button" className="ff-btn ff-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ff-btn ff-btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Schedule Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkOrderModal;
