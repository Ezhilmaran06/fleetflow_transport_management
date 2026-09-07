import React, { useState, useEffect } from 'react';
import { X, AlertOctagon } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const IncidentModal = ({ isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    title: '',
    vehicleId: '',
    driverId: '',
    severity: 'MEDIUM',
    incidentDate: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    actionTaken: ''
  });

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      axiosClient.get('/vehicles?limit=100').then((res) => setVehicles(res.data)).catch(() => {});
      axiosClient.get('/drivers?limit=100').then((res) => setDrivers(res.data)).catch(() => {});
      setFormData({
        title: '',
        vehicleId: '',
        driverId: '',
        severity: 'MEDIUM',
        incidentDate: new Date().toISOString().split('T')[0],
        location: '',
        description: '',
        actionTaken: ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.description) {
      showToast('Title, location, and description are required', 'warning');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/safety', formData);
      showToast('Incident logged and safety alert dispatched', 'success');
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
      <div className="ff-modal" style={{ maxWidth: 560 }}>
        <div className="ff-modal-header">
          <div className="d-flex align-items-center gap-2">
            <AlertOctagon size={18} color="var(--ff-danger)" />
            <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Log Safety & Fleet Incident</h5>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ff-modal-body">
            <div className="mb-3">
              <label className="ff-form-label">Incident Title *</label>
              <input
                type="text"
                required
                name="title"
                className="ff-form-control"
                placeholder="e.g. Minor collision at loading dock, flat tire blowout"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Severity Level</label>
                <select name="severity" className="ff-form-control" value={formData.severity} onChange={handleChange}>
                  <option value="LOW">Low (Minor scratch / Near miss)</option>
                  <option value="MEDIUM">Medium (Minor damage / Delayed)</option>
                  <option value="HIGH">High (Equipment damage / Tow needed)</option>
                  <option value="CRITICAL">Critical (Injury / Major collision)</option>
                </select>
              </div>

              <div className="col-6">
                <label className="ff-form-label">Incident Date *</label>
                <input
                  type="date"
                  required
                  name="incidentDate"
                  className="ff-form-control"
                  value={formData.incidentDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Vehicle Involved</label>
                <select name="vehicleId" className="ff-form-control" value={formData.vehicleId} onChange={handleChange}>
                  <option value="">None / Facility Incident</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} ({v.make} {v.model})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-6">
                <label className="ff-form-label">Operator Involved</label>
                <select name="driverId" className="ff-form-control" value={formData.driverId} onChange={handleChange}>
                  <option value="">None / Third Party</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.firstName} {d.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="ff-form-label">Location / Address *</label>
              <input
                type="text"
                required
                name="location"
                className="ff-form-control"
                placeholder="Highway I-90 Mile Marker 42 / Chicago Depot"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="ff-form-label">Factual Description of Incident *</label>
              <textarea
                rows="2"
                required
                name="description"
                className="ff-form-control"
                placeholder="Describe circumstances, weather, conditions..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="ff-form-label">Immediate Action Taken</label>
              <input
                type="text"
                name="actionTaken"
                className="ff-form-control"
                placeholder="Police report filed, driver dispatched replacement tire..."
                value={formData.actionTaken}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ff-modal-footer">
            <button type="button" className="ff-btn ff-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ff-btn ff-btn-danger" disabled={loading}>
              {loading ? 'Logging Incident...' : 'Submit Incident Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentModal;
