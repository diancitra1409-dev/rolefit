import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function KeywordsBadges({ matchedKeywords = [], missingKeywords = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <h3 className="text-base font-bold text-slate-900 mb-1">Keyword & Skill Alignment</h3>
      <p className="text-xs text-slate-500 mb-6">
        Comparison of target job requirements against skills detected in your resume.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Keywords */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Matched Keywords</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {matchedKeywords.length} found
            </span>
          </div>

          {matchedKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {matchedKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-emerald-900 border border-emerald-300 shadow-2xs hover:bg-emerald-50 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {keyword}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No direct keyword matches detected.</p>
          )}
        </div>

        {/* Missing Keywords */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Missing Keywords</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
              {missingKeywords.length} missing
            </span>
          </div>

          {missingKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {missingKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-amber-900 border border-amber-300 shadow-2xs hover:bg-amber-50 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {keyword}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No critical missing keywords! Excellent alignment.</p>
          )}
        </div>
      </div>
    </div>
  );
}

