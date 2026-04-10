import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { creditCardAPI } from "./api";
import "./Dashboard.css";

export default function AuditorDashboard() {
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
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

  const filteredApplications =
    filterStatus === "all"
      ? applications
      : applications.filter((app) => app.status === filterStatus);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Auditor Dashboard - View & Audit</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="filter-section">
          <label>Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="applications-section">
          <h3>Applications ({filteredApplications.length})</h3>
          <table className="applications-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Salary (₹)</th>
                <th>Card Type</th>
                <th>Status</th>
                <th>Processed By</th>
                <th>Remarks</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td>{app.applicant_name}</td>
                  <td>{app.applicant_email}</td>
                  <td>{app.applicant_phone}</td>
                  <td>{parseFloat(app.salary).toLocaleString("en-IN")}</td>
                  <td>{app.card_type}</td>
                  <td>
                    <span className={`status ${app.status}`}>{app.status}</span>
                  </td>
                  <td>{app.processed_by_name || "—"}</td>
                  <td>{app.remarks || "—"}</td>
                  <td>{new Date(app.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
