import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

export default function BranchManagerDashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLoans: 0,
    totalSavings: 0,
    pendingLoans: 0,
  });
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [customersRes, loansRes, accountsRes] = await Promise.all([
        axios.get("https://bank-app-3-1fn0.onrender.com/api/customers/", { headers }),
        axios.get("https://bank-app-3-1fn0.onrender.com/api/loans/", { headers }),
        axios.get("https://bank-app-3-1fn0.onrender.com/api/savings-accounts/", { headers }),
      ]);

      const totalSavings = accountsRes.data.reduce(
        (sum, acc) => sum + parseFloat(acc.balance || 0),
        0
      );

      setStats({
        totalCustomers: customersRes.data.length,
        totalLoans: loansRes.data.length,
        totalSavings: totalSavings,
        pendingLoans: loansRes.data.filter((l) =>
          ["submitted", "under_review"].includes(l.status)
        ).length,
      });

      setLoans(loansRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = async (loanId) => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        `https://bank-app-3-1fn0.onrender.com/api/loans/${loanId}/disburse/`,
        {},
        { headers }
      );

      alert("Loan disbursed successfully!");
      setSelectedLoan(null);
      fetchData();
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || "Disbursement failed"}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) return <div className="loading">Loading...</div>;

  const approvedLoans = loans.filter((l) => l.status === "approved");

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Branch Manager Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Customers</h3>
            <p className="stat-number">{stats.totalCustomers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Loans</h3>
            <p className="stat-number">{stats.totalLoans}</p>
          </div>
          <div className="stat-card">
            <h3>Total Savings</h3>
            <p className="stat-number">
              ₹{stats.totalSavings.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="stat-card pending">
            <h3>Pending Approvals</h3>
            <p className="stat-number">{stats.pendingLoans}</p>
          </div>
        </div>

        <div className="loans-section">
          <h3>Approved Loans Ready for Disbursement ({approvedLoans.length})</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Application #</th>
                <th>Customer</th>
                <th>Loan Type</th>
                <th>Amount Approved</th>
                <th>Interest Rate</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.application_number}</td>
                  <td>{loan.customer_name}</td>
                  <td>{loan.loan_type}</td>
                  <td>
                    ₹{parseFloat(loan.amount_approved || 0).toLocaleString("en-IN")}
                  </td>
                  <td>{loan.interest_rate}%</td>
                  <td>
                    <span className={`status ${loan.status}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => setSelectedLoan(loan)}
                    >
                      Disburse
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedLoan && (
          <div className="modal-overlay" onClick={() => setSelectedLoan(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Disburse Loan</h3>
              <div className="loan-details">
                <p>
                  <strong>Application #:</strong> {selectedLoan.application_number}
                </p>
                <p>
                  <strong>Customer:</strong> {selectedLoan.customer_name}
                </p>
                <p>
                  <strong>Amount to Disburse:</strong> ₹
                  {parseFloat(selectedLoan.amount_approved).toLocaleString("en-IN")}
                </p>
                <p>
                  <strong>Tenure:</strong> {selectedLoan.tenure_months} months
                </p>
                <p>
                  <strong>Interest Rate:</strong> {selectedLoan.interest_rate}%
                </p>
              </div>

              <div className="modal-actions">
                <button
                  className="approve-btn"
                  onClick={() => handleDisburse(selectedLoan.id)}
                >
                  Confirm Disbursement
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setSelectedLoan(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
