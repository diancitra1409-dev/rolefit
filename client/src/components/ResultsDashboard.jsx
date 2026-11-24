import React from 'react';
import { RotateCcw, FileText, CheckCircle2 } from 'lucide-react';
import ScoreGauge from './ScoreGauge.jsx';
import SummaryCard from './SummaryCard.jsx';
import KeywordsBadges from './KeywordsBadges.jsx';
import StrengthsList from './StrengthsList.jsx';
import ImprovementSuggestions from './ImprovementSuggestions.jsx';

export default function ResultsDashboard({ result, onReset }) {
  if (!result) return null;

  const {
    filename,
    fileSize,
    matchScore,
    summary,
    matchedKeywords,
    missingKeywords,
    strengths,
    improvementSuggestions
  } = result;

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Bar with File Details and Reset Button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[280px] sm:max-w-md">
                {filename || 'Uploaded Resume'}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Analyzed
              </span>
            </div>
            {fileSize && (
              <p className="text-xs text-slate-500 mt-0.5">
                {formatFileSize(fileSize)} • Evaluation Complete
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
          Reset / Analyze Another
        </button>
      </div>

      {/* Row 1: Score Gauge & Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ScoreGauge score={matchScore} />
        </div>
        <div className="lg:col-span-2">
          <SummaryCard summary={summary} />
        </div>
      </div>

      {/* Row 2: Matched & Missing Keywords */}
      <KeywordsBadges
        matchedKeywords={matchedKeywords}
        missingKeywords={missingKeywords}
      />

      {/* Row 3: Candidate Strengths */}
      <StrengthsList strengths={strengths} />

      {/* Row 4: Actionable ATS Optimizations */}
      <ImprovementSuggestions suggestions={improvementSuggestions} />
    </div>
  );
}

