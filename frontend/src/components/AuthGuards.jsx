import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

/**
 * ProtectedRoute:
 * Requires the user to be logged in (Citizen or Admin).
 * Redirects unauthenticated visitors to /login, remembering the attempted URL.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <Loading message="Verifying authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * AdminRoute:
 * Requires the user to be authenticated and possess the 'ADMIN' role.
 * Shows an Access Denied alert if a citizen user tries to access administrator tools.
 */
export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <Loading message="Verifying administrator privileges..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-red-900">Administrator Access Required</h2>
          <p className="text-sm text-red-700 leading-relaxed">
            Your current account does not have administrator privileges to manage reports or update ticket statuses.
            Please sign in with an authorized municipal administrator account.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/reports"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Reports</span>
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-white rounded-xl text-sm font-semibold hover:bg-emerald-900 transition-colors shadow-sm"
            >
              <span>Admin Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
