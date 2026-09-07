import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const CustomerModal = ({ isOpen, onClose, onSaved, customer = null }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setName(customer.name || '');
        setCode(customer.code || '');
        setContactPerson(customer.contactPerson || '');
        setEmail(customer.email || '');
        setPhone(customer.phone || '');
        setAddress(customer.address || '');
        setCity(customer.city || '');
      } else {
        setName('');
        setCode('');
        setContactPerson('');
        setEmail('');
        setPhone('');
        setAddress('');
        setCity('');
      }
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { name, code, contactPerson, email, phone, address, city };

    try {
      if (customer) {
        await axiosClient.put(`/customers/${customer._id}`, payload);
        showToast('Customer account updated', 'success');
      } else {
        await axiosClient.post('/customers', payload);
        showToast('Customer onboarded successfully', 'success');
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
      <div className="ff-modal" style={{ maxWidth: 520 }}>
        <div className="ff-modal-header">
          <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>
            {customer ? 'Edit Customer Account' : 'Onboard Customer Account'}
          </h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ff-modal-body">
            <div className="row g-3 mb-3">
              <div className="col-8">
                <label className="ff-form-label">Company / Client Name *</label>
                <input
                  type="text"
                  required
                  className="ff-form-control"
                  placeholder="Acme Global Logistics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label className="ff-form-label">Client Code</label>
                <input
                  type="text"
                  className="ff-form-control"
                  placeholder="ACME"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ff-form-label">Contact Person</label>
                <input
                  type="text"
                  className="ff-form-control"
                  placeholder="Sarah Jenkins"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="ff-form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="ff-form-control"
                  placeholder="+1 555-0182"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="ff-form-label">Email Address</label>
              <input
                type="email"
                className="ff-form-control"
                placeholder="logistics@acmeglobal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="row g-3 mb-2">
              <div className="col-8">
                <label className="ff-form-label">Primary Facility Address</label>
                <input
                  type="text"
                  className="ff-form-control"
                  placeholder="100 Industrial Parkway"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label className="ff-form-label">City</label>
                <input
                  type="text"
                  className="ff-form-control"
                  placeholder="Chicago"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="ff-modal-footer">
            <button type="button" className="ff-btn ff-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ff-btn ff-btn-primary" disabled={loading}>
              {loading ? 'Saving...' : customer ? 'Save Changes' : 'Register Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
