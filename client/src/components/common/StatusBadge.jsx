import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  let badgeClass = 'ff-badge-secondary';
  let dotColor = '#94a3b8';

  switch (normalized) {
    case 'AVAILABLE':
    case 'COMPLETED':
    case 'DELIVERED':
    case 'APPROVED':
    case 'RESOLVED':
    case 'VALID':
    case 'ACTIVE':
    case 'PUBLISHED':
      badgeClass = 'ff-badge-success';
      dotColor = 'var(--ff-success)';
      break;

    case 'IN_TRIP':
    case 'IN_TRANSIT':
    case 'ASSIGNED':
    case 'ACCEPTED':
    case 'READY':
    case 'PICKED_UP':
    case 'IN_PROGRESS':
    case 'SUBMITTED':
    case 'UNDER_INVESTIGATION':
      badgeClass = 'ff-badge-primary';
      dotColor = 'var(--ff-primary)';
      break;

    case 'DELAYED':
    case 'EXPIRING':
    case 'HIGH':
    case 'MEDIUM':
    case 'UNASSIGNED':
    case 'PENDING':
    case 'DRAFT':
      badgeClass = 'ff-badge-warning';
      dotColor = 'var(--ff-warning)';
      break;

    case 'MAINTENANCE':
    case 'CANCELLED':
    case 'FAILED':
    case 'REJECTED':
    case 'EXPIRED':
    case 'SUSPENDED':
    case 'INACTIVE':
    case 'CRITICAL':
      badgeClass = 'ff-badge-danger';
      dotColor = 'var(--ff-danger)';
      break;

    default:
      badgeClass = 'ff-badge-secondary';
      dotColor = '#94a3b8';
      break;
  }

  return (
    <span className={`ff-badge ${badgeClass}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: dotColor,
          display: 'inline-block'
        }}
      />
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
