import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { creditCardAPI } from "./api";
import "./Dashboard.css";

export default function ClerkDashboard() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await creditCardAPI.getApplications();
      setApplications(res.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await creditCardAPI.approve(id, remarks);
      setRemarks("");
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      console.error("Error approving application:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await creditCardAPI.reject(id, remarks);
      setRemarks("");
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      console.error("Error rejecting application:", err);
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
        <h2>Clerk Dashboard - Process Applications</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="applications-section">
          <h3>Pending Applications ({applications.length})</h3>
          <table className="applications-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Salary (₹)</th>
                <th>Card Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.applicant_name}</td>
                  <td>{app.applicant_email}</td>
                  <td>{app.applicant_phone}</td>
                  <td>{parseFloat(app.salary).toLocaleString("en-IN")}</td>
                  <td>{app.card_type}</td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => setSelectedApp(app.id)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Process Application</h3>
              <textarea
                placeholder="Add remarks (optional)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows="4"
              />
              <div className="modal-actions">
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(selectedApp)}
                >
                  Approve
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleReject(selectedApp)}
                >
                  Reject
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setSelectedApp(null)}
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
