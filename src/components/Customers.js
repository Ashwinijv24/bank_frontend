import React, { useState, useEffect } from 'react';
import { getCustomers, createCustomer } from '../api';

function Customers({ user }) {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    dob: '',
    aadhar_number: '',
    phone_number: '',
    address: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

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
      await createCustomer(formData);
      setMessage('Customer created successfully!');
      setShowForm(false);
      setFormData({ full_name: '', dob: '', aadhar_number: '', phone_number: '', address: '' });
      loadCustomers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error creating customer');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const canCreate = ['FIELD', 'CSE'].includes(user?.role);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '3px solid #e3f2fd' }}>
        <h2 style={{ color: '#1565C0', fontSize: '28px', fontWeight: '700', margin: 0 }}>👥 Customers</h2>
        {canCreate && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? '✕ Cancel' : '➕ Add Customer'}
          </button>
        )}
      </div>

      {message && <div className={message.includes('success') ? 'success' : 'error'}>{message}</div>}

      {showForm && (
        <div className="card">
          <h3 style={{ color: '#1976D2', marginBottom: '20px' }}>New Customer</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Aadhar Number</label>
              <input
                type="text"
                value={formData.aadhar_number}
                onChange={(e) => setFormData({...formData, aadhar_number: e.target.value})}
                maxLength="12"
                required
                placeholder="12-digit Aadhar number"
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                required
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
                rows="3"
                placeholder="Enter complete address"
              />
            </div>
            <button type="submit" className="btn btn-success">✓ Create Customer</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ color: '#1976D2', marginBottom: '20px' }}>Customer List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Aadhar</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td style={{ fontWeight: '600', color: '#1976D2' }}>{customer.full_name}</td>
                <td>{customer.aadhar_number}</td>
                <td>{customer.phone_number}</td>
                <td>{customer.address}</td>
                <td>{customer.created_by_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Customers;
