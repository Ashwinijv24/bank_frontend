import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import './CustomerRegister.css';

export default function CustomerRegister() {
  const [form, setForm] = useState({
    full_name: '', dob: '', aadhar_number: '', phone_number: '', address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.aadhar_number.length !== 12 || !/^\d+$/.test(form.aadhar_number)) {
      setError('Aadhar number must be exactly 12 digits');
      return;
    }
    if (!/^\d{10}$/.test(form.phone_number)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/register/register/`, form);
      setAccountNumber(res.data.account_number || '');
      setSuccess('Registration successful! Your savings account has been created.');
      setForm({ full_name: '', dob: '', aadhar_number: '', phone_number: '', address: '' });
    } catch (err) {
      const data = err.response?.data;
      if (data?.aadhar_number) setError('Aadhar number already registered.');
      else setError(data?.detail || Object.values(data || {})[0] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-container">
      <div className="reg-orb-1" />
      <div className="reg-orb-2" />

      <div className="reg-card">
        {/* Header */}
        <div className="reg-header">
          <div className="reg-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5"/>
              <circle cx="32" cy="24" r="8" fill="rgba(16,185,129,0.3)" stroke="#10b981" strokeWidth="2"/>
              <path d="M16 50c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M38 18l3 3-3 3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Customer Registration</h2>
          <p>Open your bank account today</p>
        </div>

        {success ? (
          <div className="reg-success-box">
            <div className="reg-success-icon">✓</div>
            <h3>Registration Successful!</h3>
            <p>{success}</p>
            {accountNumber && (
              <div className="reg-account-box">
                <span>Your Account Number</span>
                <strong>{accountNumber}</strong>
                <small>Save this number — use it for deposits, withdrawals & transfers</small>
              </div>
            )}
            <div className="reg-success-actions">
              <button onClick={() => { setSuccess(''); setAccountNumber(''); }} className="reg-btn-outline">Register Another</button>
              <Link to="/customer-login" className="reg-btn-primary">Login Now →</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reg-form">
            <div className="reg-row">
              <div className="reg-field">
                <label>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/></svg>
                  Full Name
                </label>
                <input
                  name="full_name" type="text" value={form.full_name}
                  onChange={handleChange} placeholder="Enter your full name" required
                />
              </div>
              <div className="reg-field">
                <label>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                  Date of Birth
                </label>
                <input
                  name="dob" type="date" value={form.dob}
                  onChange={handleChange} required
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="reg-row">
              <div className="reg-field">
                <label>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/></svg>
                  Aadhar Number
                </label>
                <input
                  name="aadhar_number" type="text" value={form.aadhar_number}
                  onChange={handleChange} placeholder="12-digit Aadhar number"
                  maxLength={12} required
                />
              </div>
              <div className="reg-field">
                <label>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                  Phone Number
                </label>
                <input
                  name="phone_number" type="tel" value={form.phone_number}
                  onChange={handleChange} placeholder="10-digit mobile number"
                  maxLength={10} required
                />
              </div>
            </div>

            <div className="reg-field reg-field--full">
              <label>
                <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                Address
              </label>
              <textarea
                name="address" value={form.address}
                onChange={handleChange} placeholder="Enter your full address"
                rows={3} required
              />
            </div>

            {error && <div className="reg-error">{error}</div>}

            <button type="submit" className="reg-submit" disabled={loading}>
              {loading ? '⟳ Registering...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="reg-footer">
          Already registered? <Link to="/login">Staff Login →</Link>
        </div>
      </div>
    </div>
  );
}
