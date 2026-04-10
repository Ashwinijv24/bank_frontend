import React, { useState, useEffect } from 'react';
import { getLoans, createLoan, approveLoan, rejectLoan, getCustomers } from '../api';
import api from '../api';

const LOAN_ICONS = {
  personal: '👤', auto: '🚗', home: '🏠', business: '💼', education: '🎓', emergency: '🚨',
};

const LOAN_COLORS = {
  personal: { color: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
  auto:     { color: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
  home:     { color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  business: { color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
  education:{ color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)' },
  emergency:{ color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
};

function StatusBadge({ status }) {
  const styles = {
    Pending:  { bg: 'rgba(245,158,11,0.15)',  color: '#fde68a', border: 'rgba(245,158,11,0.3)' },
    Approved: { bg: 'rgba(16,185,129,0.15)',  color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
    Rejected: { bg: 'rgba(239,68,68,0.15)',   color: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
    Active:   { bg: 'rgba(99,102,241,0.15)',  color: '#c4b5fd', border: 'rgba(99,102,241,0.3)' },
    Closed:   { bg: 'rgba(107,114,128,0.15)', color: '#d1d5db', border: 'rgba(107,114,128,0.3)' },
  };
  const s = styles[status] || styles.Pending;
  return (
    <span style={{
      padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.5px',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{status}</span>
  );
}

function Loans({ user }) {
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [formData, setFormData] = useState({
    customer: '', loan_type: 'personal', loan_amount: '', tenure_months: '12',
    employment_status: 'employed_full', annual_income: '', employment_duration: '',
    credit_score: '', documents_submitted: ''
  });
  const [calculatorData, setCalculatorData] = useState({
    loan_amount: '10000', interest_rate: '5.0', tenure_months: '12'
  });
  const [emiResult, setEmiResult] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => { loadLoans(); loadCustomers(); loadLoanTypes(); }, []);

  const loadLoans = async () => {
    try { const r = await getLoans(); setLoans(r.data); } catch {}
  };
  const loadCustomers = async () => {
    try { const r = await getCustomers(); setCustomers(r.data); } catch {}
  };
  const loadLoanTypes = async () => {
    try { const r = await api.get('/loans/loan_types/'); setLoanTypes(r.data); } catch {}
  };

  const calculateEMI = async () => {
    try { const r = await api.post('/loans/calculate_emi/', calculatorData); setEmiResult(r.data); } catch {}
  };

  const handleLoanTypeChange = (type) => {
    const t = loanTypes.find(lt => lt.type === type);
    setFormData({ ...formData, loan_type: type });
    if (t) setCalculatorData({ ...calculatorData, interest_rate: t.interest_rate.toString() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createLoan(formData);
      setMessage('Loan application submitted successfully!'); setMessageType('success');
      setShowForm(false);
      setFormData({ customer: '', loan_type: 'personal', loan_amount: '', tenure_months: '12',
        employment_status: 'employed_full', annual_income: '', employment_duration: '', credit_score: '', documents_submitted: '' });
      loadLoans();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error creating loan'); setMessageType('error');
    }
  };

  const handleApprove = async (id) => {
    try { await approveLoan(id); setMessage('Loan approved!'); setMessageType('success'); loadLoans(); }
    catch (err) { setMessage(err.response?.data?.error || 'Error'); setMessageType('error'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try { await rejectLoan(id); setMessage('Loan rejected'); setMessageType('error'); loadLoans(); }
    catch (err) { setMessage(err.response?.data?.error || 'Error'); setMessageType('error'); }
  };

  const canCreate = user?.role === 'LOAN';
  const canApprove = user?.role === 'MANAGER';

  const employmentOptions = [
    { value: 'employed_full', label: 'Employed (Full-time)' },
    { value: 'employed_part', label: 'Employed (Part-time)' },
    { value: 'self_employed', label: 'Self-Employed' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'retired', label: 'Retired' },
    { value: 'student', label: 'Student' },
    { value: 'disability', label: 'Disability Benefits' },
  ];

  const stats = [
    { label: 'Total Loans', value: loans.length, color: '#6366f1', border: '#6366f1' },
    { label: 'Pending', value: loans.filter(l => l.status === 'Pending').length, color: '#f59e0b', border: '#f59e0b' },
    { label: 'Approved', value: loans.filter(l => l.status === 'Approved').length, color: '#10b981', border: '#10b981' },
    { label: 'Rejected', value: loans.filter(l => l.status === 'Rejected').length, color: '#ef4444', border: '#ef4444' },
  ];

  const glass = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '18px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800,
          background: 'linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #6366f1 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          💰 Loan Management
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowCalculator(!showCalculator)} className="btn btn-primary">
            {showCalculator ? '✕ Calculator' : '📊 EMI Calculator'}
          </button>
          {canCreate && (
            <button onClick={() => setShowForm(!showForm)} className="btn btn-success">
              {showForm ? '✕ Cancel' : '+ Apply for Loan'}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={messageType === 'success' ? 'success' : 'error'} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ ...glass, padding: '22px', textAlign: 'center',
            borderTop: `2px solid ${s.border}`, transition: 'transform 0.3s, box-shadow 0.3s',
            animation: `fadeInUp 0.5s ease ${i * 0.1}s both` }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.3), 0 0 20px ${s.color}33`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)'; }}>
            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '1px', color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 800,
              background: `linear-gradient(135deg, #fff, ${s.color})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── EMI Calculator ── */}
      {showCalculator && (
        <div style={{ ...glass, padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 22px', color: 'white', fontSize: '18px', fontWeight: 700 }}>📊 EMI Calculator</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
            <div>
              <div className="form-group">
                <label>Loan Amount (₹)</label>
                <input type="number" value={calculatorData.loan_amount}
                  onChange={e => setCalculatorData({ ...calculatorData, loan_amount: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Interest Rate (% per year)</label>
                <input type="number" step="0.1" value={calculatorData.interest_rate}
                  onChange={e => setCalculatorData({ ...calculatorData, interest_rate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tenure (Months)</label>
                <select value={calculatorData.tenure_months}
                  onChange={e => setCalculatorData({ ...calculatorData, tenure_months: e.target.value })}>
                  {[12,24,36,48,60].map(m => <option key={m} value={m}>{m} months ({m/12} yr{m>12?'s':''})</option>)}
                </select>
              </div>
              <button onClick={calculateEMI} className="btn btn-primary">Calculate EMI</button>
            </div>

            {emiResult ? (
              <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '14px', padding: '22px' }}>
                <h4 style={{ margin: '0 0 16px', color: '#c4b5fd', fontSize: '15px', fontWeight: 700 }}>Loan Summary</h4>
                {[
                  ['Monthly EMI', emiResult.monthly_emi, '#a78bfa'],
                  ['Total Interest', emiResult.total_interest, '#f87171'],
                  ['Total Payable', emiResult.total_payable, '#fbbf24'],
                  ['Processing Fee (2%)', emiResult.processing_fee, '#94a3b8'],
                  ['GST (18%)', emiResult.gst_amount, '#94a3b8'],
                  ['Net Disbursal', emiResult.net_disbursal, '#6ee7b7'],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color }}>₹{parseFloat(val).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>Enter values and click Calculate</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Loan Form ── */}
      {showForm && (
        <div style={{ ...glass, padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 22px', color: 'white', fontSize: '18px', fontWeight: 700 }}>📝 New Loan Application</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Customer *</label>
                <select value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })} required>
                  <option value="">Select Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.aadhar_number})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Loan Type *</label>
                <select value={formData.loan_type} onChange={e => handleLoanTypeChange(e.target.value)} required>
                  {loanTypes.map(t => <option key={t.type} value={t.type}>{t.name} ({t.interest_rate}% APR)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Loan Amount (₹) *</label>
                <input type="number" step="0.01" value={formData.loan_amount}
                  onChange={e => setFormData({ ...formData, loan_amount: e.target.value })} required />
                {loanTypes.find(lt => lt.type === formData.loan_type) && (
                  <small style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
                    Range: ₹{loanTypes.find(lt => lt.type === formData.loan_type).min_amount.toLocaleString()} –
                    ₹{loanTypes.find(lt => lt.type === formData.loan_type).max_amount.toLocaleString()}
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>Tenure *</label>
                <select value={formData.tenure_months} onChange={e => setFormData({ ...formData, tenure_months: e.target.value })} required>
                  {[12,24,36,48,60].map(m => <option key={m} value={m}>{m} months ({m/12} yr{m>12?'s':''})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Employment Status *</label>
                <select value={formData.employment_status} onChange={e => setFormData({ ...formData, employment_status: e.target.value })} required>
                  {employmentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Annual Income (₹) *</label>
                <input type="number" step="0.01" value={formData.annual_income}
                  onChange={e => setFormData({ ...formData, annual_income: e.target.value })} required />
                <small style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>Minimum: ₹25,000 (except unemployed)</small>
              </div>
              <div className="form-group">
                <label>Employment Duration (months)</label>
                <input type="number" value={formData.employment_duration}
                  onChange={e => setFormData({ ...formData, employment_duration: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Credit Score (optional)</label>
                <input type="number" value={formData.credit_score} placeholder="300–850"
                  onChange={e => setFormData({ ...formData, credit_score: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Documents Submitted</label>
              <textarea value={formData.documents_submitted} rows={2}
                placeholder="e.g., Aadhar, PAN, Salary slips, Bank statement"
                onChange={e => setFormData({ ...formData, documents_submitted: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-success">Submit Application</button>
          </form>
        </div>
      )}

      {/* ── Loans Table ── */}
      <div style={{ ...glass, padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 18px', color: 'white', fontSize: '17px', fontWeight: 700 }}>Loan Applications</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Customer</th><th>Type</th><th>Amount</th><th>EMI</th>
                <th>Total Payable</th><th>Net Disbursal</th><th>Tenure</th>
                <th>Status</th><th>Employment</th>
                {canApprove && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 ? (
                <tr><td colSpan={canApprove ? 10 : 9} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '32px' }}>
                  No loan applications yet
                </td></tr>
              ) : loans.map(loan => (
                <tr key={loan.id}>
                  <td>{loan.customer_name}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {LOAN_ICONS[loan.loan_type] || '💰'} {loan.loan_type_display}
                    </span>
                  </td>
                  <td>₹{parseFloat(loan.loan_amount).toLocaleString()}</td>
                  <td style={{ color: '#a78bfa', fontWeight: 600 }}>₹{parseFloat(loan.monthly_payment).toFixed(2)}</td>
                  <td>₹{parseFloat(loan.total_payable).toFixed(2)}</td>
                  <td style={{ color: '#6ee7b7', fontWeight: 600 }}>₹{parseFloat(loan.net_disbursal).toFixed(2)}</td>
                  <td>{loan.tenure_months}m</td>
                  <td><StatusBadge status={loan.status} /></td>
                  <td style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{loan.employment_status_display}</td>
                  {canApprove && (
                    <td>
                      {loan.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleApprove(loan.id)} className="btn btn-success"
                            style={{ padding: '5px 12px', fontSize: '12px' }}>✓ Approve</button>
                          <button onClick={() => handleReject(loan.id)} className="btn btn-danger"
                            style={{ padding: '5px 12px', fontSize: '12px' }}>✕ Reject</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Loan Information Cards ── */}
      <div style={{ ...glass, padding: '28px' }}>
        <h3 style={{ margin: '0 0 22px', color: 'white', fontSize: '17px', fontWeight: 700 }}>📚 Loan Products</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
          {loanTypes.map((type, i) => {
            const lc = LOAN_COLORS[type.type] || LOAN_COLORS.personal;
            return (
              <div key={type.type} style={{
                background: `rgba(255,255,255,0.05)`,
                border: `1px solid ${lc.color}44`,
                borderTop: `2px solid ${lc.color}`,
                borderRadius: '14px', padding: '18px',
                transition: 'transform 0.3s, box-shadow 0.3s',
                animation: `fadeInUp 0.5s ease ${i * 0.07}s both`,
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${lc.glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{LOAN_ICONS[type.type]}</div>
                <h4 style={{ margin: '0 0 5px', color: 'white', fontSize: '14px', fontWeight: 700 }}>{type.name}</h4>
                <p style={{ margin: '0 0 10px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{type.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: lc.color, fontWeight: 700 }}>
                    {type.interest_rate}% APR
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    ₹{type.min_amount.toLocaleString()} – ₹{type.max_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Notes */}
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          borderLeft: '3px solid #f59e0b', borderRadius: '12px', padding: '18px 20px',
        }}>
          <h4 style={{ margin: '0 0 12px', color: '#fbbf24', fontSize: '14px', fontWeight: 700 }}>
            💡 Important Notes
          </h4>
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              'Processing fee: 2% of loan amount',
              'GST: 18% on processing fee',
              'Minimum annual income: ₹25,000 (except unemployed)',
              'Unemployed applicants: Emergency loans only, max ₹5,000',
              'Age requirement: 21–60 years',
            ].map((note, i) => (
              <li key={i} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{note}</li>
            ))}
          </ul>
        </div>
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

export default Loans;
