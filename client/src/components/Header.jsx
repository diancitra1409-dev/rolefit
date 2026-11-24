import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export default function Header({ serverStatus }) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">Role<span className="text-indigo-600">Fit</span></span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
                Gemini Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Smart Resume & Job Description Matcher</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {serverStatus && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>API Ready</span>
              {!serverStatus.geminiConfigured && (
                <span className="ml-1 text-amber-600 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  Key needed in server/.env
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

