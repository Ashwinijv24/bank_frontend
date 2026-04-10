import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import FieldOfficerDashboard from "./components/FieldOfficerDashboard";
import CSEDashboard from "./components/CSEDashboard";
import LoanOfficerDashboard from "./components/LoanOfficerDashboard";
import BranchManagerDashboard from "./components/BranchManagerDashboard";
import "./App.css";

function ProtectedRoute({ children, requiredRole }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("access_token");

  if (!token || !user) {
    return <Navigate to="/" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}

export default function RuralBankingApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route
          path="/field-officer"
          element={
            <ProtectedRoute requiredRole="field_officer">
              <FieldOfficerDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/cse"
          element={
            <ProtectedRoute requiredRole="cse">
              <CSEDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/loan-officer"
          element={
            <ProtectedRoute requiredRole="loan_officer">
              <LoanOfficerDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/branch-manager"
          element={
            <ProtectedRoute requiredRole="branch_manager">
              <BranchManagerDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
