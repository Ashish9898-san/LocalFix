import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  RotateCcw, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useReports } from '../context/ReportsContext';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate, formatCategory } from '../utils/reportUtils';

export default function Dashboard() {
  const { reports, loading, error, fetchReports } = useReports();

  // Dynamically calculate statistical metrics from live reports state
  const total = reports.length;
  const pending = reports.filter((r) => String(r.status).toUpperCase() === 'PENDING').length;
  const inProgress = reports.filter((r) => String(r.status).toUpperCase() === 'IN_PROGRESS').length;
  const resolved = reports.filter((r) => String(r.status).toUpperCase() === 'RESOLVED').length;

  // Percentage calculations
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
  const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const resolvedPct = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Category counts
  const categoryCounts = reports.reduce((acc, report) => {
    const formattedCat = formatCategory(report.category);
    acc[formattedCat] = (acc[formattedCat] || 0) + 1;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Live Notice Banner */}
      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong>Live Resolution Dashboard (Phase 6):</strong> Metrics below are computed live from civic reports stored in MySQL. Status changes made by administrators update these statistics in real time!
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition-colors shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Panel
          </Link>
          <button
            type="button"
            onClick={fetchReports}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-semibold text-xs transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorMessage
          title="Could not load statistics"
          message={error}
          onRetry={fetchReports}
        />
      )}

      {/* Loading state */}
      {loading ? (
        <Loading message="Calculating statistics from live database reports..." />
      ) : (
        <>
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Civic Resolution Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Real-time status tracking, department workload, and community issue statistics.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                to="/reports"
                className="inline-flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                <Layers className="w-4 h-4 text-gray-500" />
                <span>Browse All</span>
              </Link>
              <Link
                to="/report-issue"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Report</span>
              </Link>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Reports */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Reports</p>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{total}</h3>
                <span className="text-xs text-gray-400 mt-1 block">Logged by citizens</span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            {/* Pending Review */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pending Review</p>
                <h3 className="text-3xl font-extrabold text-amber-700 mt-1">{pending}</h3>
                <span className="text-xs text-amber-600 font-medium mt-1 block">{pendingPct}% of total</span>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">In Progress</p>
                <h3 className="text-3xl font-extrabold text-blue-700 mt-1">{inProgress}</h3>
                <span className="text-xs text-blue-600 font-medium mt-1 block">{inProgressPct}% of total</span>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Resolved */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Resolved</p>
                <h3 className="text-3xl font-extrabold text-emerald-700 mt-1">{resolved}</h3>
                <span className="text-xs text-emerald-600 font-medium mt-1 block">{resolvedPct}% resolution rate</span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Visual Progress & Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Summary */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Status Breakdown
                </h3>
                <span className="text-xs text-gray-500">{total} issues tracked</span>
              </div>

              {/* Segmented Progress Bar */}
              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${resolvedPct}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Resolved: ${resolvedPct}%`}
                />
                <div
                  style={{ width: `${inProgressPct}%` }}
                  className="bg-blue-500 transition-all duration-500"
                  title={`In Progress: ${inProgressPct}%`}
                />
                <div
                  style={{ width: `${pendingPct}%` }}
                  className="bg-amber-400 transition-all duration-500"
                  title={`Pending: ${pendingPct}%`}
                />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-gray-700 font-medium">Resolved ({resolved})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-gray-700 font-medium">In Progress ({inProgress})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-gray-700 font-medium">Pending ({pending})</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                Issues by Category
              </h3>

              {sortedCategories.length > 0 ? (
                <div className="space-y-3">
                  {sortedCategories.map(([category, count]) => {
                    const catPct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span>{category}</span>
                          <span className="text-gray-500">{count} ({catPct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${catPct}%` }}
                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No reports recorded yet to categorize.</p>
              )}
            </div>
          </div>

          {/* Recent Submissions Table / Activity List */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Recent Incident Activity</h3>
                <p className="text-xs text-gray-500 mt-0.5">Chronological record of reported community tickets.</p>
              </div>
              <Link
                to="/reports"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-6">Ticket ID</th>
                    <th className="py-3 px-6">Title &amp; Location</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Reported On</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.slice(0, 5).map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-semibold text-gray-600">
                        #{r.id}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-gray-900 line-clamp-1">{r.title}</div>
                        <div className="text-[11px] text-gray-500 line-clamp-1">{r.location}</div>
                      </td>
                      <td className="py-3.5 px-6 text-gray-700 font-medium">
                        {formatCategory(r.category)}
                      </td>
                      <td className="py-3.5 px-6">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3.5 px-6 text-gray-500">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link
                          to={`/reports/${r.id}`}
                          className="text-emerald-700 hover:text-emerald-900 font-semibold"
                        >
                          Details &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-gray-400 italic">
                        No reports logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
