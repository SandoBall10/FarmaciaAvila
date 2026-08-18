import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <div className="page-header">
    <div>
      <h1 className="mb-0">{title}</h1>
      <p>{subtitle}</p>
    </div>
    {actions}
  </div>
);

export default PageHeader;
