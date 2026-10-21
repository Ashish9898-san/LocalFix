import React, { useState, useMemo } from 'react';
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
  Info
} from 'lucide-react';
import { useReports } from '../context/ReportsContext';
import { filterAndSortReports, formatDate } from '../utils/reportUtils';
import SearchFilters from '../components/SearchFilters';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

export default function AdminDashboard() {
  const { reports, updateReportStatus, resetToSampleData } = useReports();

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [locationQuery, setLocationQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Status notification state
  const [statusNotification, setStatusNotification] = useState(null);

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

  // Statistics
  const total = reports.length;
  const pending = reports.filter((r) => r.status === 'PENDING').length;
  const inProgress = reports.filter((r) => r.status === 'IN_PROGRESS').length;
  const resolved = reports.filter((r) => r.status === 'RESOLVED').length;

  const handleStatusChange = (reportId, newStatus) => {
    const success = updateReportStatus(reportId, newStatus);
    if (success) {
      const friendlyStatus = newStatus.replace('_', ' ');
      setStatusNotification(`Report #${reportId} status successfully updated to "${friendlyStatus}".`);
      setTimeout(() => setStatusNotification(null), 4000);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setLocationQuery('');
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Simulation & Security Notice */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm text-xs sm:text-sm text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Frontend Administrator Simulation (Phase 2)</span>
        </div>
        <p className="leading-relaxed">
          This management panel lets you simulate changing report statuses in frontend state. The changes instantly update the <strong>Browse Reports</strong> page, <strong>Report Details</strong> pages, and <strong>Community Dashboard</strong>.
        </p>
        <p className="text-[11px] text-amber-800">
          <strong>Production Note:</strong> Real administrator authorization will be enforced on the Spring Boot backend using Spring Security in Phase 7.
        </p>
      </div>

      {/* Status Notification Toast */}
      {statusNotification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs sm:text-sm flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{statusNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusNotification(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & KPI Summary */}
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
            onClick={() => {
              if (window.confirm('Reset all reports back to initial mock state?')) {
                resetToSampleData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Mini Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-1">{total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-sm bg-amber-50/20">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Review</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{pending}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-sm bg-blue-50/20">
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">In Progress</span>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">{inProgress}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-sm bg-emerald-50/20">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Resolved</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{resolved}</div>
        </div>
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
                  <th className="py-3.5 px-4 sm:px-6">Issue Details</th>
                  <th className="py-3.5 px-4 sm:px-6">Category</th>
                  <th className="py-3.5 px-4 sm:px-6">Current Status</th>
                  <th className="py-3.5 px-4 sm:px-6">Change Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((report) => (
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
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
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
                        {report.category}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>

                    {/* Status Update Control */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <label htmlFor={`status-select-${report.id}`} className="sr-only">
                        Change Status for {report.id}
                      </label>
                      <select
                        id={`status-select-${report.id}`}
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        className="text-xs font-semibold py-1.5 px-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      >
                        <option value="PENDING">Pending Review</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </td>

                    {/* Details Link */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <Link
                        to={`/reports/${report.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
}
