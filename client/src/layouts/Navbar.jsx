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
  Truck,
  Users,
  Compass,
  Receipt,
  AlertOctagon,
  ChevronDown,
  Check
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
    <header className="app-navbar" role="banner">
      {/* Left section: Sidebar toggle & breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="d-lg-none"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={19} />
        </button>

        <nav aria-label="breadcrumb" className="d-none d-md-flex align-items-center">
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.815rem' }}>
            <li>
              <Link
                to="/dashboard"
                style={{
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  transition: 'color var(--transition-fast)'
                }}
              >
                FleetFlow
              </Link>
            </li>
            {breadcrumbs.length === 0 ? (
              <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--border-color-darker)', fontSize: '0.75rem' }}>/</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Command Center</span>
              </li>
            ) : (
              breadcrumbs.map((b, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--border-color-darker)', fontSize: '0.75rem' }}>/</span>
                  <span style={{ fontWeight: i === breadcrumbs.length - 1 ? 600 : 400, color: i === breadcrumbs.length - 1 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {b.label}
                  </span>
                </li>
              ))
            )}
          </ol>
        </nav>
      </div>

      {/* Center: Command / Search Trigger */}
      <div style={{ flex: '0 1 380px', margin: '0 16px' }} className="d-none d-sm-block">
        <button
          type="button"
          onClick={openCommandPalette}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            fontSize: '0.825rem',
            cursor: 'pointer',
            transition: 'border-color var(--transition-fast), background-color var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color-darker)';
            e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={15} color="var(--text-muted)" />
            <span>Search vehicles, trips, drivers...</span>
          </div>
          <kbd
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 4,
              padding: '1px 5px',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              fontFamily: 'monospace'
            }}
          >
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Quick Create CTA */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="ff-btn ff-btn-primary ff-btn-sm"
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            aria-expanded={showQuickCreate}
            style={{ gap: 6 }}
          >
            <Plus size={15} />
            <span className="d-none d-md-inline">Quick Create</span>
            <ChevronDown size={13} style={{ opacity: 0.8 }} />
          </button>

          {showQuickCreate && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 36,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--modal-shadow)',
                width: 220,
                zIndex: 100,
                padding: '6px 0',
                animation: 'fadeIn 0.15s ease-out'
              }}
            >
              <div
                style={{
                  padding: '6px 14px',
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
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
                    type="button"
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
                      padding: '7px 14px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Icon size={15} color="var(--ff-primary)" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* System Online Status Pill */}
        <div
          className="d-none d-xl-flex align-items-center gap-2"
          style={{
            padding: '4px 9px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            fontSize: '0.725rem'
          }}
          title="Backend MongoDB Telemetry Engine Connected"
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'var(--ff-success)',
              boxShadow: '0 0 6px rgba(22, 163, 74, 0.7)'
            }}
          />
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>API Connected</span>
        </div>

        {/* Direct Messages Icon */}
        <Link
          to="/messages"
          className="ff-btn-ghost"
          style={{
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius-sm)'
          }}
          title="Direct Messages"
          aria-label="Direct Messages"
        >
          <MessageSquare size={18} />
        </Link>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="ff-btn-ghost"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-sm)'
            }}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 7,
                  height: 7,
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
                top: 36,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--modal-shadow)',
                width: 320,
                zIndex: 100,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.825rem' }}>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    style={{ background: 'none', border: 'none', color: 'var(--ff-primary)', fontSize: '0.725rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No unread notifications
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
                        padding: '9px 14px',
                        borderBottom: '1px solid var(--border-color-subtle)',
                        backgroundColor: n.isRead ? 'transparent' : 'var(--bg-surface-elevated)',
                        cursor: 'pointer',
                        transition: 'background-color var(--transition-fast)'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.785rem' }}>{n.title}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '8px 14px', textAlign: 'center', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  style={{ fontSize: '0.775rem', color: 'var(--ff-primary)', fontWeight: 600 }}
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          className="ff-btn-ghost"
          onClick={toggleTheme}
          style={{
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius-sm)'
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 2,
              borderRadius: 'var(--radius-pill)'
            }}
            aria-label="User Profile Menu"
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
                border: '2px solid var(--border-color)'
              }}
            >
              {user?.firstName ? user.firstName[0] : 'A'}
            </div>
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 38,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--modal-shadow)',
                width: 210,
                zIndex: 100,
                padding: '6px 0'
              }}
            >
              <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-main)' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                <div
                  style={{
                    display: 'inline-block',
                    marginTop: 4,
                    padding: '1px 6px',
                    borderRadius: 4,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--ff-primary-light)',
                    color: 'var(--ff-primary)'
                  }}
                >
                  {user?.role}
                </div>
              </div>
              <button
                type="button"
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
                  padding: '8px 14px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--ff-danger)',
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <LogOut size={15} />
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
