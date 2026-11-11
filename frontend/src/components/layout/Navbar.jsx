import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Car, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="topbar-logo-icon">
          <Car size={22} color="#ffffff" />
        </div>
        <div>
          <span className="topbar-title">Vehicle Observation Data Platform</span>
          <span className="topbar-badge">Analytics SaaS</span>
        </div>
      </div>

      <div className="topbar-user-area">
        <div className="user-profile-badge">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'Authorized User'}</span>
            <span className="user-email">{user?.email || ''}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn-logout"
          title="Sign out of platform"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
