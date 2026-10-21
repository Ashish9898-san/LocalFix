import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading Component
 * Reusable accessible loading state with an animated spinner.
 */
export default function Loading({ message = 'Loading reports...' }) {
  return (
    <div 
      className="flex flex-col items-center justify-center p-12 text-center"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-gray-600">{message}</p>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
}
