import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Phone, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import UserModal from './UserModal';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users', {
        params: {
          role: roleFilter !== 'ALL' ? roleFilter : undefined,
          limit: 50
        }
      });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/admin/users/${deleteTarget._id}`);
      showSuccess('User account deactivated successfully');
      fetchUsers();
      setDeleteTarget(null);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    return fullName.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>User Management &amp; Access</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Invite staff members, assign system roles, and configure organization credentials.
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem' }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 auto' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Administrator</option>
            <option value="FLEET_MANAGER">Fleet Manager</option>
            <option value="DISPATCHER">Dispatcher</option>
            <option value="OPERATIONS_MANAGER">Operations Manager</option>
            <option value="FINANCE_MANAGER">Finance Manager</option>
            <option value="SAFETY_MANAGER">Safety Manager</option>
            <option value="DRIVER">Driver</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <SkeletonLoader count={5} height={48} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState 
            icon={Users} 
            title="No Users Found" 
            message="No active team members matched your active query."
            actionText="Create First User"
            onAction={() => {
              setEditingUser(null);
              setModalOpen(true);
            }}
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8125rem' }}>
                          {u.firstName ? u.firstName[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', fontWeight: 600 }}>
                        {u.role ? u.role.replace('_', ' ') : 'STAFF'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>
                        {u.phone ? <span>{u.phone}</span> : <span style={{ color: 'var(--text-muted)' }}>No phone</span>}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={u.status || 'ACTIVE'} />
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.3rem 0.5rem' }}
                          onClick={() => {
                            setEditingUser(u);
                            setModalOpen(true);
                          }}
                          title="Edit User"
                        >
                          <Edit size={14} />
                        </button>
                        {currentUser?._id !== u._id && (
                          <button
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.5rem', color: '#EF4444' }}
                            onClick={() => setDeleteTarget(u)}
                            title="Deactivate Account"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchUsers}
        userToEdit={editingUser}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Deactivate User Account"
        message={`Are you sure you want to deactivate ${deleteTarget?.firstName} ${deleteTarget?.lastName} (${deleteTarget?.email})? They will lose access to the system.`}
        confirmText="Deactivate"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
