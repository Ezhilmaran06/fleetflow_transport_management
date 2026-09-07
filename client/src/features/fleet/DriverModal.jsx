import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const DriverModal = ({ isOpen, onClose, onSaved, driver = null }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseCategory: 'HEAVY_COMMERCIAL',
    licenseExpiry: '',
    status: 'AVAILABLE',
    emergencyName: '',
    emergencyPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (driver) {
        setFormData({
          firstName: driver.firstName || '',
          lastName: driver.lastName || '',
          email: driver.email || '',
          phone: driver.phone || '',
          licenseNumber: driver.licenseNumber || '',
          licenseCategory: driver.licenseCategory || 'HEAVY_COMMERCIAL',
          licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '',
          status: driver.status || 'AVAILABLE',
          emergencyName: driver.emergencyContact?.name || '',
          emergencyPhone: driver.emergencyContact?.phone || ''
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          licenseNumber: '',
          licenseCategory: 'HEAVY_COMMERCIAL',
          licenseExpiry: '',
          status: 'AVAILABLE',
          emergencyName: '',
          emergencyPhone: ''
        });
      }
    }
  }, [isOpen, driver]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      licenseNumber: formData.licenseNumber,
      licenseCategory: formData.licenseCategory,
      licenseExpiry: formData.licenseExpiry,
      status: formData.status,
      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone
      }
    };

    try {
      if (driver) {
        await axiosClient.put(`/drivers/${driver._id}`, payload);
        showToast('Driver profile updated', 'success');
      } else {
        await axiosClient.post('/drivers', payload);
        showToast('Driver enrolled successfully', 'success');
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
      <div className="ff-modal" style={{ maxWidth: 580 }}>
        <div className="ff-modal-header">
          <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            {driver ? 'Edit Driver Profile' : 'Onboard Driver'}
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
                <label className="ff-form-label">First Name *</label>
                <input
                  type="text"
                  required
                  name="firstName"
                  className="ff-form-control"
                  placeholder="Carlos"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-6">
                <label className="ff-form-label">Last Name *</label>
                <input
                  type="text"
                  required
                  name="lastName"
                  className="ff-form-control"
                  placeholder="Ramirez"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-7">
                <label className="ff-form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  name="email"
                  className="ff-form-control"
                  placeholder="carlos@fleetflow.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="col-5">
                <label className="ff-form-label">Phone *</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  className="ff-form-control"
                  placeholder="+1 555-0144"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Commercial License Number *</label>
                <input
                  type="text"
                  required
                  name="licenseNumber"
                  className="ff-form-control"
                  placeholder="CDL-992144"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="col-6">
                <label className="ff-form-label">License Expiry Date *</label>
                <input
                  type="date"
                  required
                  name="licenseExpiry"
                  className="ff-form-control"
                  value={formData.licenseExpiry}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">License Class</label>
                <select
                  name="licenseCategory"
                  className="ff-form-control"
                  value={formData.licenseCategory}
                  onChange={handleChange}
                >
                  <option value="HEAVY_COMMERCIAL">Class A (Heavy Commercial / Articulated)</option>
                  <option value="MEDIUM_RIGID">Class B (Medium Rigid / Bus)</option>
                  <option value="LIGHT_RIGID">Class C (Light Rigid / Van)</option>
                  <option value="HAZMAT">Hazmat Certified</option>
                </select>
              </div>
              <div className="col-6">
                <label className="ff-form-label">Operational Status</label>
                <select name="status" className="ff-form-control" value={formData.status} onChange={handleChange}>
                  <option value="AVAILABLE">Available</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                Emergency Contact
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <input
                    type="text"
                    name="emergencyName"
                    className="ff-form-control"
                    placeholder="Contact Name"
                    value={formData.emergencyName}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="tel"
                    name="emergencyPhone"
                    className="ff-form-control"
                    placeholder="Contact Phone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="ff-modal-footer">
            <button type="button" className="ff-btn ff-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ff-btn ff-btn-primary" disabled={loading}>
              {loading ? 'Saving to Database...' : driver ? 'Save Changes' : 'Onboard Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverModal;
