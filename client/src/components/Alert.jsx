import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function Alert({ title = 'Error', message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 shadow-xs flex items-start justify-between gap-3 animate-in fade-in duration-200"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-red-900">{title}</h4>
          <p className="text-xs text-red-800 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-400 hover:text-red-700 p-1 rounded-md transition-colors"
          title="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
