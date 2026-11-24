import React from 'react';
import { Lightbulb, ArrowRight, Target, Sparkles } from 'lucide-react';

export default function ImprovementSuggestions({ suggestions = [] }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Actionable ATS Optimizations</h3>
          <p className="text-xs text-slate-500">Targeted rewrites to increase recruiter interview conversion</p>
        </div>
      </div>

      <div className="space-y-4">
        {suggestions.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4.5 hover:border-indigo-200 transition-all"
          >
            {/* Header: Item number & Context */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                {index + 1}
              </span>
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Current Resume Gap / Context:
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-800">
                {item.originalContext}
              </span>
            </div>

            {/* Suggested Improvement Callout */}
            <div className="rounded-lg bg-white border border-indigo-100 p-3 shadow-2xs mb-2.5">
              <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wide flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3" />
                Recommended Phrasing / Action
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {item.suggestedImprovement}
              </p>
            </div>

            {/* Recruiter & ATS Rationale */}
            <div className="flex items-start gap-1.5 text-xs text-slate-600">
              <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-800">Why it matters:</strong> {item.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

