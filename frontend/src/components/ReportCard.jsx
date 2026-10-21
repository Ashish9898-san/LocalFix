import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ArrowRight, Image as ImageIcon } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/reportUtils';

/**
 * ReportCard Component
 * Displays a summary card for an individual problem report.
 */
export default function ReportCard({ report }) {
  if (!report) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      {/* Optional Card Image Banner */}
      {report.imageUrl && (
        <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
          <img
            src={report.imageUrl}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
              <Tag className="w-3 h-3 text-emerald-600" />
              {report.category}
            </span>
          </div>
          <div className="absolute top-3 right-3 shadow-sm">
            <StatusBadge status={report.status} />
          </div>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header if NO image is present */}
          {!report.imageUrl && (
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                <Tag className="w-3 h-3" />
                {report.category}
              </span>
              <StatusBadge status={report.status} />
            </div>
          )}

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-emerald-700 transition-colors mb-2 line-clamp-2">
            <Link to={`/reports/${report.id}`}>
              {report.title}
            </Link>
          </h3>

          {/* Description snippet */}
          <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
            {report.description}
          </p>
        </div>

        {/* Metadata: Location & Date */}
        <div className="space-y-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{report.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>Reported on {formatDate(report.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="bg-gray-50/70 border-t border-gray-100 px-5 py-3 flex items-center justify-between text-xs font-medium">
        <span className="text-gray-400 font-mono">#{report.id}</span>
        <Link
          to={`/reports/${report.id}`}
          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold group-hover:translate-x-0.5 transition-transform"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
