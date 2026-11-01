import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  RotateCcw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reportsApi } from '../services/api';
import ReportCard from '../components/ReportCard';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function MyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.getMyReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load user reports:', err);
      setError(err.message || 'Unable to retrieve your reports from the server.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  // Statistics for user's reports
  const total = reports.length;
  const pending = reports.filter((r) => String(r.status).toUpperCase() === 'PENDING').length;
  const inProgress = reports.filter((r) => String(r.status).toUpperCase() === 'IN_PROGRESS').length;
  const resolved = reports.filter((r) => String(r.status).toUpperCase() === 'RESOLVED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
            <User className="w-4 h-4" />
            <span>Citizen Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Submitted Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tracking reports filed by <span className="font-semibold text-gray-700">{user?.name}</span> ({user?.email}).
          </p>
        </div>

        <Link
          to="/report-issue"
          className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Problem</span>
        </Link>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">Total Filed</span>
          <span className="text-2xl font-extrabold text-gray-900 mt-1 block">{total}</span>
        </div>
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 shadow-sm">
          <span className="text-xs font-medium text-amber-800 uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl font-extrabold text-amber-900 mt-1 block">{pending}</span>
        </div>
        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 shadow-sm">
          <span className="text-xs font-medium text-blue-800 uppercase tracking-wider block">In Progress</span>
          <span className="text-2xl font-extrabold text-blue-900 mt-1 block">{inProgress}</span>
        </div>
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 shadow-sm">
          <span className="text-xs font-medium text-emerald-800 uppercase tracking-wider block">Resolved</span>
          <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">{resolved}</span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorMessage
          title="Could not load your reports"
          message={error}
          onRetry={fetchMyReports}
        />
      )}

      {/* Loading state */}
      {loading ? (
        <Loading message="Loading your submitted reports..." />
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="py-12 bg-white rounded-2xl border border-gray-100 text-center">
          <EmptyState
            title="You haven't submitted any reports yet"
            description="Notice broken infrastructure, potholes, or overflowing garbage bins in your neighborhood? Report an issue to bring it to municipal attention."
            actionLabel="Report an Issue Now"
            onAction={() => (window.location.href = '/report-issue')}
          />
        </div>
      )}
    </div>
  );
}
