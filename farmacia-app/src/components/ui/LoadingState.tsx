import React from 'react';

const LoadingState: React.FC<{ label?: string }> = ({ label = 'Cargando...' }) => (
  <div className="loading-state surface-card" role="status" aria-live="polite">
    <div className="spinner-border text-primary mb-3" />
    <p className="mb-0">{label}</p>
  </div>
);

export default LoadingState;
