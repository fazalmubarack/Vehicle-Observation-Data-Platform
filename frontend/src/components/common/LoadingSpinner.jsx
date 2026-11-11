import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 24, text = 'Loading data...' }) => {
  return (
    <div className="loading-container">
      <Loader2 size={size} className="spinner-icon animate-spin" />
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
