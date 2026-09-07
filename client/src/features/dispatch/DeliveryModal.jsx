import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const DeliveryModal = ({ isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    tripId: '',
    pickupAddress: '',
    dropoffAddress: '',
    packageDescription: '',
    weightKg: 10,
    pieces: 1,
    estimatedDeliveryTime: ''
  });

  const [customers, setCustomers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      axiosClient.get('/customers').then((res) => setCustomers(res.data)).catch(() => {});
      axiosClient.get('/trips?status=ASSIGNED,READY,UNASSIGNED&limit=50').then((res) => setTrips(res.data)).catch(() => {});

      setFormData({
        customerId: '',
        tripId: '',
        pickupAddress: '',
        dropoffAddress: '',
        packageDescription: '',
        weightKg: 10,
        pieces: 1,
        estimatedDeliveryTime: ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomerChange = (e) => {
    const cId = e.target.value;
    const selected = customers.find((c) => c._id === cId);
    setFormData((prev) => ({
      ...prev,
      customerId: cId,
      dropoffAddress: selected?.address ? `${selected.address}, ${selected.city || ''}` : prev.dropoffAddress
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.pickupAddress || !formData.dropoffAddress) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/deliveries', formData);
      showToast('Delivery created and scheduled', 'success');
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
          <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Create Delivery Order</h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ff-modal-body">
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Customer *</label>
                <select
                  required
                  name="customerId"
                  className="ff-form-control"
                  value={formData.customerId}
                  onChange={handleCustomerChange}
                >
                  <option value="">Select Customer...</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.city || 'Standard'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-6">
                <label className="ff-form-label">Assign to Trip (Optional)</label>
                <select
                  name="tripId"
                  className="ff-form-control"
                  value={formData.tripId}
                  onChange={handleChange}
                >
                  <option value="">Unassigned (Direct Warehouse)</option>
                  {trips.map((t) => (
                    <option key={t._id} value={t._id}>
                      #{t.tripNumber} ({t.origin} → {t.destination})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="ff-form-label">Pickup Address *</label>
              <input
                type="text"
                required
                name="pickupAddress"
                className="ff-form-control"
                placeholder="Central Depot, Bay 4, Chicago IL"
                value={formData.pickupAddress}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="ff-form-label">Dropoff / Delivery Address *</label>
              <input
                type="text"
                required
                name="dropoffAddress"
                className="ff-form-control"
                placeholder="Customer Facility, 4400 Grand Ave"
                value={formData.dropoffAddress}
                onChange={handleChange}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Package Description</label>
                <input
                  type="text"
                  name="packageDescription"
                  className="ff-form-control"
                  placeholder="Automotive parts / Palletized freight"
                  value={formData.packageDescription}
                  onChange={handleChange}
                />
              </div>

              <div className="col-3">
                <label className="ff-form-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weightKg"
                  className="ff-form-control"
                  value={formData.weightKg}
                  onChange={handleChange}
                />
              </div>

              <div className="col-3">
                <label className="ff-form-label">Pieces</label>
                <input
                  type="number"
                  name="pieces"
                  className="ff-form-control"
                  value={formData.pieces}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="ff-form-label">Estimated Delivery Target</label>
              <input
                type="datetime-local"
                name="estimatedDeliveryTime"
                className="ff-form-control"
                value={formData.estimatedDeliveryTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ff-modal-footer">
            <button type="button" className="ff-btn ff-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ff-btn ff-btn-primary" disabled={loading}>
              {loading ? 'Creating Order...' : 'Create Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryModal;
