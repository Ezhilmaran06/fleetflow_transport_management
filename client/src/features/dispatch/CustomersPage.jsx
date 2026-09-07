import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import CustomerModal from './CustomerModal';
import { useToast } from '../../context/ToastContext';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showToast } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/customers', { params: { search } });
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    setDeleteLoading(true);
    try {
      await axiosClient.delete(`/customers/${deletingCustomer._id}`);
      showToast('Customer account deactivated', 'success');
      setDeletingCustomer(null);
      fetchCustomers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Building2 size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Customer Directory</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Shippers, consignees, and third-party logistics accounts
          </span>
        </div>

        <button
          className="ff-btn ff-btn-primary"
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} /> Onboard Customer
        </button>
      </div>

      <div className="ff-card p-3 mb-4">
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <input
            type="text"
            className="ff-form-control"
            placeholder="Search customers, contact person, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={4} />
      ) : customers.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={Building2}
            title="No Customers Enrolled"
            description="Register customer facilities to link deliveries and track delivery locations."
            actionLabel="Onboard Customer"
            onAction={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="ff-table-container">
          <table className="ff-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Client Code</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address & City</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td>
                    <span className="ff-badge ff-badge-secondary">{c.code || 'STD'}</span>
                  </td>
                  <td>{c.contactPerson || 'N/A'}</td>
                  <td>{c.email || 'N/A'}</td>
                  <td>{c.phone || 'N/A'}</td>
                  <td>
                    {c.address ? `${c.address}, ${c.city || ''}` : 'Standard facility'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="d-inline-flex gap-1">
                      <button
                        className="ff-btn ff-btn-outline ff-btn-sm"
                        onClick={() => {
                          setEditingCustomer(c);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="ff-btn ff-btn-outline ff-btn-sm text-danger"
                        onClick={() => setDeletingCustomer(c)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchCustomers}
        customer={editingCustomer}
      />

      <ConfirmModal
        isOpen={!!deletingCustomer}
        title="Deactivate Customer"
        message={`Are you sure you want to deactivate customer account '${deletingCustomer?.name}'?`}
        confirmText="Deactivate"
        isDanger={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCustomer(null)}
      />
    </div>
  );
};

export default CustomersPage;
