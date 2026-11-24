import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function Alert({ title = 'Error', message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 shadow-xs flex items-start justify-between gap-3 animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
          <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-700 p-1 rounded-md transition-colors"
          title="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

