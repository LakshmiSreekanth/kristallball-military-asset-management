import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
  { path: '/purchases', label: 'Purchases', icon: '📦', roles: ['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER'] },
  { path: '/transfers', label: 'Transfers', icon: '🔄', roles: ['ADMIN', 'LOGISTICS_OFFICER'] },
  { path: '/assignments', label: 'Assignments', icon: '👤', roles: ['ADMIN', 'BASE_COMMANDER'] },
  { path: '/audit', label: 'Audit Trail', icon: '📋', roles: ['ADMIN', 'BASE_COMMANDER'] }
];

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();

  const roleLabels = {
    ADMIN: 'Administrator',
    BASE_COMMANDER: 'Base Commander',
    LOGISTICS_OFFICER: 'Logistics Officer'
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>KRISTALLBALL</h2>
        <p>Military Asset Management</p>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.filter(item => hasRole(...item.roles)).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <strong>{user?.username}</strong>
          <br />
          <span className="user-role">{roleLabels[user?.role]}</span>
          {user?.baseName && <div style={{ marginTop: 4, opacity: 0.7 }}>{user.baseName}</div>}
        </div>
        <button className="btn-logout" onClick={logout}>Sign Out</button>
      </div>
    </aside>
  );
}
