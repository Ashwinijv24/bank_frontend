import React, { useState, useEffect } from 'react';
import { getAccounts, deposit, withdraw, transfer, getTransactions } from '../api';

function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactionType, setTransactionType] = useState('deposit');
  const [formData, setFormData] = useState({
    account_number: '',
    amount: '',
    to_account: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions(selectedAccount);
    }
  }, [selectedAccount]);

  const loadAccounts = async () => {
    try {
      const response = await getAccounts();
      setAccounts(response.data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadTransactions = async (accountId) => {
    try {
      const response = await getTransactions(accountId);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      if (transactionType === 'deposit') {
        await deposit({ account_number: formData.account_number, amount: formData.amount });
        setMessage('Deposit successful!');
      } else if (transactionType === 'withdraw') {
        await withdraw({ account_number: formData.account_number, amount: formData.amount });
        setMessage('Withdrawal successful!');
      } else if (transactionType === 'transfer') {
        await transfer({ 
          from_account: formData.account_number, 
          to_account: formData.to_account, 
          amount: formData.amount 
        });
        setMessage('Transfer successful!');
      }
      
      setFormData({ account_number: '', amount: '', to_account: '' });
      loadAccounts();
      if (selectedAccount) {
        loadTransactions(selectedAccount);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Transaction failed');
    }
  };

  return (
    <div>
      <h2>Transactions</h2>

      <div className="card">
        <h3>New Transaction</h3>
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => setTransactionType('deposit')} 
            className={`btn ${transactionType === 'deposit' ? 'btn-primary' : ''}`}
            style={{ marginRight: '10px' }}
          >
            Deposit
          </button>
          <button 
            onClick={() => setTransactionType('withdraw')} 
            className={`btn ${transactionType === 'withdraw' ? 'btn-primary' : ''}`}
            style={{ marginRight: '10px' }}
          >
            Withdraw
          </button>
          <button 
            onClick={() => setTransactionType('transfer')} 
            className={`btn ${transactionType === 'transfer' ? 'btn-primary' : ''}`}
          >
            Transfer
          </button>
        </div>

        {message && <div className={message.includes('success') ? 'success' : 'error'}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{transactionType === 'transfer' ? 'From Account' : 'Account Number'}</label>
            <select
              value={formData.account_number}
              onChange={(e) => setFormData({...formData, account_number: e.target.value})}
              required
            >
              <option value="">Select Account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.account_number}>
                  {account.account_number} - {account.customer_name} (₹{account.balance})
                </option>
              ))}
            </select>
          </div>

          {transactionType === 'transfer' && (
            <div className="form-group">
              <label>To Account</label>
              <select
                value={formData.to_account}
                onChange={(e) => setFormData({...formData, to_account: e.target.value})}
                required
              >
                <option value="">Select Account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.account_number}>
                    {account.account_number} - {account.customer_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn btn-success">
            {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Transaction History</h3>
        <div className="form-group">
          <label>Select Account</label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            <option value="">Select Account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.account_number} - {account.customer_name}
              </option>
            ))}
          </select>
        </div>

        {selectedAccount && (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Reference</th>
                <th>Processed By</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                  <td>{transaction.transaction_type}</td>
                  <td>₹{parseFloat(transaction.amount).toFixed(2)}</td>
                  <td>{transaction.reference_account || '-'}</td>
                  <td>{transaction.created_by_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Transactions;
