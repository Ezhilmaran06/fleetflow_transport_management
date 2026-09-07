import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const ExpenseModal = ({ isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    category: 'TOLL',
    amount: 50,
    description: '',
    vehicleId: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      axiosClient.get('/vehicles?limit=100').then((res) => setVehicles(res.data)).catch(() => {});
      setFormData({
        category: 'TOLL',
        amount: 50,
        description: '',
        vehicleId: '',
        date: new Date().toISOString().split('T')[0]
      });
      setReceiptFile(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      showToast('Amount and description are required', 'warning');
      return;
    }

    setLoading(true);
    const postData = new FormData();
    postData.append('category', formData.category);
    postData.append('amount', formData.amount);
    postData.append('description', formData.description);
    postData.append('date', formData.date);
    if (formData.vehicleId) postData.append('vehicleId', formData.vehicleId);
    if (receiptFile) postData.append('receipt', receiptFile);

    try {
      await axiosClient.post('/expenses', postData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Expense claim submitted for approval', 'success');
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
          <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Submit Operating Expense</h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ff-modal-body">
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Expense Category *</label>
                <select name="category" className="ff-form-control" value={formData.category} onChange={handleChange}>
                  <option value="TOLL">Highway Toll</option>
                  <option value="PARKING">Parking / Terminal Storage</option>
                  <option value="MAINTENANCE">Parts & Minor Repairs</option>
                  <option value="TIRES">Tires & Alignment</option>
                  <option value="INSURANCE">Insurance / Claims</option>
                  <option value="PERMITS">Oversize / State Permits</option>
                  <option value="LODGING">Driver Lodging / Meals</option>
                  <option value="MISC">Miscellaneous</option>
                </select>
              </div>

              <div className="col-6">
                <label className="ff-form-label">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="amount"
                  className="ff-form-control"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="ff-form-label">Description & Purpose *</label>
              <input
                type="text"
                required
                name="description"
                className="ff-form-control"
                placeholder="e.g. Turnpike toll pass, tire patch repair"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Vehicle (Optional)</label>
                <select name="vehicleId" className="ff-form-control" value={formData.vehicleId} onChange={handleChange}>
                  <option value="">General Fleet / Unassigned</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} ({v.make})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-6">
                <label className="ff-form-label">Transaction Date</label>
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
              <label className="ff-form-label">Attach Receipt Photo / Invoice</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="ff-form-control"
                onChange={(e) => setReceiptFile(e.target.files[0])}
              />
            </div>
          </div>

          <div className="ff-modal-footer">
            <button type="button" className="ff-btn ff-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ff-btn ff-btn-primary" disabled={loading}>
              <Upload size={14} />
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
