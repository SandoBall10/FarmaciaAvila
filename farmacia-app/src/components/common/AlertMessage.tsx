import React from 'react';

interface AlertMessageProps {
  type: 'success' | 'danger' | 'info';
  message: string;
  onClose?: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ type, message, onClose }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`alert alert-${type} alert-dismissible`} role="alert">
      {message}
      {onClose && (
        <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
      )}
    </div>
  );
};

export default AlertMessage;
