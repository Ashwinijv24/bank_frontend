import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';
import './CustomerPortal.css';

const LOAN_TYPES = [
  { type: 'personal',  name: 'Personal Loan',  rate: 5.0,  min: 1000,   max: 100000, icon: '👤', color: '#6366f1' },
  { type: 'auto',      name: 'Auto Loan',       rate: 3.5,  min: 1000,   max: 50000,  icon: '🚗', color: '#06b6d4' },
  { type: 'home',      name: 'Home Loan',       rate: 2.8,  min: 5000,   max: 500000, icon: '🏠', color: '#10b981' },
  { type: 'business',  name: 'Business Loan',   rate: 6.5,  min: 1000,   max: 100000, icon: '💼', color: '#f59e0b' },
  { type: 'education', name: 'Education Loan',  rate: 4.2,  min: 500,    max: 200000, icon: '🎓', color: '#8b5cf6' },
  { type: 'emergency', name: 'Emergency Loan',  rate: 7.0,  min: 100,    max: 20000,  icon: '🚨', color: '#ef4444' },
];

const STATUS_STYLE = {
  Pending:  { bg: 'rgba(245,158,11,0.15)',  color: '#fde68a', border: 'rgba(245,158,11,0.3)' },
  Approved: { bg: 'rgba(16,185,129,0.15)',  color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
  Rejected: { bg: 'rgba(239,68,68,0.15)',   color: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
  Active:   { bg: 'rgba(99,102,241,0.15)',  color: '#c4b5fd', border: 'rgba(99,102,241,0.3)' },
  Inactive: { bg: 'rgba(107,114,128,0.15)', color: '#d1d5db', border: 'rgba(107,114,128,0.3)' },
  DEPOSIT:  { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7', border: 'rgba(16,185,129,0.25)' },
  WITHDRAW: { bg: 'rgba(239,68,68,0.12)',   color: '#fca5a5', border: 'rgba(239,68,68,0.25)' },
  TRANSFER: { bg: 'rgba(99,102,241,0.12)',  color: '#c4b5fd', border: 'rgba(99,102,241,0.25)' },
};

function Badge({ label }) {
  const s = STATUS_STYLE[label] || STATUS_STYLE.Inactive;
  return (
    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}
    </span>
  );
}

export default function CustomerPortal() {
  const navigate = useNavigate();
  const customer = JSON.parse(localStorage.getItem('customer') || 'null');

  // Redirect if not logged in
  useEffect(() => {
    if (!customer) navigate('/customer-login');
  }, [customer, navigate]);

  const [tab, setTab] = useState('account');
  const [dashData, setDashData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState('');

  // Banking
  const [bankOp, setBankOp] = useState('deposit'); // 'deposit' | 'withdraw' | 'transfer'
  const [bankForm, setBankForm] = useState({ account_number: '', to_account: '', amount: '' });
  const [bankMsg, setBankMsg] = useState('');
  const [bankMsgType, setBankMsgType] = useState('');
  const [bankLoading, setBankLoading] = useState(false);

  // EMI
  const [emi, setEmi] = useState({ loan_amount: '50000', interest_rate: '5.0', tenure_months: '24' });
  const [emiResult, setEmiResult] = useState(null);
  const [selectedLoanType, setSelectedLoanType] = useState(LOAN_TYPES[0]);

  // Apply
  const [form, setForm] = useState({
    full_name: customer?.full_name || '', phone_number: customer?.phone_number || '',
    aadhar_number: customer?.aadhar_number || '',
    loan_type: 'personal', loan_amount: '', tenure_months: '24',
    employment_status: 'employed_full', annual_income: '', purpose: '',
  });
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitType, setSubmitType] = useState('');
  const [submitResult, setSubmitResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load dashboard data
  useEffect(() => {
    if (!customer?.id) return;
    const load = async () => {
      setDashLoading(true);
      try {
        const r = await fetch(`${API_BASE}/api/register/dashboard/?customer_id=${customer.id}`);
        const data = await r.json();
        if (r.ok) setDashData(data);
        else setDashError(data.error || 'Failed to load account data');
      } catch {
        setDashError('Cannot connect to server.');
      }
      setDashLoading(false);
    };
    load();
  }, [customer?.id]);

  const calcEMI = () => {
    const P = parseFloat(emi.loan_amount);
    const annualRate = parseFloat(emi.interest_rate);
    const n = parseInt(emi.tenure_months);

    if (!P || !annualRate || !n || P <= 0 || annualRate <= 0 || n <= 0) return;

    const r = annualRate / 100 / 12;
    const monthly_emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total_payable = monthly_emi * n;
    const total_interest = total_payable - P;
    const processing_fee = P * 0.02;
    const gst_amount = processing_fee * 0.18;
    const net_disbursal = P - processing_fee - gst_amount;

    setEmiResult({
      monthly_emi: monthly_emi.toFixed(2),
      total_interest: total_interest.toFixed(2),
      total_payable: total_payable.toFixed(2),
      processing_fee: processing_fee.toFixed(2),
      gst_amount: gst_amount.toFixed(2),
      net_disbursal: net_disbursal.toFixed(2),
    });
  };

  const handleLoanTypeClick = (lt) => {
    setSelectedLoanType(lt);
    setEmi(prev => ({ ...prev, interest_rate: lt.rate.toString() }));
    setEmiResult(null);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true); setSubmitMsg(''); setSubmitType('');

    if (!form.loan_amount || parseFloat(form.loan_amount) <= 0) {
      setSubmitMsg('Please enter a valid loan amount.'); setSubmitType('error');
      setSubmitting(false); return;
    }
    if (!form.annual_income || parseFloat(form.annual_income) <= 0) {
      setSubmitMsg('Please enter your annual income.'); setSubmitType('error');
      setSubmitting(false); return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/register/apply_loan/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          loan_type: form.loan_type,
          loan_amount: form.loan_amount,
          tenure_months: form.tenure_months,
          employment_status: form.employment_status,
          annual_income: form.annual_income,
          purpose: form.purpose,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMsg(`✅ ${data.message}`);
        setSubmitType('success');
        setSubmitResult(data);
        // Refresh dashboard
        const r2 = await fetch(`${API_BASE}/api/register/dashboard/?customer_id=${customer.id}`);
        if (r2.ok) setDashData(await r2.json());
      } else {
        setSubmitMsg(data.error || 'Submission failed.'); setSubmitType('error');
      }
    } catch {
      setSubmitMsg('Cannot connect to server.'); setSubmitType('error');
    }
    setSubmitting(false);
  };

  const handleBanking = async (e) => {
    e.preventDefault();
    setBankMsg(''); setBankLoading(true);
    const base = `${API_BASE}/api/register`;
    const payload = { customer_id: customer.id, account_number: bankForm.account_number, amount: bankForm.amount };
    try {
      let res, data;
      if (bankOp === 'deposit') {
        res = await fetch(`${base}/deposit/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else if (bankOp === 'withdraw') {
        res = await fetch(`${base}/withdraw/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        res = await fetch(`${base}/transfer/`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, from_account: bankForm.account_number, to_account: bankForm.to_account }) });
      }
      data = await res.json();
      if (res.ok) {
        setBankMsg(data.message + (data.new_balance ? ` | New Balance: ₹${parseFloat(data.new_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''));
        setBankMsgType('success');
        setBankForm({ account_number: bankForm.account_number, to_account: '', amount: '' });
        const r2 = await fetch(`${API_BASE}/api/register/dashboard/?customer_id=${customer.id}`);
        if (r2.ok) setDashData(await r2.json());
      } else {
        setBankMsg(data.error || 'Transaction failed');
        setBankMsgType('error');
      }
    } catch {
      setBankMsg('Cannot connect to server.');
      setBankMsgType('error');
    }
    setBankLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('customer');
    navigate('/customer-login');
  };

  const glass = {
    background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px',
  };

  if (!customer) return null;

  return (
    <div className="cp-container">
      <div className="cp-orb-1" /><div className="cp-orb-2" />
      <div className="cp-wrapper">

        {/* ── Header ── */}
        <div className="cp-header">
          <div className="cp-header-top">
            <Link to="/customer-login" className="cp-back">← Back</Link>
            <button onClick={handleLogout} className="cp-logout">Logout</button>
          </div>
          <div className="cp-title">
            <span className="cp-title__icon">🏦</span>
            <div>
              <h1>Customer Portal</h1>
              <p>Welcome back, <strong style={{ color: '#6ee7b7' }}>{customer.full_name}</strong></p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="cp-tabs">
          {[
            { key: 'account',  label: '🏠 My Account' },
            { key: 'banking',  label: '💸 Banking' },
            { key: 'emi',      label: '🧮 EMI Calculator' },
            { key: 'apply',    label: '📋 Apply for Loan' },
            { key: 'products', label: '📚 Loan Products' },
          ].map(t => (
            <button key={t.key} className={`cp-tab ${tab === t.key ? 'cp-tab--active' : ''}`}
              onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {/* ══════════════════════════════
            MY ACCOUNT TAB
        ══════════════════════════════ */}
        {tab === 'account' && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            {dashLoading ? (
              <div className="cp-loading">⟳ Loading your account details...</div>
            ) : dashError ? (
              <div className="cp-error">{dashError}</div>
            ) : dashData ? (
              <>
                {/* Summary Cards */}
                <div className="cp-summary-grid">
                  {[
                    { label: 'Total Balance', value: `₹${parseFloat(dashData.summary.total_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#10b981', icon: '💰' },
                    { label: 'Accounts',      value: dashData.summary.total_accounts,  color: '#6366f1', icon: '🏦' },
                    { label: 'Active Loans',  value: dashData.summary.active_loans,    color: '#f59e0b', icon: '📋' },
                    { label: 'Transactions',  value: dashData.summary.total_transactions, color: '#06b6d4', icon: '🔄' },
                  ].map((s, i) => (
                    <div key={i} className="cp-summary-card" style={{ '--s-color': s.color, animationDelay: `${i * 0.08}s` }}>
                      <span className="cp-summary-card__icon">{s.icon}</span>
                      <span className="cp-summary-card__value">{s.value}</span>
                      <span className="cp-summary-card__label">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Profile + Accounts row */}
                <div className="cp-two-col">
                  {/* Profile */}
                  <div style={{ ...glass, padding: '24px' }}>
                    <h3 className="cp-section-title">👤 Profile</h3>
                    {[
                      ['Full Name',    dashData.customer.full_name],
                      ['Phone',        dashData.customer.phone_number],
                      ['Aadhar',       `XXXX XXXX ${dashData.customer.aadhar_number?.slice(-4)}`],
                      ['Date of Birth',dashData.customer.dob],
                      ['Address',      dashData.customer.address],
                      ['Member Since', new Date(dashData.customer.created_at).toLocaleDateString('en-IN')],
                    ].map(([label, val]) => (
                      <div key={label} className="cp-profile-row">
                        <span className="cp-profile-row__label">{label}</span>
                        <span className="cp-profile-row__value">{val || '—'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Accounts */}
                  <div style={{ ...glass, padding: '24px' }}>
                    <h3 className="cp-section-title">🏦 Bank Accounts</h3>
                    {dashData.accounts.length === 0 ? (
                      <div className="cp-empty-small">No accounts linked yet</div>
                    ) : dashData.accounts.map(acc => (
                      <div key={acc.id} className="cp-account-card">
                        <div className="cp-account-card__top">
                          <span className="cp-account-card__type">{acc.account_type}</span>
                          <Badge label={acc.status} />
                        </div>
                        <div className="cp-account-card__number">{acc.account_number}</div>
                        <div className="cp-account-card__balance">
                          ₹{parseFloat(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="cp-account-card__date">
                          Opened: {new Date(acc.created_at).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transactions */}
                <div style={{ ...glass, padding: '24px', marginBottom: '20px' }}>
                  <h3 className="cp-section-title">🔄 Recent Transactions</h3>
                  {dashData.transactions.length === 0 ? (
                    <div className="cp-empty-small">No transactions yet</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="cp-table">
                        <thead>
                          <tr>
                            <th>Date</th><th>Account</th><th>Type</th><th>Amount</th><th>Reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashData.transactions.map(tx => (
                            <tr key={tx.id}>
                              <td>{new Date(tx.timestamp).toLocaleDateString('en-IN')}</td>
                              <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{tx.account_number}</td>
                              <td><Badge label={tx.transaction_type} /></td>
                              <td style={{ fontWeight: 700,
                                color: tx.transaction_type === 'DEPOSIT' ? '#6ee7b7' : tx.transaction_type === 'WITHDRAW' ? '#fca5a5' : '#c4b5fd' }}>
                                {tx.transaction_type === 'DEPOSIT' ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{tx.reference_account || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Loans */}
                <div style={{ ...glass, padding: '24px', marginBottom: '20px' }}>
                  <h3 className="cp-section-title">💰 My Loans</h3>
                  {dashData.loans.length === 0 ? (
                    <div className="cp-empty-small">No loan applications yet.
                      <button className="cp-link-btn" onClick={() => setTab('apply')}>Apply now →</button>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="cp-table">
                        <thead>
                          <tr>
                            <th>Type</th><th>Amount</th><th>EMI</th><th>Tenure</th><th>Interest</th><th>Status</th><th>Applied</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashData.loans.map(loan => (
                            <tr key={loan.id}>
                              <td>{loan.loan_type_display}</td>
                              <td style={{ fontWeight: 600 }}>₹{parseFloat(loan.loan_amount).toLocaleString('en-IN')}</td>
                              <td style={{ color: '#a78bfa', fontWeight: 600 }}>₹{parseFloat(loan.monthly_payment).toFixed(2)}</td>
                              <td>{loan.tenure_months}m</td>
                              <td>{loan.interest_rate}%</td>
                              <td><Badge label={loan.status} /></td>
                              <td style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                {new Date(loan.created_at).toLocaleDateString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Credit Cards */}
                {dashData.credit_cards.length > 0 && (
                  <div style={{ ...glass, padding: '24px', marginBottom: '20px' }}>
                    <h3 className="cp-section-title">💳 Credit Cards</h3>
                    <div className="cp-cards-grid">
                      {dashData.credit_cards.map(card => (
                        <div key={card.id} className="cp-credit-card">
                          <div className="cp-credit-card__top">
                            <span>💳 Credit Card</span>
                            <Badge label={card.status} />
                          </div>
                          <div className="cp-credit-card__number">
                            {card.card_number.replace(/(.{4})/g, '$1 ').trim()}
                          </div>
                          <div className="cp-credit-card__row">
                            <span>Limit</span>
                            <strong>₹{parseFloat(card.credit_limit).toLocaleString('en-IN')}</strong>
                          </div>
                          <div className="cp-credit-card__row">
                            <span>Outstanding</span>
                            <strong style={{ color: '#fca5a5' }}>₹{parseFloat(card.current_outstanding).toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* ══════════════════════════════
            BANKING TAB
        ══════════════════════════════ */}
        {tab === 'banking' && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            {/* Operation selector */}
            <div className="cp-bank-ops">
              {[
                { key: 'deposit',  label: '⬇ Deposit',  color: '#10b981' },
                { key: 'withdraw', label: '⬆ Withdraw', color: '#ef4444' },
                { key: 'transfer', label: '↔ Transfer',  color: '#6366f1' },
              ].map(op => (
                <button key={op.key}
                  className={`cp-bank-op-btn ${bankOp === op.key ? 'cp-bank-op-btn--active' : ''}`}
                  style={{ '--op-color': op.color }}
                  onClick={() => { setBankOp(op.key); setBankMsg(''); setBankForm({ account_number: '', to_account: '', amount: '' }); }}>
                  {op.label}
                </button>
              ))}
            </div>

            <div className="cp-bank-grid">
              {/* Form */}
              <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '28px' }}>
                <h3 className="cp-section-title">
                  {bankOp === 'deposit' ? '⬇ Deposit Money' : bankOp === 'withdraw' ? '⬆ Withdraw Money' : '↔ Transfer Money'}
                </h3>

                {bankMsg && (
                  <div className={bankMsgType === 'success' ? 'cp-success' : 'cp-error'} style={{ marginBottom: '16px' }}>
                    {bankMsg}
                  </div>
                )}

                <form onSubmit={handleBanking}>
                  <div className="cp-field">
                    <label>{bankOp === 'transfer' ? 'From Account Number' : 'Account Number'}</label>
                    {dashData?.accounts?.length > 0 ? (
                      <select value={bankForm.account_number}
                        onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })} required>
                        <option value="">Select your account</option>
                        {dashData.accounts.filter(a => a.status === 'Active').map(a => (
                          <option key={a.id} value={a.account_number}>
                            {a.account_number} — {a.account_type} — ₹{parseFloat(a.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input type="text" value={bankForm.account_number} required placeholder="Enter account number"
                        onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })} />
                    )}
                  </div>

                  {bankOp === 'transfer' && (
                    <div className="cp-field">
                      <label>To Account Number</label>
                      <input type="text" value={bankForm.to_account} required placeholder="Destination account number"
                        onChange={e => setBankForm({ ...bankForm, to_account: e.target.value })} />
                    </div>
                  )}

                  <div className="cp-field">
                    <label>Amount (₹)</label>
                    <input type="number" value={bankForm.amount} required placeholder="Enter amount" min="1" step="0.01"
                      onChange={e => setBankForm({ ...bankForm, amount: e.target.value })} />
                  </div>

                  <button type="submit" disabled={bankLoading}
                    className={`cp-bank-submit ${bankOp}`}>
                    {bankLoading ? '⟳ Processing...' :
                      bankOp === 'deposit' ? '⬇ Deposit Now' :
                      bankOp === 'withdraw' ? '⬆ Withdraw Now' : '↔ Transfer Now'}
                  </button>
                </form>
              </div>

              {/* Quick info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Account balances */}
                <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '22px' }}>
                  <h3 className="cp-section-title">🏦 Your Accounts</h3>
                  {!dashData?.accounts?.length ? (
                    <div className="cp-empty-small">No accounts linked yet. Visit branch to open an account.</div>
                  ) : dashData.accounts.map(acc => (
                    <div key={acc.id} className="cp-mini-account">
                      <div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{acc.account_type}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{acc.account_number}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#6ee7b7' }}>
                          ₹{parseFloat(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <Badge label={acc.status} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent transactions */}
                <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '22px', flex: 1 }}>
                  <h3 className="cp-section-title">🔄 Recent Activity</h3>
                  {!dashData?.transactions?.length ? (
                    <div className="cp-empty-small">No transactions yet</div>
                  ) : dashData.transactions.slice(0, 6).map(tx => (
                    <div key={tx.id} className="cp-mini-tx">
                      <div>
                        <Badge label={tx.transaction_type} />
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>
                          {new Date(tx.timestamp).toLocaleDateString('en-IN')} · {tx.account_number}
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '14px',
                        color: tx.transaction_type === 'DEPOSIT' ? '#6ee7b7' : tx.transaction_type === 'WITHDRAW' ? '#fca5a5' : '#c4b5fd' }}>
                        {tx.transaction_type === 'DEPOSIT' ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            EMI CALCULATOR TAB
        ══════════════════════════════ */}
        {tab === 'emi' && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            <div className="cp-loan-type-grid">
              {LOAN_TYPES.map(lt => (
                <button key={lt.type} className={`cp-lt-btn ${selectedLoanType.type === lt.type ? 'cp-lt-btn--active' : ''}`}
                  style={{ '--lt-color': lt.color }} onClick={() => handleLoanTypeClick(lt)}>
                  <span>{lt.icon}</span><span>{lt.name}</span>
                  <span className="cp-lt-rate">{lt.rate}% APR</span>
                </button>
              ))}
            </div>
            <div className="cp-emi-grid">
              <div style={{ ...glass, padding: '28px' }}>
                <h3 className="cp-section-title">Calculate Your EMI</h3>
                <div className="cp-field">
                  <label>Loan Amount (₹)</label>
                  <input type="number" value={emi.loan_amount} onChange={e => setEmi({ ...emi, loan_amount: e.target.value })} placeholder="Enter amount" />
                  <small>Range: ₹{selectedLoanType.min.toLocaleString()} – ₹{selectedLoanType.max.toLocaleString()}</small>
                </div>
                <div className="cp-field">
                  <label>Interest Rate (% per year)</label>
                  <input type="number" step="0.1" value={emi.interest_rate} onChange={e => setEmi({ ...emi, interest_rate: e.target.value })} />
                </div>
                <div className="cp-field">
                  <label>Tenure</label>
                  <select value={emi.tenure_months} onChange={e => setEmi({ ...emi, tenure_months: e.target.value })}>
                    {[6,12,24,36,48,60,84,120].map(m => <option key={m} value={m}>{m} months ({(m/12).toFixed(1)} yrs)</option>)}
                  </select>
                </div>
                <button className="cp-btn-primary" onClick={calcEMI}>
                  Calculate EMI
                </button>
              </div>
              <div style={{ ...glass, padding: '28px' }}>
                <h3 className="cp-section-title">Loan Summary</h3>
                {emiResult ? (
                  <div className="cp-emi-result">
                    <div className="cp-emi-highlight">
                      <span>Monthly EMI</span>
                      <strong>₹{parseFloat(emiResult.monthly_emi).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    {[
                      ['Total Interest', emiResult.total_interest, '#f87171'],
                      ['Total Payable', emiResult.total_payable, '#fbbf24'],
                      ['Processing Fee (2%)', emiResult.processing_fee, '#94a3b8'],
                      ['GST on Fee (18%)', emiResult.gst_amount, '#94a3b8'],
                      ['Net Disbursal', emiResult.net_disbursal, '#6ee7b7'],
                    ].map(([label, val, color]) => (
                      <div key={label} className="cp-emi-row">
                        <span>{label}</span>
                        <span style={{ color, fontWeight: 600 }}>₹{parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                    <button className="cp-btn-success" style={{ marginTop: '16px', width: '100%' }}
                      onClick={() => { setTab('apply'); setForm(f => ({ ...f, loan_type: selectedLoanType.type, loan_amount: emi.loan_amount, tenure_months: emi.tenure_months })); }}>
                      Apply for this Loan →
                    </button>
                  </div>
                ) : (
                  <div className="cp-empty"><span>🧮</span><p>Select a loan type and enter details, then click Calculate</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            APPLY TAB
        ══════════════════════════════ */}
        {tab === 'apply' && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            {/* Success result card */}
            {submitType === 'success' && submitResult ? (
              <div className="cp-loan-result">
                <div className="cp-loan-result__icon">✅</div>
                <h3>Loan Application Submitted!</h3>
                <p>Your application is under review by the bank.</p>
                <div className="cp-loan-result__details">
                  {[
                    ['Loan ID',    `#${submitResult.loan_id}`],
                    ['Type',       submitResult.loan_type],
                    ['Amount',     `₹${parseFloat(submitResult.loan_amount).toLocaleString('en-IN')}`],
                    ['Monthly EMI',`₹${parseFloat(submitResult.monthly_payment).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
                    ['Status',     submitResult.status],
                  ].map(([label, val]) => (
                    <div key={label} className="cp-loan-result__row">
                      <span>{label}</span>
                      <strong style={{ color: label === 'Status' ? '#fde68a' : 'white' }}>{val}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button className="cp-btn-primary" style={{ flex: 1 }}
                    onClick={() => { setSubmitResult(null); setSubmitMsg(''); setSubmitType(''); }}>
                    Apply Another
                  </button>
                  <button className="cp-btn-success" style={{ flex: 1 }}
                    onClick={() => setTab('account')}>
                    View My Loans →
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ ...glass, padding: '32px' }}>
                <h3 className="cp-section-title">📋 Loan Application</h3>
                {submitMsg && <div className={submitType === 'success' ? 'cp-success' : 'cp-error'} style={{ marginBottom: '16px' }}>{submitMsg}</div>}
                <form onSubmit={handleApply}>
                  <div className="cp-form-grid">
                    <div className="cp-field"><label>Loan Type *</label>
                      <select value={form.loan_type} onChange={e => setForm({ ...form, loan_type: e.target.value })}>
                        {LOAN_TYPES.map(lt => <option key={lt.type} value={lt.type}>{lt.icon} {lt.name} — {lt.rate}% APR</option>)}
                      </select></div>
                    <div className="cp-field"><label>Loan Amount (₹) *</label>
                      <input type="number" value={form.loan_amount} required placeholder="Enter amount"
                        onChange={e => setForm({ ...form, loan_amount: e.target.value })} /></div>
                    <div className="cp-field"><label>Tenure *</label>
                      <select value={form.tenure_months} onChange={e => setForm({ ...form, tenure_months: e.target.value })}>
                        {[6,12,24,36,48,60,84,120].map(m => <option key={m} value={m}>{m} months ({(m/12).toFixed(1)} yrs)</option>)}
                      </select></div>
                    <div className="cp-field"><label>Employment Status *</label>
                      <select value={form.employment_status} onChange={e => setForm({ ...form, employment_status: e.target.value })}>
                        <option value="employed_full">Employed (Full-time)</option>
                        <option value="employed_part">Employed (Part-time)</option>
                        <option value="self_employed">Self-Employed</option>
                        <option value="unemployed">Unemployed</option>
                        <option value="retired">Retired</option>
                        <option value="student">Student</option>
                      </select></div>
                    <div className="cp-field"><label>Annual Income (₹) *</label>
                      <input type="number" value={form.annual_income} required placeholder="Gross annual income"
                        onChange={e => setForm({ ...form, annual_income: e.target.value })} /></div>
                    <div className="cp-field"><label>Purpose</label>
                      <input type="text" value={form.purpose} placeholder="Brief purpose of the loan"
                        onChange={e => setForm({ ...form, purpose: e.target.value })} /></div>
                  </div>
                  <div className="cp-apply-info">
                    <span>📌</span>
                    <span>Your application will be reviewed by the Loan Officer. You can track the status in <strong>My Account → My Loans</strong>.</span>
                  </div>
                  <button type="submit" className="cp-btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '16px' }}>
                    {submitting ? '⟳ Submitting...' : 'Submit Loan Application'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════
            PRODUCTS TAB
        ══════════════════════════════ */}
        {tab === 'products' && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            <div className="cp-products-grid">
              {LOAN_TYPES.map((lt, i) => (
                <div key={lt.type} className="cp-product-card" style={{ '--lt-color': lt.color, animationDelay: `${i * 0.07}s` }}>
                  <div className="cp-product-icon">{lt.icon}</div>
                  <h4>{lt.name}</h4>
                  <div className="cp-product-rate">{lt.rate}% APR</div>
                  <div className="cp-product-range">₹{lt.min.toLocaleString()} – ₹{lt.max.toLocaleString()}</div>
                  <button className="cp-product-btn" onClick={() => { handleLoanTypeClick(lt); setTab('emi'); }}>
                    Calculate EMI →
                  </button>
                </div>
              ))}
            </div>
            <div className="cp-notes">
              <h4>💡 Important Notes</h4>
              <ul>
                <li>Processing fee: 2% of loan amount</li>
                <li>GST: 18% on processing fee</li>
                <li>Minimum annual income: ₹25,000 (except unemployed)</li>
                <li>Unemployed applicants: Emergency loans only, max ₹5,000</li>
                <li>Age requirement: 21–60 years</li>
                <li>Documents required: Aadhar, PAN, Income proof, Bank statement</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
