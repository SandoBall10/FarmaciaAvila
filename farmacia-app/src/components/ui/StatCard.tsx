import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  hint?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, hint }) => (
  <div className="surface-card stat-card">
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <small className="text-secondary">{hint}</small>}
    </div>
    <div className="stat-icon" aria-hidden="true">
      <i className={`fa ${icon}`}></i>
    </div>
  </div>
);

export default StatCard;
