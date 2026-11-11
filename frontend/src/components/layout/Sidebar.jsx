import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, UploadCloud, ShieldCheck } from 'lucide-react';

export const Sidebar = ({ onOpenUpload }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <span className="sidebar-section-title">NAVIGATION</span>
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-title">DATA MANAGEMENT</span>
        <div className="sidebar-actions">
          <button
            type="button"
            className="btn btn-primary btn-block sidebar-upload-btn"
            onClick={onOpenUpload}
          >
            <UploadCloud size={18} />
            <span>Upload CSV Dataset</span>
          </button>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="system-status-indicator">
          <div className="status-dot"></div>
          <div>
            <div className="status-label">Engine Connected</div>
            <div className="status-sub">MongoDB & JWT Active</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

