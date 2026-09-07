import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, User, Mail, Lock, Phone, Shield } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ROLES = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'FLEET_MANAGER', label: 'Fleet Manager' },
  { value: 'DISPATCHER', label: 'Dispatcher' },
  { value: 'OPERATIONS_MANAGER', label: 'Operations Manager' },
  { value: 'FINANCE_MANAGER', label: 'Finance Manager' },
  { value: 'SAFETY_MANAGER', label: 'Safety Officer' },
  { value: 'DRIVER', label: 'Driver' }
];

export default function UserModal({ isOpen, onClose, onSuccess, userToEdit }) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'DISPATCHER',
    status: 'ACTIVE',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        firstName: userToEdit.firstName || '',
        lastName: userToEdit.lastName || '',
        email: userToEdit.email || '',
        phone: userToEdit.phone || '',
        role: userToEdit.role || 'DISPATCHER',
        status: userToEdit.status || 'ACTIVE',
        password: '' // empty unless changing
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'DISPATCHER',
        status: 'ACTIVE',
        password: ''
      });
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (userToEdit) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await axios.put(`/api/admin/users/${userToEdit._id}`, payload);
        showSuccess('User account updated successfully');
      } else {
        await axios.post('/api/admin/users', formData);
        showSuccess('User account created successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save user account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 540 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
            {userToEdit ? 'Edit User Account' : 'Create New User Account'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                disabled={Boolean(userToEdit)}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: userToEdit ? 'var(--bg-surface-alt)' : 'var(--bg-input)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-0199"
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                System Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive / Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              {userToEdit ? 'New Password (leave blank to keep current)' : 'Initial Password *'}
            </label>
            <input
              type="password"
              required={!userToEdit}
              placeholder={userToEdit ? '••••••••' : 'Enter secure password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Save size={16} /> {submitting ? 'Saving...' : userToEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
