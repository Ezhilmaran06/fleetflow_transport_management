import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  MapPin,
  Workflow,
  Truck,
  Users,
  Compass,
  Building2,
  Layers,
  Award,
  FileText,
  Wrench,
  Calendar,
  Fuel,
  Receipt,
  PiggyBank,
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  BarChart3,
  FileSpreadsheet,
  Bell,
  MessageSquare,
  Megaphone,
  UserCheck,
  Shield,
  History,
  Settings,
  Plug,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleCollapsed, isMobileOpen, closeMobile }) => {
  const { hasRole, user } = useAuth();

  const navSections = [
    {
      title: 'COMMAND CENTER',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Live Operations', path: '/live-operations', icon: Radio },
        { label: 'Live Tracking', path: '/live-tracking', icon: MapPin },
        { label: 'Operations Center', path: '/operations-center', icon: Workflow }
      ]
    },
    {
      title: 'DISPATCH',
      items: [
        { label: 'Trips', path: '/trips', icon: Compass },
        { label: 'Dispatch Board', path: '/dispatch-board', icon: Workflow },
        { label: 'Deliveries', path: '/deliveries', icon: Truck },
        { label: 'Routes', path: '/routes', icon: MapPin },
        { label: 'Customers', path: '/customers', icon: Building2 }
      ]
    },
    {
      title: 'FLEET',
      items: [
        { label: 'Vehicles', path: '/vehicles', icon: Truck },
        { label: 'Vehicle Groups', path: '/vehicle-groups', icon: Layers },
        { label: 'Drivers', path: '/drivers', icon: Users },
        { label: 'Driver Performance', path: '/driver-performance', icon: Award },
        { label: 'Documents', path: '/documents', icon: FileText }
      ]
    },
    {
      title: 'MAINTENANCE',
      items: [
        { label: 'Work Orders', path: '/maintenance', icon: Wrench },
        { label: 'Service Schedule', path: '/service-schedule', icon: Calendar }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { label: 'Fuel Logs', path: '/fuel', icon: Fuel },
        { label: 'Expenses', path: '/expenses', icon: Receipt },
        { label: 'Department Budgets', path: '/budgets', icon: PiggyBank },
        { label: 'Cost Analysis', path: '/cost-analysis', icon: TrendingUp }
      ]
    },
    {
      title: 'SAFETY & COMPLIANCE',
      items: [
        { label: 'Incidents', path: '/incidents', icon: AlertOctagon },
        { label: 'Driver Safety', path: '/driver-safety', icon: ShieldCheck },
        { label: 'Compliance Vault', path: '/compliance', icon: FileText }
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { label: 'Analytics Hub', path: '/analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'REPORTS',
      items: [
        { label: 'Report Builder', path: '/reports', icon: FileSpreadsheet },
        { label: 'Saved Reports', path: '/reports/saved', icon: History }
      ]
    },
    {
      title: 'COMMUNICATION',
      items: [
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'Messages', path: '/messages', icon: MessageSquare },
        { label: 'Announcements', path: '/announcements', icon: Megaphone }
      ]
    },
    {
      title: 'ADMINISTRATION',
      roles: ['ADMIN'],
      items: [
        { label: 'User Directory', path: '/admin/users', icon: UserCheck },
        { label: 'Roles & Matrix', path: '/admin/roles', icon: Shield },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
        { label: 'Integrations', path: '/admin/integrations', icon: Plug },
        { label: 'System Settings', path: '/admin/settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside
      className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
    >
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2563eb, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem'
            }}
          >
            F
          </div>
          <div className="brand-title">
            <h5 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              FLEETFLOW
            </h5>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Operations OS
            </span>
          </div>
        </div>
        <button
          onClick={toggleCollapsed}
          className="d-none d-lg-flex"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-sidebar-muted)',
            cursor: 'pointer',
            padding: 4
          }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav Scroll */}
      <div className="sidebar-scroll">
        {navSections.map((sec, idx) => {
          if (sec.roles && !sec.roles.includes(user?.role)) {
            return null;
          }

          return (
            <div key={idx} style={{ marginBottom: 14 }}>
              <div className="sidebar-nav-section">{sec.title}</div>
              {sec.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={i}
                    to={item.path}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `sidebar-nav-item ${isActive ? 'active' : ''}`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Company Footer */}
      {!isCollapsed && user?.company && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            color: 'var(--text-sidebar-muted)'
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-sidebar)' }}>{user.company.name}</div>
          <div>Code: {user.company.code}</div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
