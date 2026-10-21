import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_SAMPLE_REPORTS } from '../data/sampleReports';

const LOCAL_STORAGE_KEY = 'localfix_sample_reports_v1';

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
   * @param {Object} reportData - { title, description, category, location, priority }
   * @returns {Object} newly created report with generated id, status, and timestamp
   */
  const addReport = (reportData) => {
    // Generate a human-friendly unique ID, e.g., REP-2091
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
    };

    setReports((prevReports) => [newReport, ...prevReports]);
    return newReport;
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
