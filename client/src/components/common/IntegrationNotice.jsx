import React from 'react';
import { Settings, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const IntegrationNotice = ({
  feature = 'GPS Telematics',
  message = 'GPS integration is not configured for your workspace. FleetFlow never simulates fake vehicle movement or synthetic coordinates.'
}) => {
  return (
    <div
      className="ff-card"
      style={{
        border: '1px dashed var(--border-color-darker)',
        padding: '36px 24px',
        textAlign: 'center',
        margin: '20px 0'
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: '50%',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          color: 'var(--ff-warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}
      >
        <ShieldAlert size={28} />
      </div>
      <h4 style={{ fontSize: '1.1rem', marginBottom: 8 }}>{feature} Integration Not Configured</h4>
      <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto 20px', fontSize: '0.85rem' }}>
        {message}
      </p>
      <Link to="/admin/integrations" className="ff-btn ff-btn-outline">
        <Settings size={16} />
        Configure Integration Settings
      </Link>
    </div>
  );
};

export default IntegrationNotice;
