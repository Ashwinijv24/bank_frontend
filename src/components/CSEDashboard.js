import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

export default function CSEDashboard() {
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionType, setTransactionType] = useState("deposit");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [customersRes, accountsRes] = await Promise.all([
        axios.get("https://bank-app-3-1fn0.onrender.com/api/customers/", { headers }),
        axios.get("https://bank-app-3-1fn0.onrender.com/api/savings-accounts/", { headers }),
      ]);

      setCustomers(customersRes.data);
      setAccounts(accountsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (accountId) => {
    if (!transactionAmount || parseFloat(transactionAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const endpoint =
        transactionType === "deposit"
          ? `https://bank-app-3-1fn0.onrender.com/api/savings-accounts/${accountId}/deposit/`
          : `https://bank-app-3-1fn0.onrender.com/api/savings-accounts/${accountId}/withdrawal/`;

      const response = await axios.post(
        endpoint,
        { amount: transactionAmount, description: `${transactionType} by CSE` },
        { headers }
      );

      alert(`${transactionType.toUpperCase()} successful!`);
      setTransactionAmount("");
      fetchData();
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || "Transaction failed"}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Customer Service Executive Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="cse-container">
          <div className="customers-section">
            <h3>Customers</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.customer_id}</td>
                    <td>{customer.first_name} {customer.last_name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        View Account
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedCustomer && (
            <div className="transaction-section">
              <h3>Account Operations - {selectedCustomer.first_name}</h3>
              <div className="transaction-form">
                <div className="form-group">
                  <label>Transaction Type</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                  >
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>

                <button
                  className="submit-btn"
                  onClick={() => {
                    const account = accounts.find(
                      (a) => a.customer === selectedCustomer.id
                    );
                    if (account) {
                      handleTransaction(account.id);
                    } else {
                      alert("No savings account found for this customer");
                    }
                  }}
                >
                  Process {transactionType.toUpperCase()}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
