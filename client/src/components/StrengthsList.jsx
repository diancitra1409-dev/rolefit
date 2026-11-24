import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

export default function StrengthsList({ strengths = [] }) {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Award className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Key Candidate Strengths</h3>
          <p className="text-xs text-slate-500">Top areas of competitive advantage for this role</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {strengths.map((strength, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-emerald-300 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {strength}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

