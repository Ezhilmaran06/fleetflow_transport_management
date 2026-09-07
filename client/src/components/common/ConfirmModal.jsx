import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this operation?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="ff-modal-overlay">
      <div className="ff-modal" style={{ maxWidth: 440 }}>
        <div className="ff-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isDanger && <AlertTriangle color="var(--ff-danger)" size={20} />}
            <h5 style={{ margin: 0, fontSize: '1rem' }}>{title}</h5>
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="ff-modal-body">
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>{message}</p>
        </div>
        <div className="ff-modal-footer">
          <button className="ff-btn ff-btn-outline" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </button>
          <button
            className={`ff-btn ${isDanger ? 'ff-btn-danger' : 'ff-btn-primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
