import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;

