import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

export default function FieldOfficerDashboard() {
  const [customers, setCustomers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("customers");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [customersRes, groupsRes, loansRes] = await Promise.all([
        axios.get("https://bank-app-aoc8.onrender.com/api/customers/", { headers }),
        axios.get("https://bank-app-aoc8.onrender.com/api/groups/", { headers }),
        axios.get("https://bank-app-aoc8.onrender.com/api/loans/", { headers }),
      ]);

      setCustomers(customersRes.data);
      setGroups(groupsRes.data);
      setLoans(loansRes.data);
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
        <h2>Field Officer Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            Customers ({customers.length})
          </button>
          <button
            className={`tab ${activeTab === "groups" ? "active" : ""}`}
            onClick={() => setActiveTab("groups")}
          >
            Groups ({groups.length})
          </button>
          <button
            className={`tab ${activeTab === "loans" ? "active" : ""}`}
            onClick={() => setActiveTab("loans")}
          >
            Loan Applications ({loans.length})
          </button>
        </div>

        {activeTab === "customers" && (
          <div className="tab-content">
            <h3>My Customers</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
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
                      <span className={`status ${customer.status}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "groups" && (
          <div className="tab-content">
            <h3>Group Accounts</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Group ID</th>
                  <th>Name</th>
                  <th>Members</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td>{group.group_id}</td>
                    <td>{group.name}</td>
                    <td>{group.members_count}</td>
                    <td>₹{parseFloat(group.balance).toLocaleString("en-IN")}</td>
                    <td>
                      <span className={`status ${group.status}`}>
                        {group.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "loans" && (
          <div className="tab-content">
            <h3>Loan Applications</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application #</th>
                  <th>Customer</th>
                  <th>Loan Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.application_number}</td>
                    <td>{loan.customer_name}</td>
                    <td>{loan.loan_type}</td>
                    <td>₹{parseFloat(loan.amount_requested).toLocaleString("en-IN")}</td>
                    <td>
                      <span className={`status ${loan.status}`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
