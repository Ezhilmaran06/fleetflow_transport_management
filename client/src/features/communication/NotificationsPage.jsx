import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  ExternalLink, 
  Info, 
  AlertTriangle, 
  ShieldAlert, 
  Truck 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

export default function NotificationsPage() {
  const { showSuccess, showError } = useToast();
  const { fetchNotifications: refreshGlobalBadge } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/communication/notifications');
      setNotifications(res.data.data?.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/api/communication/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      refreshGlobalBadge();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/api/communication/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      refreshGlobalBadge();
      showSuccess('All notifications marked as read');
    } catch (err) {
      showError('Failed to mark notifications as read');
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'WARNING':
      case 'INCIDENT':
        return <AlertTriangle size={18} color="#EF4444" />;
      case 'MAINTENANCE':
        return <Truck size={18} color="#F59E0B" />;
      case 'SUCCESS':
        return <CheckCheck size={18} color="#10B981" />;
      default:
        return <Info size={18} color="#2563EB" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 880, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>System Notifications</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Operational updates, safety alerts, dispatch triggers, and company announcements.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-outline"
            onClick={handleMarkAllAsRead}
            disabled={notifications.every(n => n.isRead)}
          >
            <CheckCheck size={16} /> Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${filter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('ALL')}
          style={{ fontSize: '0.8125rem', padding: '0.4rem 0.8rem' }}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          className={`btn ${filter === 'UNREAD' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('UNREAD')}
          style={{ fontSize: '0.8125rem', padding: '0.4rem 0.8rem' }}
        >
          Unread Only ({notifications.filter(n => !n.isRead).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <SkeletonLoader count={4} height={60} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState 
            icon={Bell} 
            title="No Notifications" 
            message={filter === 'UNREAD' ? "You're all caught up! No unread notifications." : "No notifications have been generated for your account yet."}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map(notif => (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1.125rem 1.25rem',
                  borderBottom: '1px solid var(--border-color)',
                  background: notif.isRead ? 'transparent' : 'rgba(37, 99, 235, 0.04)',
                  cursor: notif.isRead ? 'default' : 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ marginTop: '0.125rem' }}>
                  {getIcon(notif.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: notif.isRead ? 500 : 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {notif.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Clock size={12} />
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {notif.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {notif.link ? (
                      <Link 
                        to={notif.link} 
                        style={{ fontSize: '0.8125rem', color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 500 }}
                      >
                        View Details <ExternalLink size={12} />
                      </Link>
                    ) : <span />}

                    {!notif.isRead && (
                      <span className="badge" style={{ background: '#2563EB', color: '#fff', fontSize: '0.6875rem' }}>
                        NEW
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
