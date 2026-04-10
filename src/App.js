import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CustomerRegister from './components/CustomerRegister';
import CustomerPortal from './components/CustomerPortal';
import CustomerLogin from './components/CustomerLogin';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Accounts from './components/Accounts';
import Transactions from './components/Transactions';
import Loans from './components/Loans';
import CreditCards from './components/CreditCards';
import Reports from './components/Reports';
import Layout from './components/Layout';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/customer-portal" element={<CustomerPortal />} />
        <Route path="/" element={<ProtectedRoute><Layout user={user} setUser={setUser} /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard user={user} />} />
          <Route path="customers" element={<ProtectedRoute allowedRoles={['FIELD', 'CSE', 'LOAN', 'MANAGER']}><Customers user={user} /></ProtectedRoute>} />
          <Route path="accounts" element={<ProtectedRoute allowedRoles={['CSE', 'MANAGER']}><Accounts user={user} /></ProtectedRoute>} />
          <Route path="transactions" element={<ProtectedRoute allowedRoles={['CSE', 'MANAGER']}><Transactions user={user} /></ProtectedRoute>} />
          <Route path="loans" element={<ProtectedRoute allowedRoles={['CSE', 'LOAN', 'MANAGER']}><Loans user={user} /></ProtectedRoute>} />
          <Route path="credit-cards" element={<ProtectedRoute allowedRoles={['CSE', 'MANAGER']}><CreditCards user={user} /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute allowedRoles={['MANAGER']}><Reports user={user} /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
