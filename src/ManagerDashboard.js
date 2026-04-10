import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { creditCardAPI } from "./api";
import "./Dashboard.css";

export default function ManagerDashboard() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsRes, statsRes] = await Promise.all([
        creditCardAPI.getApplications(),
        creditCardAPI.getStatistics(),
      ]);
      setApplications(appsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
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
        <h2>Manager Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Applications</h3>
            <p className="stat-number">{stats?.total || 0}</p>
          </div>
          <div className="stat-card approved">
            <h3>Approved</h3>
            <p className="stat-number">{stats?.approved || 0}</p>
          </div>
          <div className="stat-card rejected">
            <h3>Rejected</h3>
            <p className="stat-number">{stats?.rejected || 0}</p>
          </div>
          <div className="stat-card pending">
            <h3>Pending</h3>
            <p className="stat-number">{stats?.pending || 0}</p>
          </div>
        </div>

        <div className="applications-section">
          <h3>All Credit Card Applications</h3>
          <table className="applications-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Salary (₹)</th>
                <th>Card Type</th>
                <th>Status</th>
                <th>Processed By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.applicant_name}</td>
                  <td>{app.applicant_email}</td>
                  <td>{parseFloat(app.salary).toLocaleString("en-IN")}</td>
                  <td>{app.card_type}</td>
                  <td>
                    <span className={`status ${app.status}`}>{app.status}</span>
                  </td>
                  <td>{app.processed_by_name || "—"}</td>
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
