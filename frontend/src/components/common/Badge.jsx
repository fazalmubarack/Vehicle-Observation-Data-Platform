import React from 'react';

export const Badge = ({ status, children, variant }) => {
  let badgeVariant = variant;

  if (!badgeVariant && status) {
    switch (status.toLowerCase()) {
      case 'completed':
        badgeVariant = 'success';
        break;
      case 'processing':
        badgeVariant = 'warning';
        break;
      case 'failed':
        badgeVariant = 'danger';
        break;
      default:
        badgeVariant = 'default';
    }
  }

  const content = children || status;

  return <span className={`badge badge-${badgeVariant || 'default'}`}>{content}</span>;
};

export default Badge;
