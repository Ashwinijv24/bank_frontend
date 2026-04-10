import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

export default function LoanOfficerDashboard() {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get("https://bank-app-aoc8.onrender.com/api/loans/", {
        headers,
      });

      setLoans(response.data);
    } catch (err) {
      console.error("Error fetching loans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loanId) => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        `https://bank-app-aoc8.onrender.com/api/loans/${loanId}/approve/`,
        { amount_approved: selectedLoan.amount_requested },
        { headers }
      );

      alert("Loan approved successfully!");
      setSelectedLoan(null);
      setRemarks("");
      fetchLoans();
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || "Approval failed"}`);
    }
  };

  const handleReject = async (loanId) => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        `https://bank-app-aoc8.onrender.com/api/loans/${loanId}/reject/`,
        { reason: remarks },
        { headers }
      );

      alert("Loan rejected successfully!");
      setSelectedLoan(null);
      setRemarks("");
      fetchLoans();
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || "Rejection failed"}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) return <div className="loading">Loading...</div>;

  const pendingLoans = loans.filter((l) =>
    ["submitted", "under_review"].includes(l.status)
  );

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Loan Officer Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="loan-container">
          <div className="loans-section">
            <h3>Pending Loan Applications ({pendingLoans.length})</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application #</th>
                  <th>Customer</th>
                  <th>Loan Type</th>
                  <th>Amount Requested</th>
                  <th>Tenure (Months)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.application_number}</td>
                    <td>{loan.customer_name}</td>
                    <td>{loan.loan_type}</td>
                    <td>₹{parseFloat(loan.amount_requested).toLocaleString("en-IN")}</td>
                    <td>{loan.tenure_months}</td>
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
                        Review
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
                <h3>Loan Application Review</h3>
                <div className="loan-details">
                  <p>
                    <strong>Application #:</strong> {selectedLoan.application_number}
                  </p>
                  <p>
                    <strong>Customer:</strong> {selectedLoan.customer_name}
                  </p>
                  <p>
                    <strong>Loan Type:</strong> {selectedLoan.loan_type}
                  </p>
                  <p>
                    <strong>Amount Requested:</strong> ₹
                    {parseFloat(selectedLoan.amount_requested).toLocaleString("en-IN")}
                  </p>
                  <p>
                    <strong>Interest Rate:</strong> {selectedLoan.interest_rate}%
                  </p>
                  <p>
                    <strong>Tenure:</strong> {selectedLoan.tenure_months} months
                  </p>
                  <p>
                    <strong>Purpose:</strong> {selectedLoan.purpose}
                  </p>
                </div>

                <textarea
                  placeholder="Add remarks (optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="4"
                />

                <div className="modal-actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove(selectedLoan.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleReject(selectedLoan.id)}
                  >
                    Reject
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
    </div>
  );
}
