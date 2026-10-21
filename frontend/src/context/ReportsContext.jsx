import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_SAMPLE_REPORTS } from '../data/sampleReports';

const LOCAL_STORAGE_KEY = 'localfix_mock_reports_v2';

const ReportsContext = createContext(null);

export const ReportsProvider = ({ children }) => {
  // Initialize state from browser localStorage if available, or fall back to initial sample reports
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse reports from localStorage, falling back to sample data.', e);
    }
    return INITIAL_SAMPLE_REPORTS;
  });

  // Save to localStorage whenever reports change (persisting locally across browser refreshes)
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
    } catch (e) {
      console.warn('Failed to save reports to localStorage', e);
    }
  }, [reports]);

  /**
   * Add a newly submitted report to the local state
   * @param {Object} reportData - { title, description, category, location, priority, imageUrl }
   * @returns {Object} newly created report with generated id, status, and timestamp
   */
  const addReport = (reportData) => {
    const newId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport = {
      id: newId,
      title: reportData.title.trim(),
      description: reportData.description.trim(),
      category: reportData.category,
      location: reportData.location.trim(),
      status: 'PENDING',
      priority: reportData.priority || 'Medium',
      createdAt: new Date().toISOString(),
      imageUrl: reportData.imageUrl || null,
    };

    setReports((prevReports) => [newReport, ...prevReports]);
    return newReport;
  };

  /**
   * Update the status of an existing report (used by Administrator)
   * @param {string} id - Report ID
   * @param {'PENDING'|'IN_PROGRESS'|'RESOLVED'} newStatus - New status
   * @returns {boolean} true if updated successfully
   */
  const updateReportStatus = (id, newStatus) => {
    if (!id || !newStatus) return false;
    const normalizedStatus = newStatus.toUpperCase();

    let updated = false;
    setReports((prevReports) =>
      prevReports.map((report) => {
        if (report.id.toLowerCase() === id.trim().toLowerCase()) {
          updated = true;
          return {
            ...report,
            status: normalizedStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return report;
      })
    );

    return updated;
  };

  /**
   * Delete a report by ID (optional admin capability)
   * @param {string} id - Report ID
   */
  const deleteReport = (id) => {
    if (!id) return;
    setReports((prevReports) =>
      prevReports.filter((r) => r.id.toLowerCase() !== id.trim().toLowerCase())
    );
  };

  /**
   * Find a report by its ID
   * @param {string} id
   */
  const getReportById = (id) => {
    if (!id) return null;
    return reports.find((r) => r.id.toLowerCase() === id.trim().toLowerCase()) || null;
  };

  /**
   * Reset sample reports back to original initial data
   */
  const resetToSampleData = () => {
    setReports(INITIAL_SAMPLE_REPORTS);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to reset localStorage', e);
    }
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        addReport,
        updateReportStatus,
        deleteReport,
        getReportById,
        resetToSampleData,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};

// Custom hook for convenient access to reports state in components
export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
