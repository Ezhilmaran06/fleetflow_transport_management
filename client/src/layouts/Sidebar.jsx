import React from 'react';
import { NavLink } from 'react-router-dom';
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
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleCollapsed, isMobileOpen, closeMobile }) => {
  const { user } = useAuth();

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
      aria-label="Sidebar Navigation"
    >
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.95rem',
              letterSpacing: '-0.02em',
              flexShrink: 0
            }}
          >
            F
          </div>
          <div className="brand-title" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                FLEETFLOW
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(37, 99, 235, 0.25)',
                  color: '#60A5FA',
                  padding: '1px 5px',
                  borderRadius: 4,
                  letterSpacing: '0.04em'
                }}
              >
                PRO
              </span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94A3B8', letterSpacing: '0.04em' }}>
              OPERATIONS OS
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleCollapsed}
          className="d-none d-lg-flex"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-sidebar-muted)',
            cursor: 'pointer',
            padding: 5,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-sidebar-muted)')}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Scroll */}
      <div className="sidebar-scroll">
        {navSections.map((sec, idx) => {
          if (sec.roles && !sec.roles.includes(user?.role)) {
            return null;
          }

          return (
            <div key={idx} style={{ marginBottom: 12 }}>
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
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Tenant Status Footer */}
      {!isCollapsed && user?.company && (
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--border-sidebar)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                color: '#E2E8F0',
                fontSize: '0.785rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {user.company.name}
            </div>
            <div style={{ fontSize: '0.675rem', color: '#94A3B8' }}>
              Tenant: <span style={{ fontFamily: 'monospace' }}>{user.company.code}</span>
            </div>
          </div>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: 'var(--ff-success)',
              boxShadow: '0 0 8px rgba(22, 163, 74, 0.6)'
            }}
            title="Tenant Connection Active"
          />
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
