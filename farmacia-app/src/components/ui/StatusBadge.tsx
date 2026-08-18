import React from 'react';

interface StatusBadgeProps {
  label: string;
  tone: 'ok' | 'warn' | 'danger' | 'info';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ label, tone }) => (
  <span className={`badge-soft ${tone}`}>{label}</span>
);

export default StatusBadge;
