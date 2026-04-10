import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';

const Icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  customers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  accounts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  transactions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
      <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
    </svg>
  ),
  loans: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  creditCards: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22"/>
      <line x1="6" y1="18" x2="6" y2="11"/>
      <line x1="10" y1="18" x2="10" y2="11"/>
      <line x1="14" y1="18" x2="14" y2="11"/>
      <line x1="18" y1="18" x2="18" y2="11"/>
      <polygon points="12 2 20 7 4 7"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

const ROLE_META = {
  FIELD:   { label: 'Field Officer',              color: '#10b981' },
  CSE:     { label: 'Customer Service Executive', color: '#6366f1' },
  LOAN:    { label: 'Loan Officer',               color: '#f59e0b' },
  MANAGER: { label: 'Branch Manager',             color: '#ec4899' },
};

function SideLink({ to, icon, label, role }) {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <Link to={to} className={`sidebar-link ${active ? 'sidebar-link--active' : ''}`}>
      <span className="sidebar-link__icon">{icon}</span>
      <span className="sidebar-link__label">{label}</span>
    </Link>
  );
}

function Layout({ user, setUser }) {
  const navigate = useNavigate();
  const meta = ROLE_META[user?.role] || ROLE_META.CSE;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-brand__icon">{Icons.bank}</span>
          <span>Rural <strong>Banking</strong> System</span>
        </div>
        <div className="navbar-user">
          <div className="navbar-user__info">
            <span className="navbar-user__name">{user?.full_name || user?.username}</span>
            <span className="navbar-user__role" style={{ color: meta.color }}>{meta.label}</span>
          </div>
          <button onClick={handleLogout} className="navbar-logout">
            {Icons.logout}
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="layout-container">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <SideLink to="/dashboard"    icon={Icons.dashboard}     label="Dashboard" />
            {['FIELD','CSE','LOAN','MANAGER'].includes(user?.role) && (
              <SideLink to="/customers"  icon={Icons.customers}     label="Customers" />
            )}
            {['CSE','MANAGER'].includes(user?.role) && (
              <SideLink to="/accounts"   icon={Icons.accounts}      label="Accounts" />
            )}
            {user?.role === 'CSE' && (
              <SideLink to="/loans" icon={Icons.loans} label="Loans" />
            )}
            {['LOAN','MANAGER'].includes(user?.role) && (
              <SideLink to="/loans"      icon={Icons.loans}         label="Loans" />
            )}
            {['CSE','MANAGER'].includes(user?.role) && (
              <SideLink to="/credit-cards" icon={Icons.creditCards} label="Credit Cards" />
            )}
            {user?.role === 'MANAGER' && (
              <SideLink to="/reports"    icon={Icons.reports}       label="Reports" />
            )}
          </div>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
