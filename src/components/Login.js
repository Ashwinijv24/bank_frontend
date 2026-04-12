import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import './Login.css';

const STAFF_ROLES = [
  {
    key: 'CSE', label: 'Customer Service', color: '#6366f1',
    glow: 'rgba(99,102,241,0.4)', border: 'rgba(99,102,241,0.5)',
    username: 'cse1', password: 'cse123',
    desc: 'Accounts, transactions & cards',
    svg: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5"/>
        <path d="M14 24a10 10 0 0120 0" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="12" y="23" width="4" height="7" rx="2" fill="#6366f1"/>
        <rect x="32" y="23" width="4" height="7" rx="2" fill="#6366f1"/>
        <path d="M36 30v2a4 4 0 01-4 4h-4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="28" cy="36" r="1.5" fill="#a78bfa"/>
      </svg>
    ),
  },
  {
    key: 'MANAGER', label: 'Branch Manager', color: '#ec4899',
    glow: 'rgba(236,72,153,0.4)', border: 'rgba(236,72,153,0.5)',
    username: 'manager1', password: 'manager123',
    desc: 'Full access & reports',
    svg: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill="rgba(236,72,153,0.15)" stroke="rgba(236,72,153,0.4)" strokeWidth="1.5"/>
        <rect x="13" y="28" width="22" height="8" rx="1" fill="rgba(236,72,153,0.3)" stroke="#ec4899" strokeWidth="1.5"/>
        <rect x="11" y="26" width="26" height="3" rx="1" fill="#ec4899"/>
        <polygon points="24,12 11,26 37,26" fill="rgba(236,72,153,0.4)" stroke="#ec4899" strokeWidth="1.5"/>
        <rect x="21" y="28" width="6" height="8" rx="1" fill="#ec4899"/>
        <rect x="15" y="29" width="4" height="5" rx="0.5" fill="rgba(255,255,255,0.3)"/>
        <rect x="29" y="29" width="4" height="5" rx="0.5" fill="rgba(255,255,255,0.3)"/>
        <circle cx="24" cy="20" r="1.5" fill="#f9a8d4"/>
      </svg>
    ),
  },
];

function Login({ setUser }) {
  // steps: 'main' | 'staff-roles' | 'login'
  const [step, setStep] = useState('main');
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Wake up Render backend on page load
  React.useEffect(() => {
    fetch('https://bank-app-3-1fn0.onrender.com/').catch(() => {});
  }, []);

  const handleStaffRoleSelect = (role) => {
    setSelectedRole(role);
    setUsername('');
    setPassword('');
    setError('');
    setStep('login');
  };

  const handleBack = () => {
    if (step === 'login') setStep('staff-roles');
    else setStep('main');
    setSelectedRole(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(username, password);
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) setError('Invalid username or password');
      else if (!err.response) setError('⏳ Server is waking up (free tier). Please wait 30 seconds and try again.');
      else setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-orb-1" />
      <div className="login-orb-2" />
      <div className="login-orb-3" />

      {/* ── STEP 1: Main — Customer vs Bank ── */}
      {step === 'main' && (
        <div className="login-card login-card--main">
          <div className="login-header">
            <div className="login-bank-icon">
              <svg viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5"/>
                <rect x="14" y="38" width="36" height="10" rx="2" fill="rgba(99,102,241,0.3)" stroke="#6366f1" strokeWidth="1.5"/>
                <rect x="12" y="34" width="40" height="5" rx="1.5" fill="#6366f1"/>
                <polygon points="32,14 12,34 52,34" fill="rgba(99,102,241,0.4)" stroke="#6366f1" strokeWidth="1.5"/>
                <rect x="28" y="38" width="8" height="10" rx="1" fill="#6366f1"/>
                <rect x="17" y="39" width="6" height="7" rx="1" fill="rgba(255,255,255,0.2)"/>
                <rect x="41" y="39" width="6" height="7" rx="1" fill="rgba(255,255,255,0.2)"/>
                <circle cx="32" cy="26" r="2.5" fill="#a78bfa"/>
              </svg>
            </div>
            <h2>Rural Banking System</h2>
            <p className="login-subtitle">Who are you?</p>
          </div>

          <div className="portal-grid">
            {/* Customer Portal */}
            <Link to="/customer-login" className="portal-card portal-card--customer">
              <div className="portal-card__glow" />
              <div className="portal-card__icon">
                <svg viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.35)" strokeWidth="1.5"/>
                  <circle cx="40" cy="28" r="10" fill="rgba(16,185,129,0.3)" stroke="#10b981" strokeWidth="2"/>
                  <path d="M20 62c0-11.046 8.954-20 20-20s20 8.954 20 20" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
                  {/* Loan doc icon */}
                  <rect x="52" y="18" width="14" height="18" rx="2" fill="rgba(16,185,129,0.2)" stroke="#34d399" strokeWidth="1.5"/>
                  <line x1="55" y1="23" x2="63" y2="23" stroke="#34d399" strokeWidth="1.2"/>
                  <line x1="55" y1="27" x2="63" y2="27" stroke="#34d399" strokeWidth="1.2"/>
                  <line x1="55" y1="31" x2="60" y2="31" stroke="#34d399" strokeWidth="1.2"/>
                </svg>
              </div>
              <span className="portal-card__label">Customer</span>
              <span className="portal-card__desc">Apply for loans, check EMI & track your applications</span>
              <div className="portal-card__features">
                <span>📋 Loan Applications</span>
                <span>🧮 EMI Calculator</span>
                <span>📊 Track Status</span>
              </div>
              <div className="portal-card__arrow">→</div>
            </Link>

            {/* Bank Staff Portal */}
            <button className="portal-card portal-card--bank" onClick={() => setStep('staff-roles')}>
              <div className="portal-card__glow" />
              <div className="portal-card__icon">
                <svg viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.35)" strokeWidth="1.5"/>
                  {/* Bank building */}
                  <rect x="18" y="50" width="44" height="12" rx="2" fill="rgba(99,102,241,0.25)" stroke="#6366f1" strokeWidth="1.5"/>
                  <rect x="16" y="44" width="48" height="7" rx="1.5" fill="#6366f1"/>
                  <polygon points="40,18 16,44 64,44" fill="rgba(99,102,241,0.35)" stroke="#6366f1" strokeWidth="1.5"/>
                  <rect x="35" y="50" width="10" height="12" rx="1" fill="#6366f1"/>
                  <rect x="21" y="51" width="8" height="9" rx="1" fill="rgba(255,255,255,0.15)"/>
                  <rect x="51" y="51" width="8" height="9" rx="1" fill="rgba(255,255,255,0.15)"/>
                  {/* Shield/verify */}
                  <path d="M40 20l6 3v5c0 3-2.5 5.5-6 7-3.5-1.5-6-4-6-7v-5l6-3z" fill="rgba(167,139,250,0.3)" stroke="#a78bfa" strokeWidth="1.5"/>
                  <path d="M37 28l2 2 4-4" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="portal-card__label">Bank Staff</span>
              <span className="portal-card__desc">Verify applications, manage accounts & process loans</span>
              <div className="portal-card__features">
                <span>✅ Verify Applications</span>
                <span>🏦 Manage Accounts</span>
                <span>📈 Reports & Approvals</span>
              </div>
              <div className="portal-card__arrow">→</div>
            </button>
          </div>

          <div className="login-register-link">
            <span>New customer?</span>
            <Link to="/register">Register here →</Link>
          </div>
        </div>
      )}

      {/* ── STEP 2: Staff Role Selection ── */}
      {step === 'staff-roles' && (
        <div className="login-card login-card--select">
          <button className="back-btn" onClick={handleBack}>← Back</button>
          <div className="login-header">
            <div className="login-bank-icon">
              <svg viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5"/>
                <rect x="14" y="38" width="36" height="10" rx="2" fill="rgba(99,102,241,0.3)" stroke="#6366f1" strokeWidth="1.5"/>
                <rect x="12" y="34" width="40" height="5" rx="1.5" fill="#6366f1"/>
                <polygon points="32,14 12,34 52,34" fill="rgba(99,102,241,0.4)" stroke="#6366f1" strokeWidth="1.5"/>
                <rect x="28" y="38" width="8" height="10" rx="1" fill="#6366f1"/>
                <rect x="17" y="39" width="6" height="7" rx="1" fill="rgba(255,255,255,0.2)"/>
                <rect x="41" y="39" width="6" height="7" rx="1" fill="rgba(255,255,255,0.2)"/>
                <circle cx="32" cy="26" r="2.5" fill="#a78bfa"/>
              </svg>
            </div>
            <h2>Bank Staff Portal</h2>
            <p className="login-subtitle">Select your role to continue</p>
          </div>
          <div className="role-grid">
            {STAFF_ROLES.map((role) => (
              <button key={role.key} className="role-card" onClick={() => handleStaffRoleSelect(role)}
                style={{ '--role-color': role.color, '--role-glow': role.glow, '--role-border': role.border }}>
                <span className="role-card__svg">{role.svg}</span>
                <span className="role-card__label">{role.label}</span>
                <span className="role-card__desc">{role.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 3: Login Form ── */}
      {step === 'login' && selectedRole && (
        <div className="login-card login-card--form"
          style={{ '--role-color': selectedRole.color, '--role-glow': selectedRole.glow, '--role-border': selectedRole.border }}>
          <button className="back-btn" onClick={handleBack}>← Back</button>
          <div className="login-header">
            <div className="login-role-svg">{selectedRole.svg}</div>
            <h2>{selectedRole.label}</h2>
            <p className="login-subtitle">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter username" required autoFocus autoComplete="off" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter password" required autoComplete="new-password" />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? '⟳ Signing in...' : `Sign in as ${selectedRole.label}`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;
