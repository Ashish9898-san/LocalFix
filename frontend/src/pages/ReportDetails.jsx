import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Tag, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import { useReports } from '../context/ReportsContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatFullDateTime, formatCategory } from '../utils/reportUtils';
import { reportsApi } from '../services/api';

export default function ReportDetails() {
  const { id } = useParams();
  const { getReportById, fetchReportById, updateReportStatus, loading: contextLoading } = useReports();

  const [report, setReport] = useState(() => getReportById(id));
  const [loading, setLoading] = useState(!report);
  const [error, setError] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusNotification, setStatusNotification] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Sync or fetch report when ID changes or after context loads
  useEffect(() => {
    setImageError(false);
    const existing = getReportById(id);
    if (existing) {
      setReport(existing);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    fetchReportById(id)
      .then((data) => {
        if (isMounted) {
          setReport(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Report not found');
          setReport(null);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, getReportById, fetchReportById]);

  const handleStatusUpdate = async (newStatus) => {
    if (!report || !newStatus || newStatus === report.status) return;
    setIsUpdatingStatus(true);
    setStatusNotification(null);
    try {
      const updated = await updateReportStatus(report.id, newStatus);
      if (updated) {
        setReport(updated);
        setStatusNotification({
          type: 'success',
          message: `Status successfully updated to "${newStatus.replace('_', ' ')}".`,
        });
        setTimeout(() => setStatusNotification(null), 5000);
      }
    } catch (err) {
      setStatusNotification({
        type: 'error',
        message: err.message || 'Failed to update status.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading || (contextLoading && !report)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Loading message={`Loading ticket #${id} from database...`} />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Report Not Found"
          description={`We could not locate any problem report registered with ticket ID "${id}" in the database.`}
          actionLabel="Return to Browse Reports"
          onAction={() => window.location.href = '/reports'}
        />
      </div>
    );
  }

  // Timeline step statuses
  const isPending = String(report.status).toUpperCase() === 'PENDING';
  const isInProgress = String(report.status).toUpperCase() === 'IN_PROGRESS';
  const isResolved = String(report.status).toUpperCase() === 'RESOLVED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Reports</span>
        </Link>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gray-50 border-b border-gray-200/80 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-gray-600 bg-gray-200/80 px-2.5 py-1 rounded-md">
                #{report.id}
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {formatCategory(report.category)}
              </span>
              {(report.severity || report.priority) && (
                <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                  Severity: {report.severity || report.priority}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
              {report.title}
            </h1>
          </div>

          <div className="shrink-0">
            <StatusBadge status={report.status} size="lg" />
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Description, Photo, and Progress Tracker */}
          <div className="lg:col-span-2 space-y-8">
            {/* Attached Photo if available */}
            {report.imageUrl && !imageError && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  Attached Photo Evidence
                </h2>
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 max-h-96 shadow-sm">
                  <img
                    src={reportsApi.formatImageUrl(report.imageUrl)}
                    alt={report.title}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {report.imageUrl && imageError && (
              <div className="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl flex items-center gap-3 text-sm text-gray-500">
                <ImageIcon className="w-5 h-5 text-gray-400 shrink-0" />
                <span>Attached photo evidence is unavailable or could not be loaded.</span>
              </div>
            )}

            {/* Description Section */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Problem Description
              </h2>
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                {report.description}
              </div>
            </div>

            {/* Status Progress Tracker */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Resolution Progress
              </h2>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 relative text-center">
                {/* Step 1: Submitted */}
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-emerald-50 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-900">Submitted</span>
                  <span className="text-[11px] text-gray-500 mt-0.5">Ticket registered in DB</span>
                </div>

                {/* Step 2: Under Review / In Progress */}
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm mb-2 ${
                    isInProgress || isResolved
                      ? 'bg-blue-600 text-white ring-4 ring-blue-50'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isInProgress ? (
                      <Clock className="w-5 h-5 animate-pulse" />
                    ) : isResolved ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span>2</span>
                    )}
                  </div>
                  <span className={`text-xs font-bold ${isInProgress || isResolved ? 'text-gray-900' : 'text-gray-400'}`}>
                    In Progress
                  </span>
                  <span className="text-[11px] text-gray-500 mt-0.5">Field crew assigned</span>
                </div>

                {/* Step 3: Resolved */}
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm mb-2 ${
                    isResolved
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isResolved ? <CheckCircle2 className="w-5 h-5" /> : <span>3</span>}
                  </div>
                  <span className={`text-xs font-bold ${isResolved ? 'text-emerald-700' : 'text-gray-400'}`}>
                    Resolved
                  </span>
                  <span className="text-[11px] text-gray-500 mt-0.5">Repairs completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-2">
                Report Metadata
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-500 block mb-0.5 font-medium">Location</span>
                  <div className="flex items-start gap-1.5 font-semibold text-gray-900">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{report.location}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 block mb-0.5 font-medium">Date Reported</span>
                  <div className="flex items-start gap-1.5 font-semibold text-gray-900">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{formatFullDateTime(report.createdAt)}</span>
                  </div>
                </div>

                {report.updatedAt && (
                  <div>
                    <span className="text-gray-500 block mb-0.5 font-medium">Last Status Update</span>
                    <div className="flex items-start gap-1.5 font-semibold text-gray-900">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{formatFullDateTime(report.updatedAt)}</span>
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-gray-500 block mb-0.5 font-medium">Issue Category</span>
                  <div className="font-semibold text-gray-900">
                    {formatCategory(report.category)}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 block mb-0.5 font-medium">Current Status</span>
                  <div className="mt-1">
                    <StatusBadge status={report.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Quick Action Banner */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-950 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Admin Workflow Action</span>
                </div>
                <Link
                  to="/admin"
                  className="font-medium text-[11px] text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                >
                  Admin Panel &rarr;
                </Link>
              </div>

              {statusNotification && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    statusNotification.type === 'error'
                      ? 'bg-red-100 text-red-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {statusNotification.type === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  )}
                  <span>{statusNotification.message}</span>
                </div>
              )}

              <div>
                <label htmlFor="details-status-select" className="text-gray-600 block mb-1 font-medium">
                  Update Resolution Status:
                </label>
                <div className="flex items-center gap-2">
                  <select
                    id="details-status-select"
                    value={report.status}
                    disabled={isUpdatingStatus}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className="w-full text-xs font-semibold py-1.5 px-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                  >
                    <option value="PENDING" disabled={report.status === 'RESOLVED'}>
                      Pending Review
                    </option>
                    <option value="IN_PROGRESS">
                      {report.status === 'RESOLVED' ? 'Reopen (In Progress)' : 'In Progress'}
                    </option>
                    <option value="RESOLVED">
                      Resolved
                    </option>
                  </select>
                  {isUpdatingStatus && (
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
