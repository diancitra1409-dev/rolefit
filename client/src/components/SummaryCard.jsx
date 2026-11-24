import React from 'react';
import { UserCheck, Sparkles } from 'lucide-react';

export default function SummaryCard({ summary }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Recruiter Assessment</h3>
            <p className="text-xs text-slate-500">AI ATS Executive Overview</p>
          </div>
        </div>

        <blockquote className="mt-3 text-sm text-slate-700 leading-relaxed border-l-3 border-indigo-500 pl-4 py-1 italic bg-slate-50/70 rounded-r-lg">
          "{summary}"
        </blockquote>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1 text-indigo-600 font-medium">
          <Sparkles className="w-3.5 h-3.5" /> Evaluated by Gemini 2.5 Flash
        </span>
        <span>ATS Recruiter Perspective</span>
      </div>
    </div>
  );
}

