import React from 'react';
import { PackageOpen, Plus } from 'lucide-react';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'Your FleetFlow workspace is ready. Get started by creating your first entry.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="ff-empty-state">
      <div className="ff-empty-icon">
        <Icon size={32} />
      </div>
      <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{title}</h4>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.875rem' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button className="ff-btn ff-btn-primary" onClick={onAction}>
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
