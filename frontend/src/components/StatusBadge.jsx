import React from 'react';

/**
 * StatusBadge Component
 *
 * Renders a color-coded status badge with accessible text and indicator dot.
 * Supports: 'PENDING', 'IN_PROGRESS', 'RESOLVED'
 */
const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending Review',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  RESOLVED: {
    label: 'Resolved',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

const DEFAULT_CONFIG = {
  label: 'Unknown',
  bg: 'bg-gray-100',
  text: 'text-gray-700',
  border: 'border-gray-200',
  dot: 'bg-gray-400',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const normalized = (status || '').toUpperCase();
  const config = STATUS_CONFIG[normalized] || DEFAULT_CONFIG;

  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1 text-sm font-medium' 
    : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}
