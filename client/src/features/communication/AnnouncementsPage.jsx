import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Megaphone, 
  Plus, 
  Calendar, 
  User, 
  AlertCircle, 
  Clock, 
  Send 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('ALL');
  const [priority, setPriority] = useState('NORMAL');

  const canCreate = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'OPERATIONS_MANAGER';

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/communication/announcements');
      setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error('Error loading announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post('/api/communication/announcements', {
        title: title.trim(),
        message: message.trim(),
        audience,
        priority
      });
      showSuccess('Announcement broadcasted to team');
      setAnnouncements([res.data.data, ...announcements]);
      setModalOpen(false);
      setTitle('');
      setMessage('');
      setAudience('ALL');
      setPriority('NORMAL');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'URGENT':
        return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}>URGENT</span>;
      case 'HIGH':
        return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' }}>HIGH PRIORITY</span>;
      default:
        return <span className="badge" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563EB' }}>STANDARD</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 880, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Company Announcements</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Company-wide broadcasts, emergency advisories, and operational directives.
          </p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Broadcast Announcement
          </button>
        )}
      </div>

      {/* Announcements Stream */}
      {loading ? (
        <div className="card" style={{ padding: '1.5rem' }}>
          <SkeletonLoader count={3} height={90} />
        </div>
      ) : announcements.length === 0 ? (
        <div className="card">
          <EmptyState 
            icon={Megaphone} 
            title="No Active Announcements" 
            message="There are no company broadcasts at this time."
            actionText={canCreate ? "Broadcast Announcement" : null}
            onAction={canCreate ? () => setModalOpen(true) : null}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {announcements.map(item => (
            <div key={item._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{item.title}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.125rem' }}>
                      <span>Posted by {item.author ? `${item.author.firstName || ''} ${item.author.lastName || ''}`.trim() : 'System Admin'}</span>
                      <span>•</span>
                      <span>Audience: {item.audience}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {getPriorityBadge(item.priority)}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-line', paddingLeft: '3.25rem' }}>
                {item.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <h3 style={{ margin: '0 0 1rem' }}>Broadcast New Announcement</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Severe Weather Route Advisories"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                    Target Audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  >
                    <option value="ALL">Entire Organization</option>
                    <option value="DRIVERS">Drivers Only</option>
                    <option value="DISPATCHERS">Dispatchers Only</option>
                    <option value="MANAGEMENT">Managers Only</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  >
                    <option value="NORMAL">Standard</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent / Alert</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Broadcast Content *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter details of the operational directive..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  <Send size={15} /> {submitting ? 'Publishing...' : 'Publish Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
