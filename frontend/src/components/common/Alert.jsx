import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export const Alert = ({ type = 'error', message, onClose, className = '' }) => {
  if (!message) return null;

  const icons = {
    error: <AlertCircle size={18} className="alert-icon-error" />,
    success: <CheckCircle size={18} className="alert-icon-success" />,
    info: <Info size={18} className="alert-icon-info" />,
  };

  return (
    <div className={`alert alert-${type} ${className}`} role="alert">
      <div className="alert-content">
        {icons[type]}
        <div className="alert-message">{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className="alert-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
