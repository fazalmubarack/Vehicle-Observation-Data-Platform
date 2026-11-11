import React from 'react';

export const StatCard = ({ title, value, icon: Icon, subtitle, color = 'blue' }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-content">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-value">{value}</div>
        {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
      </div>
      {Icon && (
        <div className={`stat-card-icon-wrap stat-icon-${color}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
