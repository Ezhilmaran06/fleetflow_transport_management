import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Shield, 
  Save, 
  CheckSquare, 
  Square, 
  Info, 
  Check, 
  Lock 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const MODULES = [
  { id: 'vehicles', label: 'Fleet & Vehicles' },
  { id: 'drivers', label: 'Driver Operations' },
  { id: 'trips', label: 'Trips & Dispatch' },
  { id: 'deliveries', label: 'Deliveries & Proof of Delivery' },
  { id: 'maintenance', label: 'Work Orders & Maintenance' },
  { id: 'finance', label: 'Expenses, Fuel & Budgets' },
  { id: 'safety', label: 'Incidents & Compliance' },
  { id: 'reports', label: 'Operational Reports' },
  { id: 'communication', label: 'Messaging & Broadcasts' },
  { id: 'admin', label: 'System Administration' }
];

const ACTIONS = ['view', 'create', 'edit', 'delete'];

export default function RolesPermissionsPage() {
  const { showSuccess, showError } = useToast();
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/roles');
      const data = res.data.data || [];
      setRoles(data);
      if (data.length > 0) {
        selectRole(data[0]);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (role) => {
    setSelectedRoleId(role._id);
    setDescription(role.description || '');
    
    // Parse permissions array into map: { module: [actions] }
    const permMap = {};
    MODULES.forEach(m => { permMap[m.id] = []; });

    if (role.name === 'ADMIN' || role.name === 'SUPER_ADMIN') {
      // Full access for ADMIN
      MODULES.forEach(m => { permMap[m.id] = [...ACTIONS]; });
    } else if (role.permissions && Array.isArray(role.permissions)) {
      role.permissions.forEach(p => {
        if (p.module && p.actions) {
          permMap[p.module] = [...p.actions];
        }
      });
    }
    setPermissions(permMap);
  };

  const toggleAction = (moduleId, action) => {
    const currentActions = permissions[moduleId] || [];
    let updated;
    if (currentActions.includes(action)) {
      updated = currentActions.filter(a => a !== action);
    } else {
      updated = [...currentActions, action];
    }
    setPermissions({
      ...permissions,
      [moduleId]: updated
    });
  };

  const toggleAllForModule = (moduleId) => {
    const currentActions = permissions[moduleId] || [];
    if (currentActions.length === ACTIONS.length) {
      setPermissions({ ...permissions, [moduleId]: [] });
    } else {
      setPermissions({ ...permissions, [moduleId]: [...ACTIONS] });
    }
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      // Transform map back to array
      const permArray = Object.keys(permissions).map(module => ({
        module,
        actions: permissions[module]
      }));

      await axios.put(`/api/admin/roles/${selectedRoleId}/permissions`, {
        permissions: permArray,
        description
      });
      showSuccess('Role permissions saved successfully');
      
      // Update local role list
      setRoles(roles.map(r => r._id === selectedRoleId ? { ...r, description, permissions: permArray } : r));
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update role permissions');
    } finally {
      setSaving(false);
    }
  };

  const currentRole = roles.find(r => r._id === selectedRoleId);
  const isAdminRole = currentRole?.name === 'ADMIN' || currentRole?.name === 'SUPER_ADMIN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Roles &amp; Permission Matrix</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Fine-grained role-based authorization matrix governing modules and operations.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || isAdminRole}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '2rem' }}>
          <SkeletonLoader count={6} height={40} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Role Selector Sidebar */}
          <div className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ padding: '0.5rem 0.75rem', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              System Roles
            </div>
            {roles.map(role => {
              const active = role._id === selectedRoleId;
              return (
                <button
                  key={role._id}
                  onClick={() => selectRole(role)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 6,
                    border: 'none',
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: active ? 600 : 500,
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{role.name.replace(/_/g, ' ')}</span>
                  {role.name === 'ADMIN' && <Lock size={13} style={{ opacity: active ? 0.9 : 0.4 }} />}
                </button>
              );
            })}
          </div>

          {/* Matrix Workspace */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Role Summary Banner */}
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>
                  {currentRole?.name.replace(/_/g, ' ')} Permissions
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {isAdminRole ? 'Full system administrator bypass with unrestricted read, write, and delete permissions.' : (description || 'Configure access policies for this role.')}
                </p>
              </div>

              {isAdminRole && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.35rem 0.75rem', borderRadius: 6, background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <Shield size={14} /> Immutable Master Role
                </div>
              )}
            </div>

            {/* Matrix Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Functional Module</th>
                      <th style={{ textAlign: 'center' }}>View</th>
                      <th style={{ textAlign: 'center' }}>Create</th>
                      <th style={{ textAlign: 'center' }}>Edit</th>
                      <th style={{ textAlign: 'center' }}>Delete</th>
                      <th style={{ textAlign: 'center' }}>Toggle All</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map(mod => {
                      const modActions = permissions[mod.id] || [];
                      const allSelected = modActions.length === ACTIONS.length;

                      return (
                        <tr key={mod.id}>
                          <td style={{ fontWeight: 600 }}>
                            {mod.label}
                          </td>
                          {ACTIONS.map(action => {
                            const isChecked = isAdminRole || modActions.includes(action);
                            return (
                              <td key={action} style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isAdminRole}
                                  onChange={() => toggleAction(mod.id, action)}
                                  style={{ width: 18, height: 18, cursor: isAdminRole ? 'not-allowed' : 'pointer' }}
                                />
                              </td>
                            );
                          })}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-outline"
                              disabled={isAdminRole}
                              onClick={() => toggleAllForModule(mod.id)}
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              {allSelected ? 'None' : 'All'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
