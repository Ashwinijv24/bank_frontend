import React, { useState, useEffect } from 'react';
import { getCreditCards, createCreditCard, approveCreditCard, getCustomers } from '../api';

function CreditCards({ user }) {
  const [cards, setCards] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    credit_limit: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCards();
    loadCustomers();
  }, []);

  const loadCards = async () => {
    try {
      const response = await getCreditCards();
      setCards(response.data);
    } catch (error) {
      console.error('Error loading credit cards:', error);
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
      await createCreditCard(formData);
      setMessage('Credit card request created successfully!');
      setShowForm(false);
      setFormData({ customer: '', credit_limit: '' });
      loadCards();
    } catch (error) {
      setMessage('Error creating credit card request');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveCreditCard(id);
      setMessage('Credit card approved successfully!');
      loadCards();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error approving credit card');
    }
  };

  const canCreate = user?.role === 'CSE';
  const canApprove = user?.role === 'MANAGER';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Credit Cards</h2>
        {canCreate && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : 'Request Credit Card'}
          </button>
        )}
      </div>

      {message && <div className={message.includes('success') ? 'success' : 'error'}>{message}</div>}

      {showForm && (
        <div className="card">
          <h3>New Credit Card Request</h3>
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
              <label>Credit Limit</label>
              <input
                type="number"
                step="0.01"
                value={formData.credit_limit}
                onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn btn-success">Submit Request</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Credit Card List</h3>
        <table>
          <thead>
            <tr>
              <th>Card Number</th>
              <th>Customer</th>
              <th>Credit Limit</th>
              <th>Outstanding</th>
              <th>Status</th>
              <th>Approved By</th>
              {canApprove && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {cards.map(card => (
              <tr key={card.id}>
                <td>{card.card_number}</td>
                <td>{card.customer_name}</td>
                <td>₹{parseFloat(card.credit_limit).toFixed(2)}</td>
                <td>₹{parseFloat(card.current_outstanding).toFixed(2)}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    backgroundColor: card.status === 'Approved' ? '#d4edda' : 
                                   card.status === 'Blocked' ? '#f8d7da' : '#fff3cd',
                    color: card.status === 'Approved' ? '#155724' : 
                           card.status === 'Blocked' ? '#721c24' : '#856404'
                  }}>
                    {card.status}
                  </span>
                </td>
                <td>{card.approved_by_name || '-'}</td>
                {canApprove && (
                  <td>
                    {card.status === 'Pending' && (
                      <button 
                        onClick={() => handleApprove(card.id)} 
                        className="btn btn-success"
                        style={{ padding: '5px 10px' }}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CreditCards;
