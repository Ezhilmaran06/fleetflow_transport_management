import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radio, Compass, Bell, Menu } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const MobileBottomNav = ({ toggleMobileSidebar }) => {
  const { unreadCount } = useNotifications();

  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => (isActive ? 'text-primary' : 'text-muted')}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.7rem' }}
      >
        <LayoutDashboard size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/live-operations"
        className={({ isActive }) => (isActive ? 'text-primary' : 'text-muted')}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.7rem' }}
      >
        <Radio size={20} />
        <span>Live</span>
      </NavLink>

      <NavLink
        to="/trips"
        className={({ isActive }) => (isActive ? 'text-primary' : 'text-muted')}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.7rem' }}
      >
        <Compass size={20} />
        <span>Trips</span>
      </NavLink>

      <NavLink
        to="/notifications"
        className={({ isActive }) => (isActive ? 'text-primary' : 'text-muted')}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.7rem', position: 'relative' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 12,
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: 'var(--ff-danger)'
            }}
          />
        )}
        <span>Alerts</span>
      </NavLink>

      <button
        onClick={toggleMobileSidebar}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontSize: '0.7rem',
          cursor: 'pointer'
        }}
      >
        <Menu size={20} />
        <span>More</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
