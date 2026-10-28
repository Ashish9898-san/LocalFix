/**
 * reportUtils.js
 *
 * Helper functions for report formatting, validation, and filtering.
 */

export const CATEGORY_LABELS = {
  ROADS: 'Roads',
  GARBAGE: 'Garbage',
  STREETLIGHTS: 'Streetlights',
  WATER_LEAKAGE: 'Water Leakage',
  PUBLIC_PROPERTY: 'Public Property',
  OTHER: 'Other',
};

/**
 * Format a category enum key into a clean, human-readable label
 * @param {string} category - e.g. "WATER_LEAKAGE" or "Water Leakage"
 * @returns {string} e.g. "Water Leakage"
 */
export function formatCategory(category) {
  if (!category) return 'Other';
  const upper = String(category).toUpperCase().replace(/ /g, '_');
  return CATEGORY_LABELS[upper] || category;
}

/**
 * Format an ISO date string into a readable local date
 * @param {string} dateString - ISO 8601 date string
 * @returns {string} e.g. "Oct 18, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format an ISO date string into a full date and time string
 * @param {string} dateString - ISO 8601 date string
 * @returns {string} e.g. "Friday, October 18, 2026, 09:15 AM"
 */
export function formatFullDateTime(dateString) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Validate an uploaded image file on the client-side
 * @param {File} file - File object from input
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file) return { valid: true };

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB limit for photo attachments

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload a JPEG, PNG, WebP, or GIF image.',
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: 'Image size exceeds 5 MB. Please select a smaller photo.',
    };
  }

  return { valid: true };
}

/**
 * Filter and sort a list of reports based on criteria.
 * Safely handles numeric or string IDs, case variations in categories and statuses.
 * @param {Array} reports - Array of report objects
 * @param {Object} filters - { searchQuery, category, status, locationQuery, sortBy }
 * @returns {Array} Filtered and sorted reports
 */
export function filterAndSortReports(reports, {
  searchQuery = '',
  category = 'All',
  status = 'All',
  locationQuery = '',
  sortBy = 'newest'
} = {}) {
  if (!Array.isArray(reports)) return [];

  const query = (searchQuery || '').trim().toLowerCase();
  const locQuery = (locationQuery || '').trim().toLowerCase();

  return reports
    .filter((report) => {
      if (!report) return false;

      // Safe string conversions for keyword search (searches title, description, and ID)
      const reportTitle = String(report.title || '').toLowerCase();
      const reportDesc = String(report.description || '').toLowerCase();
      const reportId = String(report.id || '').toLowerCase();

      const matchesSearch =
        !query ||
        reportTitle.includes(query) ||
        reportDesc.includes(query) ||
        reportId.includes(query);

      // Category filter (handles both uppercase enum like "ROADS" and formatted label like "Roads")
      const reportCatUpper = String(report.category || '').toUpperCase().replace(/ /g, '_');
      const filterCatUpper = String(category || '').toUpperCase().replace(/ /g, '_');
      const matchesCategory =
        category === 'All' ||
        report.category === category ||
        reportCatUpper === filterCatUpper;

      // Status filter
      const reportStatusUpper = String(report.status || '').toUpperCase();
      const filterStatusUpper = String(status || '').toUpperCase();
      const matchesStatus =
        status === 'All' ||
        report.status === status ||
        reportStatusUpper === filterStatusUpper;

      // Location filter
      const reportLoc = String(report.location || '').toLowerCase();
      const matchesLocation = !locQuery || reportLoc.includes(locQuery);

      return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime() || 0;
      const dateB = new Date(b.createdAt).getTime() || 0;
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
}
