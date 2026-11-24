import React from 'react';
import { Briefcase, FileCode, Trash2 } from 'lucide-react';

const SAMPLE_JD = `Senior Full-Stack Engineer (React & Node.js)

About the Role:
We are seeking an experienced Full-Stack Engineer to architect, build, and scale our core web application. You will collaborate closely with product managers and designers to deliver clean, resilient user experiences.

Key Responsibilities:
- Design and develop responsive web interfaces using React, TypeScript, and modern CSS frameworks (Tailwind CSS).
- Build scalable RESTful and GraphQL APIs using Node.js, Express, and microservices architecture.
- Optimize database schemas and query performance with PostgreSQL, MongoDB, and Redis caching.
- Implement CI/CD pipelines, automated testing (Jest, Cypress), and cloud deployment using Docker and AWS / Google Cloud.
- Conduct thorough code reviews and mentor junior developers.

Requirements & Qualifications:
- 4+ years of professional full-stack web development experience.
- Strong proficiency in modern JavaScript/TypeScript, React hooks, and state management.
- Proven experience designing REST APIs with Node.js and Express.
- Solid understanding of SQL and NoSQL data modeling.
- Familiarity with Git version control, Docker containerization, and cloud infrastructure.
- Strong communication, problem-solving skills, and agile teamwork.`;

export default function JobDescriptionInput({
  value,
  onChange,
  onClear,
  disabled
}) {
  const characterCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  const handleFillSample = () => {
    onChange(SAMPLE_JD);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-indigo-600" />
          Target Job Description
        </label>
        <div className="flex items-center gap-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
              title="Clear text"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={handleFillSample}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-100 transition-colors"
          >
            <FileCode className="w-3 h-3" />
            Paste Sample JD
          </button>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste the complete job description here, including responsibilities, required qualifications, tech stack, and experience requirements..."
          className="w-full flex-1 min-h-[220px] rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden resize-none transition-all"
        />

        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            {characterCount < 20 ? (
              <span className="text-amber-600 font-medium">Min 20 characters required</span>
            ) : (
              <span className="text-emerald-600 font-medium">Ready for analysis</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{characterCount} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
}

