import React from 'react';

export default function ScoreGauge({ score = 0 }) {
  // Clamped score between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Color logic specified in requirements:
  // red < 50, amber 50-74, green >= 75
  let colorTheme = {
    stroke: '#ef4444',
    text: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    label: 'Low Match',
    description: 'Significant skill and qualification gaps identified.',
    badgeBg: 'bg-rose-100 text-rose-800'
  };

  if (normalizedScore >= 75) {
    colorTheme = {
      stroke: '#10b981',
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'Strong Match',
      description: 'Resume strongly aligns with key job qualifications.',
      badgeBg: 'bg-emerald-100 text-emerald-800'
    };
  } else if (normalizedScore >= 50) {
    colorTheme = {
      stroke: '#f59e0b',
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'Moderate Match',
      description: 'Partial alignment with some key keywords or skills missing.',
      badgeBg: 'bg-amber-100 text-amber-800'
    };
  }

  // Circular gauge SVG dimensions
  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-xs">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
        ATS Match Score
      </h3>

      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
          {/* Background circle track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={colorTheme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold tracking-tight ${colorTheme.text}`}>
            {normalizedScore}
            <span className="text-xl font-normal text-slate-400">/100</span>
          </span>
          <span className={`mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${colorTheme.badgeBg}`}>
            {colorTheme.label}
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 max-w-[220px]">
        {colorTheme.description}
      </p>

      {/* Visual tier bar */}
      <div className="w-full mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className={normalizedScore < 50 ? 'font-bold text-rose-600' : ''}>0 - 49 (Low)</span>
        <span className={normalizedScore >= 50 && normalizedScore < 75 ? 'font-bold text-amber-600' : ''}>50 - 74 (Med)</span>
        <span className={normalizedScore >= 75 ? 'font-bold text-emerald-600' : ''}>75 - 100 (High)</span>
      </div>
    </div>
  );
}

