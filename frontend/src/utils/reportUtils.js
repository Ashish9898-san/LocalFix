/**
 * reportUtils.js
 *
 * Helper functions for report formatting, validation, and filtering.
 */

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
  const maxSizeBytes = 2 * 1024 * 1024; // 2 MB limit for browser memory

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload a JPEG, PNG, WebP, or GIF image.',
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: 'Image size exceeds 2 MB. Please select a smaller photo.',
    };
  }

  return { valid: true };
}

/**
 * Filter and sort a list of reports based on criteria
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
  const query = (searchQuery || '').trim().toLowerCase();
  const locQuery = (locationQuery || '').trim().toLowerCase();

  return reports
    .filter((report) => {
      // Keyword search (searches title, description, and ID)
      const matchesSearch = !query ||
        report.title.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query) ||
        report.id.toLowerCase().includes(query);

      // Category filter
      const matchesCategory = category === 'All' || report.category === category;

      // Status filter
      const matchesStatus = status === 'All' || report.status === status;

      // Location filter
      const matchesLocation = !locQuery || report.location.toLowerCase().includes(locQuery);

      return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
}
