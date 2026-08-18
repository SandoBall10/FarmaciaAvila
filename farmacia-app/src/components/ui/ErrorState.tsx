import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="error-state surface-card">
    <i className="fa fa-exclamation-circle" aria-hidden="true"></i>
    <h3>No pudimos cargar la información</h3>
    <p>{message}</p>
    <button type="button" className="btn btn-primary" onClick={onRetry}>
      Reintentar
    </button>
  </div>
);

export default ErrorState;
