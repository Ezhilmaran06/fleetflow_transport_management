import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Folder } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

const VehicleGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/vehicles/groups');
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await axiosClient.post('/vehicles/groups', { name, description });
      showToast('Vehicle group created', 'success');
      setName('');
      setDescription('');
      setShowCreateModal(false);
      fetchGroups();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <Layers size={22} color="var(--ff-primary)" />
            <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>Vehicle Groups & Fleets</h2>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Segment vehicle assets by operational unit, region, or equipment type
          </span>
        </div>

        <button className="ff-btn ff-btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Create Group
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={4} />
      ) : groups.length === 0 ? (
        <div className="ff-card">
          <EmptyState
            icon={Folder}
            title="No Vehicle Groups Created"
            description="Organize your vehicles into specialized groups (e.g. Long-Haul, Refrigerated, Last-Mile)."
            actionLabel="Create Group"
            onAction={() => setShowCreateModal(true)}
          />
        </div>
      ) : (
        <div className="row g-3">
          {groups.map((g) => (
            <div className="col-12 col-md-6 col-xl-4" key={g._id}>
              <div className="ff-card h-100 p-4">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 8,
                      backgroundColor: 'var(--ff-primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ff-primary)'
                    }}
                  >
                    <Layers size={20} />
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{g.name}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Created {new Date(g.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  {g.description || 'No description provided.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="ff-modal-overlay">
          <div className="ff-modal" style={{ maxWidth: 460 }}>
            <div className="ff-modal-header">
              <h5 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>New Vehicle Group</h5>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="ff-modal-body">
                <div className="mb-3">
                  <label className="ff-form-label">Group Name *</label>
                  <input
                    type="text"
                    required
                    className="ff-form-control"
                    placeholder="e.g. Refrigerated Logistics"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label className="ff-form-label">Description</label>
                  <textarea
                    rows="2"
                    className="ff-form-control"
                    placeholder="Fleet segment notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="ff-modal-footer">
                <button type="button" className="ff-btn ff-btn-outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="ff-btn ff-btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleGroupsPage;
