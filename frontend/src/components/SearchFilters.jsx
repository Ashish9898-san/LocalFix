import React from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { CATEGORIES, STATUSES } from '../data/sampleReports';

/**
 * SearchFilters Component
 *
 * Reusable filter bar for search input, category, status, location, and sorting controls.
 */
export default function SearchFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  locationQuery = '',
  setLocationQuery,
  sortBy,
  setSortBy,
  totalCount,
  filteredCount,
  onClearFilters,
  showLocationFilter = true,
}) {
  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    selectedStatus !== 'All' ||
    (locationQuery && locationQuery !== '') ||
    sortBy !== 'newest';

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
      {/* Top Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search Keyword Input */}
        <div className={`relative ${showLocationFilter ? 'lg:col-span-4' : 'lg:col-span-5'}`}>
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, or ID..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            aria-label="Search reports"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              aria-label="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Location Filter Input (Optional) */}
        {showLocationFilter && setLocationQuery && (
          <div className="lg:col-span-3 relative">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Filter by location/street..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              aria-label="Filter by location"
            />
            {locationQuery && (
              <button
                type="button"
                onClick={() => setLocationQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                aria-label="Clear location filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Category Dropdown */}
        <div className="lg:col-span-2">
          <label htmlFor="filter-category" className="sr-only">Category</label>
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="lg:col-span-2">
          <label htmlFor="filter-status" className="sr-only">Status</label>
          <select
            id="filter-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Statuses' : status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className={showLocationFilter ? 'lg:col-span-1' : 'lg:col-span-2'}>
          <label htmlFor="filter-sort" className="sr-only">Sort Order</label>
          <select
            id="filter-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full py-2 px-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Summary and Clear Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div>
          Showing <span className="font-semibold text-gray-900">{filteredCount}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalCount}</span> total reports
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
