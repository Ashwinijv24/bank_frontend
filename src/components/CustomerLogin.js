import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';
import './CustomerLogin.css';

export default function CustomerLogin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');   // 'login' | 'register'

  // Login state
  const [phone, setPhone] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [form, setForm] = useState({ full_name: '', dob: '', aadhar_number: '', phone_number: '', address: '' });
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regAccount, setRegAccount] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!/^\d{10}$/.test(phone))  { setLoginError('Enter a valid 10-digit phone number'); return; }
    if (!/^\d{12}$/.test(aadhar)) { setLoginError('Enter a valid 12-digit Aadhar number'); return; }
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/register/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, aadhar_number: aadhar }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('customer', JSON.stringify(data.customer));
        navigate('/customer-portal');
      } else {
        setLoginError(data.error || 'Login failed. Please try again.');
      }
    } catch {
      setLoginError('Cannot connect to server. Make sure the backend is running.');
    }
    setLoginLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError(''); setRegSuccess('');
    if (!/^\d{12}$/.test(form.aadhar_number)) { setRegError('Aadhar must be 12 digits'); return; }
    if (!/^\d{10}$/.test(form.phone_number))  { setRegError('Phone must be 10 digits'); return; }
    setRegLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/register/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setRegAccount(data.account_number || '');
        setRegSuccess('Account created! Login with your phone & Aadhar.');
        setForm({ full_name: '', dob: '', aadhar_number: '', phone_number: '', address: '' });
        setTimeout(() => setTab('login'), 3500);
      } else {
        const err = await res.json();
        setRegError(err.aadhar_number ? 'Aadhar already registered.' : Object.values(err)[0] || 'Registration failed.');
      }
    } catch {
      setRegError('Cannot connect to server.');
    }
    setRegLoading(false);
  };

  return (
    <div className="cl-container">
      <div className="cl-orb-1" /><div className="cl-orb-2" />

      <div className="cl-card">
        {/* Rainbow top border via ::before in CSS */}

        {/* Header */}
        <div className="cl-header">
          <div className="cl-icon">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5"/>
              <circle cx="32" cy="24" r="9" fill="rgba(16,185,129,0.3)" stroke="#10b981" strokeWidth="2"/>
              <path d="M16 52c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h2>Customer Portal</h2>
          <p>Rural Banking System</p>
        </div>

        {/* Tabs */}
        <div className="cl-tabs">
          <button className={`cl-tab ${tab === 'login' ? 'cl-tab--active' : ''}`} onClick={() => setTab('login')}>
            🔑 Login
          </button>
          <button className={`cl-tab ${tab === 'register' ? 'cl-tab--active' : ''}`} onClick={() => setTab('register')}>
            📝 Register
          </button>
        </div>

        {/* ── LOGIN ── */}
        {tab === 'login' && (
          <form className="cl-form" onSubmit={handleLogin}>
            <div className="cl-field">
              <label>
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                Phone Number
              </label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="10-digit mobile number" maxLength={10} required autoFocus />
            </div>
            <div className="cl-field">
              <label>
                <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/></svg>
                Aadhar Number
              </label>
              <input type="text" value={aadhar} onChange={e => setAadhar(e.target.value)}
                placeholder="12-digit Aadhar number" maxLength={12} required />
            </div>
            {loginError && <div className="cl-error">{loginError}</div>}
            <button type="submit" className="cl-btn" disabled={loginLoading}>
              {loginLoading ? '⟳ Verifying...' : 'Login to Portal'}
            </button>
            <p className="cl-hint">Use your registered phone number and Aadhar to login</p>
          </form>
        )}

        {/* ── REGISTER ── */}
        {tab === 'register' && (
          <form className="cl-form" onSubmit={handleRegister}>
            {regSuccess && (
              <div className="cl-success">
                {regSuccess}
                {regAccount && (
                  <div className="cl-account-reveal">
                    <span>Your Account Number</span>
                    <strong>{regAccount}</strong>
                  </div>
                )}
              </div>
            )}
            <div className="cl-row">
              <div className="cl-field">
                <label>Full Name *</label>
                <input type="text" value={form.full_name} required placeholder="As per Aadhar"
                  onChange={e => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="cl-field">
                <label>Date of Birth *</label>
                <input type="date" value={form.dob} required
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  onChange={e => setForm({ ...form, dob: e.target.value })} />
              </div>
            </div>
            <div className="cl-row">
              <div className="cl-field">
                <label>Aadhar Number *</label>
                <input type="text" value={form.aadhar_number} required placeholder="12 digits"
                  maxLength={12} onChange={e => setForm({ ...form, aadhar_number: e.target.value })} />
              </div>
              <div className="cl-field">
                <label>Phone Number *</label>
                <input type="tel" value={form.phone_number} required placeholder="10 digits"
                  maxLength={10} onChange={e => setForm({ ...form, phone_number: e.target.value })} />
              </div>
            </div>
            <div className="cl-field">
              <label>Address *</label>
              <textarea value={form.address} required rows={2} placeholder="Full address"
                onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            {regError && <div className="cl-error">{regError}</div>}
            <button type="submit" className="cl-btn cl-btn--green" disabled={regLoading}>
              {regLoading ? '⟳ Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="cl-footer">
          <Link to="/login">← Back to Staff Login</Link>
        </div>
      </div>
    </div>
  );
}
