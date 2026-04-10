import React, { useState, useEffect } from 'react';
import { getAccounts, createAccount, getCustomers } from '../api';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    account_type: 'Savings'
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAccounts();
    loadCustomers();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await getAccounts();
      setAccounts(response.data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAccount(formData);
      setMessage('Account created successfully!');
      setShowForm(false);
      setFormData({ customer: '', account_type: 'Savings' });
      loadAccounts();
    } catch (error) {
      setMessage('Error creating account');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Accounts</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : 'Create Account'}
        </button>
      </div>

      {message && <div className={message.includes('success') ? 'success' : 'error'}>{message}</div>}

      {showForm && (
        <div className="card">
          <h3>New Account</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Customer</label>
              <select
                value={formData.customer}
                onChange={(e) => setFormData({...formData, customer: e.target.value})}
                required
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name} ({customer.aadhar_number})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select
                value={formData.account_type}
                onChange={(e) => setFormData({...formData, account_type: e.target.value})}
                required
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success">Create Account</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Account List</h3>
        <table>
          <thead>
            <tr>
              <th>Account Number</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => (
              <tr key={account.id}>
                <td>{account.account_number}</td>
                <td>{account.customer_name}</td>
                <td>{account.account_type}</td>
                <td>₹{parseFloat(account.balance).toFixed(2)}</td>
                <td>{account.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Accounts;
