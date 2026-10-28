import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useReports } from '../context/ReportsContext';
import { filterAndSortReports } from '../utils/reportUtils';
import SearchFilters from '../components/SearchFilters';
import ReportCard from '../components/ReportCard';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Reports() {
  const { reports, loading, error, fetchReports } = useReports();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [locationQuery, setLocationQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Compute filtered and sorted reports
  const filteredReports = useMemo(() => {
    return filterAndSortReports(reports, {
      searchQuery,
      category: selectedCategory,
      status: selectedStatus,
      locationQuery,
      sortBy,
    });
  }, [reports, searchQuery, selectedCategory, selectedStatus, locationQuery, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setLocationQuery('');
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Community Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse, search, and track issues reported across the neighborhood.
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

      {/* Error state */}
      {error && (
        <ErrorMessage
          title="Could not load reports"
          message={error}
          onRetry={fetchReports}
        />
      )}

      {/* Loading state */}
      {loading ? (
        <Loading message="Loading reports from server..." />
      ) : (
        <>
          {/* Reusable Search & Filter Component */}
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

          {/* Reports Grid or Empty State */}
          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={reports.length === 0 ? "No reports in the database yet" : "No matching reports found"}
              description={
                reports.length === 0
                  ? "Be the first citizen to report a civic issue in your community!"
                  : "We couldn't find any reports matching your current search terms or filter selections."
              }
              actionLabel={reports.length === 0 ? "Submit First Report" : "Clear Filters"}
              onAction={reports.length === 0 ? () => window.location.href = '/report-issue' : handleClearFilters}
            />
          )}
        </>
      )}
    </div>
  );
}
