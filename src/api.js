import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://bank-app-3-1fn0.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (username, password) => 
  axios.post(`${API_URL}/login/`, { username, password });

export const getCustomers = () => api.get('/customers/');
export const createCustomer = (data) => api.post('/customers/', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}/`, data);

export const getAccounts = () => api.get('/accounts/');
export const createAccount = (data) => api.post('/accounts/', data);

export const getTransactions = (accountId) => 
  api.get(`/transactions/`, { params: { account_id: accountId } });
export const deposit = (data) => api.post('/transactions/deposit/', data);
export const withdraw = (data) => api.post('/transactions/withdraw/', data);
export const transfer = (data) => api.post('/transactions/transfer/', data);

export const getLoans = () => api.get('/loans/');
export const createLoan = (data) => api.post('/loans/', data);
export const approveLoan = (id) => api.post(`/loans/${id}/approve/`);
export const rejectLoan = (id) => api.post(`/loans/${id}/reject/`);

export const getCreditCards = () => api.get('/credit-cards/');
export const createCreditCard = (data) => api.post('/credit-cards/', data);
export const approveCreditCard = (id) => api.post(`/credit-cards/${id}/approve/`);

export const getDashboard = () => api.get('/reports/dashboard/');

export default api;

export const registerCustomer = (data) =>
  axios.post(`${API_URL}/register/register/`, data);
