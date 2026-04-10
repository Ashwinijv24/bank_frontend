import React, { useState, useEffect } from 'react';
import { getDashboard } from '../api';
import './Reports.css';

function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await getDashboard();
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Reports & Dashboard</h2>
      
      <div className="reports-grid">
        <div className="report-card">
          <div className="report-icon">👥</div>
          <div className="report-content">
            <h3>Total Customers</h3>
            <p className="report-value">{data?.total_customers || 0}</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon">🏦</div>
          <div className="report-content">
            <h3>Total Accounts</h3>
            <p className="report-value">{data?.total_accounts || 0}</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon">💰</div>
          <div className="report-content">
            <h3>Total Loans</h3>
            <p className="report-value">{data?.total_loans || 0}</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon">📊</div>
          <div className="report-content">
            <h3>Transactions Today</h3>
            <p className="report-value">{data?.total_transactions_today || 0}</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon">⏳</div>
          <div className="report-content">
            <h3>Pending Loans</h3>
            <p className="report-value">{data?.pending_loans || 0}</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon">✅</div>
          <div className="report-content">
            <h3>Approved Loans</h3>
            <p className="report-value">{data?.approved_loans || 0}</p>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon">💵</div>
          <div className="report-content">
            <h3>Deposits Today</h3>
            <p className="report-value">₹{parseFloat(data?.total_deposits_today || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h3>Real-Time Monitoring</h3>
        <p>Dashboard updates automatically every 30 seconds</p>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default Reports;
