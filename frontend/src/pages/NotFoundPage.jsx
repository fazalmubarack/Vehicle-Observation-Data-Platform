import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <Compass size={48} className="text-primary mb-4" />
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-desc">
          The page or dataset explorer resource you are searching for does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

