import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import VerifyEmail from '../pages/VerifyEmail'
import Register from '../pages/Register'
import Login from '../pages/Login'
import CompanyCreate from '../pages/RequestNewComany'
import AdditionalInformation from '../pages/AdditionalInformation'
function ProtectedRoute({ children }) {
  const user = useSelector((s) => s.user.userInfo);
  const token = useSelector((s) => s.user.token);
  const loc = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  if (user && user.emailVerified === false && loc.pathname !== "/verify") {
    return <Navigate to="/verify" replace state={{ email: user.email, skipCooldown: false }} />;
  }

  if (user && !user.phoneNumber && loc.pathname !== "/additional-information") {
    return <Navigate to="/additional-information" replace />;
  }

  return children;
}

function RequireRole({ roleId, children }) {
  const user = useSelector((s) => s.user.userInfo);
  if (!user) return <Navigate to="/login" replace />;
  if (user.roleId !== roleId) return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes(){
  return (
    <Router>
        <Routes>
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/hr/create-company" element={
              <ProtectedRoute>
                <RequireRole roleId={3}>
                  <CompanyCreate />
                </RequireRole>
              </ProtectedRoute>
            } />
            <Route path="/additional-information" element={
              <ProtectedRoute>
                <AdditionalInformation />
              </ProtectedRoute>
            } />
        </Routes>
    </Router>
  )
}

