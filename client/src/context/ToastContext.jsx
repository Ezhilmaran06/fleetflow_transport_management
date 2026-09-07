import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Fixed Toast Container */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 400
        }}
      >
        {toasts.map((toast) => {
          let bg = 'var(--bg-surface)';
          let border = 'var(--ff-primary)';
          let icon = <Info size={18} color="var(--ff-primary)" />;

          if (toast.type === 'success') {
            border = 'var(--ff-success)';
            icon = <CheckCircle2 size={18} color="var(--ff-success)" />;
          } else if (toast.type === 'error') {
            border = 'var(--ff-danger)';
            icon = <AlertCircle size={18} color="var(--ff-danger)" />;
          } else if (toast.type === 'warning') {
            border = 'var(--ff-warning)';
            icon = <AlertTriangle size={18} color="var(--ff-warning)" />;
          }

          return (
            <div
              key={toast.id}
              style={{
                backgroundColor: bg,
                border: `1px solid ${border}`,
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {icon}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
