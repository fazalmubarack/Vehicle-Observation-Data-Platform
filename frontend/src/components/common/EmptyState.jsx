import React from 'react';
import { Database } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Database,
  title = 'No Data Found',
  description = 'There are no records matching your criteria.',
  action,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon-wrapper">
        <Icon size={40} className="empty-state-icon" />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-description">{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
