import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  RotateCcw, 
  Tag, 
  MapPin, 
  Check, 
  Info,
  Loader2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useReports } from '../context/ReportsContext';
import { filterAndSortReports, formatDate, formatCategory } from '../utils/reportUtils';
import SearchFilters from '../components/SearchFilters';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function AdminDashboard() {
  const { reports, loading, error, updateReportStatus, fetchReports } = useReports();

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [locationQuery, setLocationQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination state (Phase 7 Requirement: Support pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Async tracking state
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Compute filtered reports
  const filteredReports = useMemo(() => {
    return filterAndSortReports(reports, {
      searchQuery,
      category: selectedCategory,
      status: selectedStatus,
      locationQuery,
      sortBy,
    });
  }, [reports, searchQuery, selectedCategory, selectedStatus, locationQuery, sortBy]);

  // Reset to first page whenever search criteria or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, locationQuery, sortBy]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, currentPage, pageSize]);

  // Statistics
  const total = reports.length;
  const pending = reports.filter((r) => String(r.status).toUpperCase() === 'PENDING').length;
  const inProgress = reports.filter((r) => String(r.status).toUpperCase() === 'IN_PROGRESS').length;
  const resolved = reports.filter((r) => String(r.status).toUpperCase() === 'RESOLVED').length;

  const handleStatusChange = async (reportId, newStatus) => {
    if (!reportId || !newStatus) return;
    setUpdatingId(reportId);
    setNotification(null);
    try {
      const updated = await updateReportStatus(reportId, newStatus);
      if (updated) {
        const friendlyStatus = newStatus.replace('_', ' ');
        setNotification({
          type: 'success',
          message: `Ticket #${reportId} status successfully updated to "${friendlyStatus}" in MySQL.`,
        });
        setTimeout(() => setNotification(null), 6000);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || `Failed to update status for report #${reportId}. Please verify admin authorization.`,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setLocationQuery('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Backend Authorization & Security Banner */}
      <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-xl shadow-sm text-xs sm:text-sm text-emerald-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-950">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Admin Report Management &amp; Status Workflow (Phase 7)</span>
        </div>
        <p className="leading-relaxed text-emerald-800">
          All status updates are authenticated by the Spring Boot backend via <code>X-Admin-Role: ADMIN</code>.
          Allowed resolution transitions: <strong>Pending &rarr; In Progress &rarr; Resolved</strong> (or <strong>Reopen</strong>).
          Unauthorized or invalid workflow changes are rejected with HTTP 403 or 400.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center justify-between shadow-sm animate-in fade-in ${
            notification.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-900'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs hover:opacity-80 font-bold ml-4 p-1"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Refresh Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Administrator Report Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review community submissions, assign field teams, and update problem resolution statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchReports}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-xs transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorMessage
          title="Could not load reports from server"
          message={error}
          onRetry={fetchReports}
        />
      )}

      {/* Initial Loading */}
      {loading ? (
        <Loading message="Loading reports from Spring Boot server..." />
      ) : (
        <>
          {/* Status Quick-Filter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setSelectedStatus('All')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedStatus === 'All'
                  ? 'border-gray-900 ring-2 ring-gray-900 bg-white shadow-sm'
                  : 'bg-white border-gray-200/80 hover:border-gray-300'
              }`}
            >
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Total Reports</span>
              <div className="text-2xl font-extrabold text-gray-900 mt-1">{total}</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('PENDING')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedStatus === 'PENDING'
                  ? 'border-amber-600 ring-2 ring-amber-600 bg-amber-50/50 shadow-sm'
                  : 'bg-amber-50/20 border-amber-200/80 hover:border-amber-300'
              }`}
            >
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">Pending Review</span>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">{pending}</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('IN_PROGRESS')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedStatus === 'IN_PROGRESS'
                  ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50/50 shadow-sm'
                  : 'bg-blue-50/20 border-blue-200/80 hover:border-blue-300'
              }`}
            >
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">In Progress</span>
              <div className="text-2xl font-extrabold text-blue-700 mt-1">{inProgress}</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('RESOLVED')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedStatus === 'RESOLVED'
                  ? 'border-emerald-600 ring-2 ring-emerald-600 bg-emerald-50/50 shadow-sm'
                  : 'bg-emerald-50/20 border-emerald-200/80 hover:border-emerald-300'
              }`}
            >
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Resolved</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">{resolved}</div>
            </button>
          </div>

          {/* Search and Filters */}
          <SearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            locationQuery={locationQuery}
            setLocationQuery={setLocationQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalCount={reports.length}
            filteredCount={filteredReports.length}
            onClearFilters={handleClearFilters}
            showLocationFilter={true}
          />

          {/* Reports Table */}
          {filteredReports.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 text-xs">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Ticket ID</th>
                      <th className="py-3.5 px-4 sm:px-6">Issue &amp; Location</th>
                      <th className="py-3.5 px-4 sm:px-6">Category</th>
                      <th className="py-3.5 px-4 sm:px-6">Current Status</th>
                      <th className="py-3.5 px-4 sm:px-6">Workflow Action</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedReports.map((report) => {
                      const isPending = report.status === 'PENDING';
                      const isInProgress = report.status === 'IN_PROGRESS';
                      const isResolved = report.status === 'RESOLVED';

                      return (
                        <tr key={report.id} className="hover:bg-gray-50/60 transition-colors">
                          {/* ID */}
                          <td className="py-4 px-4 sm:px-6 font-mono font-bold text-gray-600 whitespace-nowrap">
                            #{report.id}
                          </td>

                          {/* Title, Location, and Date */}
                          <td className="py-4 px-4 sm:px-6 max-w-xs sm:max-w-md">
                            <Link
                              to={`/reports/${report.id}`}
                              className="font-bold text-gray-900 hover:text-emerald-700 transition-colors line-clamp-1 text-sm"
                            >
                              {report.title}
                            </Link>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {report.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                              <span className="flex items-center gap-1 truncate max-w-[200px]">
                                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="truncate">{report.location}</span>
                              </span>
                              <span>&bull;</span>
                              <span>{formatDate(report.createdAt)}</span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                              <Tag className="w-3 h-3" />
                              {formatCategory(report.category)}
                            </span>
                            {report.severity && (
                              <span className="block mt-1 text-[11px] text-gray-500">
                                Severity: <strong>{report.severity}</strong>
                              </span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                            <StatusBadge status={report.status} />
                          </td>

                          {/* Status Workflow Control */}
                          <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <label htmlFor={`status-select-${report.id}`} className="sr-only">
                                Update Status for report #{report.id}
                              </label>
                              <select
                                id={`status-select-${report.id}`}
                                value={report.status}
                                disabled={updatingId === report.id}
                                onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                className="text-xs font-semibold py-1.5 px-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                <option value="PENDING" disabled={isResolved}>
                                  Pending Review
                                </option>
                                <option value="IN_PROGRESS">
                                  {isResolved ? 'Reopen (In Progress)' : 'In Progress'}
                                </option>
                                <option value="RESOLVED">
                                  Resolved
                                </option>
                              </select>
                              {updatingId === report.id && (
                                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                              )}
                            </div>
                          </td>

                          {/* Details Link */}
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <Link
                              to={`/reports/${report.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <span>Inspect</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <span className="text-gray-500">
                  Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                  <strong>{Math.min(currentPage * pageSize, filteredReports.length)}</strong> of{' '}
                  <strong>{filteredReports.length}</strong> reports
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <span className="px-2 font-semibold text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No reports match your filters"
              description="Try clearing filters or searching with different keywords."
              actionLabel="Clear Filters"
              onAction={handleClearFilters}
            />
          )}
        </>
      )}
    </div>
  );
}
