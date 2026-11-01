import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ReportsProvider } from './context/ReportsContext';
import { ProtectedRoute, AdminRoute } from './components/AuthGuards';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Reports from './pages/Reports';
import ReportIssue from './pages/ReportIssue';
import ReportDetails from './pages/ReportDetails';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import MyReports from './pages/MyReports';
import EmptyState from './components/EmptyState';

function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <EmptyState
        title="404 — Page Not Found"
        description="The page you are looking for does not exist or may have been moved."
        actionLabel="Go Back Home"
        onAction={() => (window.location.href = '/')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ReportsProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Top Navigation */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1 w-full">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/browse-reports" element={<Navigate to="/reports" replace />} />
                <Route path="/reports/:id" element={<ReportDetails />} />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/register" element={<Register />} />

                {/* Citizen Authenticated Routes */}
                <Route
                  path="/report-issue"
                  element={
                    <ProtectedRoute>
                      <ReportIssue />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-report"
                  element={<Navigate to="/report-issue" replace />}
                />
                <Route
                  path="/my-reports"
                  element={
                    <ProtectedRoute>
                      <MyReports />
                    </ProtectedRoute>
                  }
                />

                {/* Administrator Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            {/* Bottom Footer */}
            <Footer />
          </div>
        </BrowserRouter>
      </ReportsProvider>
    </AuthProvider>
  );
}
