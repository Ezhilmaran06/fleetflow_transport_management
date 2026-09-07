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
        <Icon size={24} color="var(--ff-primary)" />
      </div>
      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
        {title}
      </h4>
      <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 18px', fontSize: '0.85rem', lineHeight: 1.5 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button type="button" className="ff-btn ff-btn-primary" onClick={onAction}>
          <Plus size={15} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
