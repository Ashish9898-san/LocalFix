import React from 'react';
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
  Image as ImageIcon
} from 'lucide-react';
import { useReports } from '../context/ReportsContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { formatFullDateTime } from '../utils/reportUtils';

export default function ReportDetails() {
  const { id } = useParams();
  const { getReportById } = useReports();

  const report = getReportById(id);

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Report Not Found"
          description={`We could not locate any problem report registered with ticket ID "${id}". It may have been removed or never existed.`}
          actionLabel="Return to Browse Reports"
          onAction={() => window.location.href = '/reports'}
        />
      </div>
    );
  }

  // Timeline step statuses
  const isPending = report.status === 'PENDING';
  const isInProgress = report.status === 'IN_PROGRESS';
  const isResolved = report.status === 'RESOLVED';

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
                {report.category}
              </span>
              {report.priority && (
                <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                  Priority: {report.priority}
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
            {report.imageUrl && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  Attached Photo Evidence
                </h2>
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 max-h-96 shadow-sm">
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-full h-full object-cover"
                  />
                </div>
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
                  <span className="text-[11px] text-gray-500 mt-0.5">Ticket registered</span>
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
                    {report.category}
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
            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Admin Management</span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                Need to update the status of this ticket? Use the Administrator Dashboard to mark it In Progress or Resolved.
              </p>
              <Link
                to="/admin"
                className="inline-block mt-1 font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
              >
                Go to Administrator Dashboard &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
