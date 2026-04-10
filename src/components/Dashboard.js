import React, { useEffect, useState } from 'react';
import api from '../api';
import './Dashboard.css';

const ROLE_META = {
  FIELD:   { label: 'Field Officer',              color: '#10b981', icon: '🌾', glow: 'rgba(16,185,129,0.3)' },
  CSE:     { label: 'Customer Service Executive', color: '#6366f1', icon: '🎧', glow: 'rgba(99,102,241,0.3)' },
  LOAN:    { label: 'Loan Officer',               color: '#f59e0b', icon: '💰', glow: 'rgba(245,158,11,0.3)' },
  MANAGER: { label: 'Branch Manager',             color: '#ec4899', icon: '🏦', glow: 'rgba(236,72,153,0.3)' },
};

const PERMISSIONS = {
  FIELD:   ['Register new customers', 'View customer profiles', 'Assist with onboarding'],
  CSE:     ['Register customers', 'Open bank accounts', 'Process deposits & withdrawals', 'Fund transfers', 'Credit card requests'],
  LOAN:    ['View customer profiles', 'Create loan applications', 'Review loan eligibility', 'Prepare documentation'],
  MANAGER: ['Approve / reject loans', 'Approve / reject credit cards', 'View all reports', 'Monitor branch operations', 'Full system access'],
};

const G = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '18px',
  padding: '24px',
};

function Badge({ label }) {
  const map = {
    Pending:  { bg: 'rgba(245,158,11,0.15)',  color: '#fde68a', border: 'rgba(245,158,11,0.3)' },
    Approved: { bg: 'rgba(16,185,129,0.15)',  color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
    Rejected: { bg: 'rgba(239,68,68,0.15)',   color: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
    Active:   { bg: 'rgba(99,102,241,0.15)',  color: '#c4b5fd', border: 'rgba(99,102,241,0.3)' },
    Inactive: { bg: 'rgba(107,114,128,0.15)', color: '#d1d5db', border: 'rgba(107,114,128,0.3)' },
  };
  const s = map[label] || map.Active;
  return (
    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}
    </span>
  );
}

function StatCard({ icon, label, value, color, delay }) {
  return (
    <div className="db-stat" style={{ '--s-color': color, animationDelay: delay }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${color}33`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
      <span className="db-stat__icon">{icon}</span>
      <span className="db-stat__value" style={{ color }}>{value ?? '—'}</span>
      <span className="db-stat__label">{label}</span>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="db-info-row">
      <span className="db-info-row__label">{label}</span>
      <span className="db-info-row__value">{value || '—'}</span>
    </div>
  );
}

function QuickItem({ title, desc, color }) {
  return (
    <div className="db-guide-item" style={{ '--role-color': color }}>
      <strong>{title}</strong>
      <span>{desc}</span>
    </div>
  );
}

function LoanTable({ loans, user, onRefresh }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="db-table">
        <thead>
          <tr>
            <th>#</th><th>Customer</th><th>Type</th><th>Amount</th>
            <th>EMI</th><th>Tenure</th><th>Rate</th><th>Status</th><th>Applied</th>
            {user?.role === 'MANAGER' && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {loans.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.3)' }}>
                No loan applications yet
              </td>
            </tr>
          ) : loans.map((loan, i) => (
            <tr key={loan.id}>
              <td style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{i + 1}</td>
              <td style={{ fontWeight: 600, color: 'white' }}>{loan.customer_name}</td>
              <td style={{ fontSize: '12px' }}>{loan.loan_type_display}</td>
              <td style={{ fontWeight: 600, color: '#fbbf24' }}>₹{parseFloat(loan.loan_amount).toLocaleString('en-IN')}</td>
              <td style={{ color: '#a78bfa' }}>₹{parseFloat(loan.monthly_payment).toFixed(0)}</td>
              <td style={{ fontSize: '12px' }}>{loan.tenure_months}m</td>
              <td style={{ fontSize: '12px' }}>{loan.interest_rate}%</td>
              <td><Badge label={loan.status} /></td>
              <td style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                {new Date(loan.created_at).toLocaleDateString('en-IN')}
              </td>
              {user?.role === 'MANAGER' && (
                <td>
                  {loan.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-success" style={{ padding: '4px 10px', fontSize: '11px' }}
                        onClick={() => api.post(`/loans/${loan.id}/approve/`).then(onRefresh)}>✓</button>
                      <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '11px' }}
                        onClick={() => api.post(`/loans/${loan.id}/reject/`, { reason: 'Rejected' }).then(onRefresh)}>✕</button>
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard({ user }) {
  const [stats, setStats]         = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans]         = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const meta = ROLE_META[user?.role] || ROLE_META.CSE;

  const refreshLoans = () => api.get('/loans/').then(r => setLoans(r.data)).catch(() => {});

  useEffect(() => {
    api.get('/staff/stats/').then(r => setStats(r.data)).catch(() => {});
    api.get('/customers/').then(r => setCustomers(r.data)).catch(() => {});
    refreshLoans();
  }, []);

  const statCards = stats ? [
    { icon: '👥', label: 'Total Customers',  value: stats.total_customers,       color: '#10b981', delay: '0.05s' },
    { icon: '🏦', label: 'Total Accounts',   value: stats.total_accounts,        color: '#6366f1', delay: '0.1s'  },
    { icon: '📋', label: 'Total Loans',      value: stats.total_loans,           color: '#f59e0b', delay: '0.15s' },
    { icon: '⏳', label: 'Pending Loans',    value: stats.pending_loans,         color: '#ef4444', delay: '0.2s'  },
    { icon: '✅', label: 'Approved Loans',   value: stats.approved_loans,        color: '#10b981', delay: '0.25s' },
    { icon: '🔄', label: 'Txns Today',       value: stats.transactions_today,    color: '#06b6d4', delay: '0.3s'  },
    { icon: '💳', label: 'Pending Cards',    value: stats.pending_credit_cards,  color: '#8b5cf6', delay: '0.35s' },
    { icon: '👔', label: 'Total Staff',      value: stats.total_staff,           color: '#ec4899', delay: '0.4s'  },
  ] : [];

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>

      {/* Welcome */}
      <div className="db-welcome">
        <div className="db-welcome__left">
          <div className="db-welcome__icon" style={{ '--role-glow': meta.glow }}>{meta.icon}</div>
          <div>
            <h1>Welcome back, <span style={{ color: meta.color }}>{user?.full_name || user?.username}</span> 👋</h1>
            <p>{meta.label} · {user?.employee_id} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="db-role-pill" style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}55`, color: meta.color }}>
          {meta.icon} {meta.label}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="db-stats-grid">
          {statCards.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      {/* Tabs */}
      <div className="db-tabs">
        {[
          { key: 'overview',  label: '📊 Overview'  },
          { key: 'customers', label: '👥 Customers'  },
          { key: 'loans',     label: '💰 Loans'      },
        ].map(t => (
          <button key={t.key} className={`db-tab ${activeTab === t.key ? 'db-tab--active' : ''}`}
            onClick={() => setActiveTab(t.key)}>{t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <>
          <div className="db-main-grid">
            <div style={G}>
              <h3 className="db-section-title">👤 My Profile</h3>
              <InfoRow label="Full Name"   value={user?.full_name} />
              <InfoRow label="Username"    value={user?.username} />
              <InfoRow label="Employee ID" value={user?.employee_id} />
              <InfoRow label="Role"        value={meta.label} />
              <InfoRow label="Email"       value={user?.email} />
              <InfoRow label="Phone"       value={user?.phone} />
              <InfoRow label="Joined"      value={user?.date_joined} />
            </div>

            <div style={G}>
              <h3 className="db-section-title">🏢 Branch Details</h3>
              {user?.branch ? (
                <>
                  <div className="db-branch-badge">
                    <span className="db-branch-badge__name">{user.branch.name}</span>
                    <span className="db-branch-badge__code">{user.branch.code}</span>
                  </div>
                  <InfoRow label="Address" value={user.branch.address} />
                  <InfoRow label="Phone"   value={user.branch.phone} />
                  <InfoRow label="Email"   value={user.branch.email} />
                </>
              ) : (
                <div className="db-no-branch">
                  <span>🏢</span><p>No branch assigned yet.</p>
                  <small>Contact your administrator to assign a branch.</small>
                </div>
              )}
            </div>

            <div style={G}>
              <h3 className="db-section-title">🔐 Your Permissions</h3>
              <div className="db-perms">
                {PERMISSIONS[user?.role]?.map((p, i) => (
                  <div key={i} className="db-perm-item" style={{ '--role-color': meta.color, animationDelay: `${i * 0.06}s` }}>
                    <span className="db-perm-check" style={{ color: meta.color }}>✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={G}>
              <h3 className="db-section-title">⚡ Quick Guide</h3>
              <div className="db-guide">
                {user?.role === 'CSE' && [
                  ['👥 Customers', 'Register and manage customer profiles'],
                  ['🏦 Accounts', 'Open savings/current accounts'],
                  ['💰 Loans', 'View and process loan applications'],
                  ['💳 Credit Cards', 'Submit credit card applications'],
                ].map(([title, desc]) => <QuickItem key={title} title={title} desc={desc} color={meta.color} />)}
                {user?.role === 'MANAGER' && [
                  ['✅ Loans', 'Approve or reject pending loan applications'],
                  ['💳 Credit Cards', 'Approve or reject card applications'],
                  ['📈 Reports', 'View branch-wide reports and analytics'],
                ].map(([title, desc]) => <QuickItem key={title} title={title} desc={desc} color={meta.color} />)}
              </div>
            </div>
          </div>

          {/* Loan Applications on Overview */}
          <div style={{ ...G, padding: '0', overflow: 'hidden', marginTop: '16px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'white' }}>
                💰 Loan Applications
                <span style={{ marginLeft: '10px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
                  ({loans.length} total · {loans.filter(l => l.status === 'Pending').length} pending)
                </span>
              </h3>
              <button onClick={() => setActiveTab('loans')}
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#c4b5fd', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                View All →
              </button>
            </div>
            <LoanTable loans={loans.slice(0, 8)} user={user} onRefresh={refreshLoans} />
          </div>
        </>
      )}

      {/* ── CUSTOMERS ── */}
      {activeTab === 'customers' && (
        <div style={{ animation: 'fadeInUp 0.4s ease' }}>
          <div style={{ ...G, marginBottom: '16px' }}>
            <h3 className="db-section-title" style={{ margin: 0 }}>👥 All Customers
              <span style={{ marginLeft: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>({customers.length} registered)</span>
            </h3>
          </div>
          <div style={{ ...G, padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="db-table">
                <thead>
                  <tr><th>#</th><th>Full Name</th><th>Phone</th><th>Aadhar</th><th>Address</th><th>Registered</th></tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.3)' }}>No customers yet</td></tr>
                  ) : customers.map((c, i) => (
                    <tr key={c.id}>
                      <td style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: 'white' }}>{c.full_name}</td>
                      <td>{c.phone_number}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>XXXX XXXX {c.aadhar_number?.slice(-4)}</td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.5)' }}>{c.address}</td>
                      <td style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── LOANS ── */}
      {activeTab === 'loans' && (
        <div style={{ animation: 'fadeInUp 0.4s ease' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total',    value: loans.length,                                     color: '#6366f1' },
              { label: 'Pending',  value: loans.filter(l => l.status === 'Pending').length,  color: '#f59e0b' },
              { label: 'Approved', value: loans.filter(l => l.status === 'Approved').length, color: '#10b981' },
              { label: 'Rejected', value: loans.filter(l => l.status === 'Rejected').length, color: '#ef4444' },
            ].map(s => (
              <div key={s.label} style={{ background: `${s.color}18`, border: `1px solid ${s.color}44`, borderRadius: '12px', padding: '12px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div style={{ ...G, padding: '0', overflow: 'hidden' }}>
            <LoanTable loans={loans} user={user} onRefresh={refreshLoans} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
