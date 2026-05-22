import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    if (toast.type === 'error') {
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="3" fill="none">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    }
    // Success / default
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="3" fill="none">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  };

  return (
    <div className={`toast-box toast-${toast.type || 'success'}`}>
      <div className="toast-icon-wrap">
        {getIcon()}
      </div>
      <span className="toast-message">{toast.message}</span>
      <button className="btn-toast-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
