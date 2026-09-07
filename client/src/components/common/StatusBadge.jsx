import React from 'react';

const STATUS_CONFIG = {
  // Positive / Healthy (Green)
  AVAILABLE: { bg: 'var(--ff-success-light)', color: 'var(--ff-success)', dot: '#16A34A' },
  COMPLETED: { bg: 'var(--ff-success-light)', color: 'var(--ff-success)', dot: '#16A34A' },
  DELIVERED: { bg: 'var(--ff-success-light)', color: 'var(--ff-success)', dot: '#16A34A' },
  ACTIVE: { bg: 'var(--ff-success-light)', color: 'var(--ff-success)', dot: '#16A34A' },
  APPROVED: { bg: 'var(--ff-success-light)', color: 'var(--ff-success)', dot: '#16A34A' },
  RESOLVED: { bg: 'var(--ff-success-light)', color: 'var(--ff-success)', dot: '#16A34A' },
  VALID: { bg: 'var(--ff-success-light)', color: 'var(--ff-success)', dot: '#16A34A' },
  PUBLISHED: { bg: 'var(--ff-success-light)', color: 'var(--ff-success)', dot: '#16A34A' },

  // Operational / In Motion (Blue)
  IN_TRIP: { bg: 'var(--ff-primary-light)', color: 'var(--ff-primary)', dot: '#2563EB' },
  IN_PROGRESS: { bg: 'var(--ff-primary-light)', color: 'var(--ff-primary)', dot: '#2563EB' },
  ACCEPTED: { bg: 'var(--ff-primary-light)', color: 'var(--ff-primary)', dot: '#2563EB' },
  READY: { bg: 'var(--ff-primary-light)', color: 'var(--ff-primary)', dot: '#2563EB' },

  // Transit (Cyan / Info)
  IN_TRANSIT: { bg: 'var(--ff-info-light)', color: 'var(--ff-info)', dot: '#0284C7' },
  PICKED_UP: { bg: 'var(--ff-info-light)', color: 'var(--ff-info)', dot: '#0284C7' },
  OUT_FOR_DELIVERY: { bg: 'var(--ff-info-light)', color: 'var(--ff-info)', dot: '#0284C7' },

  // Assigned / Dedicated (Indigo)
  ASSIGNED: { bg: 'rgba(79, 70, 229, 0.10)', color: '#4F46E5', dot: '#4F46E5' },
  SCHEDULED: { bg: 'rgba(79, 70, 229, 0.10)', color: '#4F46E5', dot: '#4F46E5' },
  SUBMITTED: { bg: 'rgba(79, 70, 229, 0.10)', color: '#4F46E5', dot: '#4F46E5' },
  UNDER_INVESTIGATION: { bg: 'rgba(79, 70, 229, 0.10)', color: '#4F46E5', dot: '#4F46E5' },

  // Warnings / Caution (Amber / Orange)
  MAINTENANCE: { bg: 'var(--ff-warning-light)', color: 'var(--ff-warning)', dot: '#D97706' },
  IN_SHOP: { bg: 'var(--ff-warning-light)', color: 'var(--ff-warning)', dot: '#D97706' },
  EXPIRING: { bg: 'var(--ff-warning-light)', color: 'var(--ff-warning)', dot: '#D97706' },
  PENDING: { bg: 'var(--ff-warning-light)', color: 'var(--ff-warning)', dot: '#D97706' },
  UNASSIGNED: { bg: 'var(--ff-warning-light)', color: 'var(--ff-warning)', dot: '#D97706' },
  DRAFT: { bg: 'var(--ff-warning-light)', color: 'var(--ff-warning)', dot: '#D97706' },
  LOW: { bg: 'var(--ff-warning-light)', color: 'var(--ff-warning)', dot: '#D97706' },
  MEDIUM: { bg: 'var(--ff-warning-light)', color: 'var(--ff-warning)', dot: '#D97706' },

  // Critical / High / Danger (Red)
  DELAYED: { bg: 'var(--ff-danger-light)', color: 'var(--ff-danger)', dot: '#DC2626' },
  FAILED: { bg: 'var(--ff-danger-light)', color: 'var(--ff-danger)', dot: '#DC2626' },
  CANCELLED: { bg: 'rgba(100, 116, 139, 0.12)', color: 'var(--text-muted)', dot: '#64748B' },
  REJECTED: { bg: 'var(--ff-danger-light)', color: 'var(--ff-danger)', dot: '#DC2626' },
  EXPIRED: { bg: 'var(--ff-danger-light)', color: 'var(--ff-danger)', dot: '#DC2626' },
  SUSPENDED: { bg: 'var(--ff-danger-light)', color: 'var(--ff-danger)', dot: '#DC2626' },
  INACTIVE: { bg: 'rgba(100, 116, 139, 0.12)', color: 'var(--text-muted)', dot: '#64748B' },
  CRITICAL: { bg: 'var(--ff-danger-light)', color: 'var(--ff-danger)', dot: '#DC2626' },
  HIGH: { bg: 'var(--ff-danger-light)', color: 'var(--ff-danger)', dot: '#DC2626' },
  URGENT: { bg: 'var(--ff-danger-light)', color: 'var(--ff-danger)', dot: '#DC2626' }
};

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();
  const cfg = STATUS_CONFIG[normalized] || {
    bg: 'var(--ff-neutral-light)',
    color: 'var(--text-muted)',
    dot: '#64748B'
  };

  return (
    <span
      className="ff-badge"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}33`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 8px',
        borderRadius: '9999px',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.025em',
        textTransform: 'uppercase'
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: cfg.dot,
          display: 'inline-block',
          flexShrink: 0
        }}
      />
      {String(status).replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
