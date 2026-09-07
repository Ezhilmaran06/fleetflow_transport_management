import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  LogOut,
  User,
  ShieldCheck,
  Truck,
  Users,
  Compass,
  Receipt,
  Wrench,
  AlertOctagon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

const Navbar = ({ toggleMobileSidebar, openCommandPalette }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Generate breadcrumbs from pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const routeTo = `/${pathParts.slice(0, index + 1).join('/')}`;
    const formatted = part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return { label: formatted, path: routeTo };
  });

  return (
    <header className="app-navbar">
      {/* Left section: Sidebar toggle & breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={toggleMobileSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: 4
          }}
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        <nav aria-label="breadcrumb" className="d-none d-md-flex align-items-center">
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 8, fontSize: '0.85rem' }}>
            <li style={{ color: 'var(--text-muted)' }}>
              <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}>FleetFlow</Link>
            </li>
            {breadcrumbs.map((b, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--border-color-darker)' }}>/</span>
                <span style={{ fontWeight: i === breadcrumbs.length - 1 ? 600 : 400, color: 'var(--text-main)' }}>
                  {b.label}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Center: Global Search trigger */}
      <div style={{ flex: '0 1 360px', margin: '0 16px' }} className="d-none d-sm-block">
        <button
          onClick={openCommandPalette}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 14px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={16} />
            <span>Search vehicles, trips, drivers...</span>
          </div>
          <kbd
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: '0.7rem',
              color: 'var(--text-muted)'
            }}
          >
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Quick Create Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="ff-btn ff-btn-primary ff-btn-sm"
            onClick={() => setShowQuickCreate(!showQuickCreate)}
          >
            <Plus size={16} />
            <span className="d-none d-md-inline">Quick Create</span>
          </button>

          {showQuickCreate && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 40,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--card-shadow)',
                width: 220,
                zIndex: 100,
                padding: '6px 0'
              }}
            >
              <div
                style={{
                  padding: '6px 14px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}
              >
                Quick Actions
              </div>
              {[
                { label: 'New Vehicle', icon: Truck, link: '/vehicles?action=create' },
                { label: 'New Driver', icon: Users, link: '/drivers?action=create' },
                { label: 'New Trip', icon: Compass, link: '/trips?action=create' },
                { label: 'New Delivery', icon: Truck, link: '/deliveries?action=create' },
                { label: 'Log Fuel Record', icon: Receipt, link: '/fuel?action=create' },
                { label: 'Submit Expense', icon: Receipt, link: '/expenses?action=create' },
                { label: 'Report Incident', icon: AlertOctagon, link: '/incidents?action=create' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowQuickCreate(false);
                      navigate(item.link);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Icon size={16} color="var(--ff-primary)" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              position: 'relative',
              padding: 6
            }}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--ff-danger)'
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 40,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--card-shadow)',
                width: 320,
                zIndex: 100,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontWeight: 600 }}>Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{ background: 'none', border: 'none', color: 'var(--ff-primary)', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        markAsRead(n._id);
                        if (n.link) navigate(n.link);
                        setShowNotifications(false);
                      }}
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: n.isRead ? 'transparent' : 'var(--bg-surface-elevated)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{n.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '8px 16px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  style={{ fontSize: '0.8rem', color: 'var(--ff-primary)', fontWeight: 600 }}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Direct Messages Icon */}
        <Link
          to="/messages"
          style={{ color: 'var(--text-main)', padding: 6, display: 'flex', alignItems: 'center' }}
          title="Direct Messages"
        >
          <MessageSquare size={20} />
        </Link>

        {/* System Health Indicator */}
        <div
          className="d-none d-xl-flex align-items-center gap-2"
          style={{
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            fontSize: '0.75rem'
          }}
          title="Backend MongoDB Engine Connected"
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--ff-success)' }} />
          <span style={{ color: 'var(--text-muted)' }}>API Online</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: 6
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 0
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'var(--ff-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              {user?.firstName ? user.firstName[0] : 'U'}
            </div>
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 42,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--card-shadow)',
                width: 200,
                zIndex: 100,
                padding: '6px 0'
              }}
            >
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                <div
                  style={{
                    display: 'inline-block',
                    marginTop: 4,
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--ff-primary-light)',
                    color: 'var(--ff-primary)'
                  }}
                >
                  {user?.role}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--ff-danger)',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
