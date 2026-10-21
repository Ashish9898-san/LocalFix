import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * ErrorMessage Component
 * Displays a friendly error alert with optional retry action.
 */
export default function ErrorMessage({ 
  title = 'Something went wrong', 
  message = 'We encountered an error while processing your request.', 
  onRetry 
}) {
  return (
    <div 
      className="max-w-xl mx-auto my-6 p-5 bg-red-50 border border-red-200 rounded-xl text-red-900 shadow-sm"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-red-700 mt-1 leading-relaxed">{message}</p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-800 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
