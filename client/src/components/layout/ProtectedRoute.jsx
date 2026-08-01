import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-xs text-sub uppercase tracking-wider">
        INITIALIZING VITALIS SECURE SESSION...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to default home per role
    const defaultPaths = {
      patient: '/patient/home',
      doctor: '/doctor/queue',
      admin: '/admin/overview'
    };
    return <Navigate to={defaultPaths[user.role] || '/login'} replace />;
  }

  return children;
}
