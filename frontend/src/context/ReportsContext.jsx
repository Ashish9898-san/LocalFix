import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { reportsApi } from '../services/api';

/**
 * ReportsContext.jsx
 *
 * Centralized React state management for Civic Issue Reports.
 *
 * Concepts Explained for Beginners:
 * 1. Single Source of Truth: All pages and components (Browse Reports, Dashboard,
 *    Admin Management, Report Details) share the same live report data from this context.
 * 2. Asynchronous State: Unlike mock data which was synchronous, real network calls
 *    have latency and can fail. We maintain 'loading' and 'error' flags so components
 *    can display spinners, empty states, or error retry banners.
 * 3. Optimistic vs Real Persistence: Reports are saved in MySQL through our Spring Boot API,
 *    NOT in temporary browser localStorage.
 */

const ReportsContext = createContext(null);

export const ReportsProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Fetch all reports from Spring Boot (GET /api/reports)
   * Ordered newest first by default.
   */
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.getAll();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching reports from API:', err);
      setError(err.message || 'Failed to load reports from server.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch reports on initial application startup
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  /**
   * Normalize category value to Spring Boot enum name
   * e.g. "Water Leakage" -> "WATER_LEAKAGE"
   */
  const normalizeCategory = (cat) => {
    if (!cat) return 'OTHER';
    return String(cat).toUpperCase().replace(/ /g, '_');
  };

  /**
   * Normalize severity value to Spring Boot enum name
   * e.g. "High" -> "HIGH"
   */
  const normalizeSeverity = (sev) => {
    if (!sev) return 'MEDIUM';
    const upper = String(sev).toUpperCase();
    if (['LOW', 'MEDIUM', 'HIGH'].includes(upper)) return upper;
    return 'MEDIUM';
  };

  /**
   * Submit a new civic issue report (POST /api/reports)
   * @param {Object} reportData - Form data
   * @returns {Promise<Object>} Created report from backend
   */
  const addReport = async (reportData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: reportData.title.trim(),
        description: reportData.description.trim(),
        category: normalizeCategory(reportData.category),
        severity: normalizeSeverity(reportData.severity || reportData.priority),
        location: reportData.location.trim(),
        imageUrl: reportData.imageUrl || null,
      };

      const createdReport = await reportsApi.create(payload);

      // Prepend newly created report to our live list (newest first)
      setReports((prev) => [createdReport, ...prev]);
      return createdReport;
    } catch (err) {
      console.error('Failed to create report:', err);
      throw err; // Re-throw so caller can display form-specific error alert
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Partially update a report's status (PATCH /api/reports/{id})
   * Used primarily by administrators.
   * @param {string|number} id - Report ID
   * @param {'PENDING'|'IN_PROGRESS'|'RESOLVED'} newStatus - New status
   * @returns {Promise<Object>} Updated report from backend
   */
  const updateReportStatus = async (id, newStatus) => {
    if (!id || !newStatus) return null;
    setIsUpdating(true);

    const targetId = String(id).replace(/^REP-/, ''); // Clean numeric ID
    const normalizedStatus = String(newStatus).toUpperCase();

    try {
      const updatedReport = await reportsApi.update(targetId, {
        status: normalizedStatus,
      });

      // Update state with confirmed report from backend
      setReports((prev) =>
        prev.map((r) => (String(r.id) === String(targetId) ? updatedReport : r))
      );

      return updatedReport;
    } catch (err) {
      console.error(`Failed to update status for report #${id}:`, err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Find a report by its ID from current local state
   * @param {string|number} id
   */
  const getReportById = (id) => {
    if (!id) return null;
    const cleanId = String(id).replace(/^REP-/, '').toLowerCase();
    return (
      reports.find(
        (r) =>
          String(r.id).toLowerCase() === cleanId ||
          String(r.id).toLowerCase() === String(id).toLowerCase()
      ) || null
    );
  };

  /**
   * Directly fetch a single report from backend by ID (useful on direct URL navigation)
   * @param {string|number} id
   */
  const fetchReportById = async (id) => {
    if (!id) return null;
    const cleanId = String(id).replace(/^REP-/, '');
    try {
      const data = await reportsApi.getById(cleanId);
      // Ensure it is cached in our reports list
      setReports((prev) => {
        const exists = prev.some((r) => String(r.id) === String(cleanId));
        return exists ? prev.map((r) => (String(r.id) === String(cleanId) ? data : r)) : [data, ...prev];
      });
      return data;
    } catch (err) {
      console.error(`Failed to fetch report #${id}:`, err);
      throw err;
    }
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        loading,
        error,
        isSubmitting,
        isUpdating,
        fetchReports,
        addReport,
        updateReportStatus,
        getReportById,
        fetchReportById,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};

// Custom hook for accessing reports state in components
export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
