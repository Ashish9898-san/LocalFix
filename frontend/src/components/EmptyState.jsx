import React from 'react';
import { SearchX } from 'lucide-react';

/**
 * EmptyState Component
 * Displays when search or filter returns zero results, or when a list is empty.
 */
export default function EmptyState({
  title = 'No reports found',
  description = 'Try adjusting your search criteria or resetting filters to find what you are looking for.',
  actionLabel,
  onAction,
  icon: Icon = SearchX
}) {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-gray-300 max-w-lg mx-auto my-8">
      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
