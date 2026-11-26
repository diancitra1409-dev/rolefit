import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import FileUpload from './components/FileUpload.jsx';
import JobDescriptionInput from './components/JobDescriptionInput.jsx';
import ResultsDashboard from './components/ResultsDashboard.jsx';
import Alert from './components/Alert.jsx';
import { analyzeResumeAndJD, checkServerHealth } from './services/api.js';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function App() {
  const [resumeMode, setResumeMode] = useState('pdf');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);

  const loadingSteps = [
    'Extracting text content from PDF resume...',
    'Analyzing target job description requirements...',
    'Consulting Gemini 2.5 Flash ATS evaluator...',
    'Synthesizing keyword match and actionable optimizations...'
  ];

  // Rotate informative loading messages
  useEffect(() => {
    let interval;
    if (isLoading) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % loadingSteps.length);
      }, 2400);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Initial server health check
  useEffect(() => {
    checkServerHealth().then((status) => {
      setServerStatus(status);
    });
  }, []);

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    setError(null);

    // Validation
    if (resumeMode === 'pdf' && !resumeFile) {
      setError('Please upload your resume in PDF format (max 5MB) or switch to Paste Text.');
      return;
    }

    if (resumeMode === 'text' && resumeText.trim().length < 30) {
      setError('Please paste your resume text (at least 30 characters).');
      return;
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      setError('Please paste a job description with at least 20 characters.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const data = await analyzeResumeAndJD({
        resumeFile: resumeMode === 'pdf' ? resumeFile : null,
        resumeText: resumeMode === 'text' ? resumeText.trim() : '',
        jobDescription: jobDescription.trim()
      });
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err.message || 'An unexpected error occurred during analysis.');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setResumeText('');
    setJobDescription('');
    setResult(null);
    setError(null);
  };

  const hasValidResume =
    resumeMode === 'pdf' ? Boolean(resumeFile) : resumeText.trim().length >= 30;
  const isFormValid = Boolean(hasValidResume && jobDescription.trim().length >= 20);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header serverStatus={serverStatus} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert
              title="Analysis Error"
              message={error}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Results Screen */}
        {result ? (
          <ResultsDashboard result={result} onReset={handleReset} />
        ) : (
          /* Input Screen */
          <div className="space-y-8">
            {/* Hero Intro */}
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Next-Gen ATS Resume Matcher
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Optimize Your Resume for Any Job
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                Upload your resume in PDF and paste the job description. Our AI evaluates ATS keyword alignment, scores candidate fit, and delivers actionable rewrites.
              </p>
            </div>

            {/* Input Dual-Panel Card */}
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
                {/* Left: PDF Upload or Pasted Text */}
                <FileUpload
                  file={resumeFile}
                  onFileSelect={(file) => {
                    setResumeFile(file);
                    setError(null);
                  }}
                  onFileRemove={() => setResumeFile(null)}
                  resumeMode={resumeMode}
                  onModeChange={(mode) => {
                    setResumeMode(mode);
                    setError(null);
                  }}
                  resumeText={resumeText}
                  onResumeTextChange={(val) => {
                    setResumeText(val);
                    setError(null);
                  }}
                  disabled={isLoading}
                />

                {/* Right: Job Description */}
                <JobDescriptionInput
                  value={jobDescription}
                  onChange={(val) => {
                    setJobDescription(val);
                    setError(null);
                  }}
                  onClear={() => setJobDescription('')}
                  disabled={isLoading}
                />
              </div>

              {/* Submit CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-900 text-white shadow-md">
                <div className="text-center sm:text-left">
                  <h4 className="text-sm font-semibold">Ready to test candidate alignment?</h4>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Powered by Google Gemini 2.5 Flash Structured Outputs
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md ${
                    isFormValid && !isLoading
                      ? 'bg-white text-indigo-900 hover:bg-indigo-50 active:scale-95 cursor-pointer'
                      : 'bg-white/20 text-white/60 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>{loadingSteps[loadingStepIndex]}</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Match</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Feature Highlights Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200/70 text-center">
              <div className="p-3">
                <div className="font-semibold text-xs text-slate-800">Direct ATS Parsing</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Extracts structured skills from PDF in memory</div>
              </div>
              <div className="p-3">
                <div className="font-semibold text-xs text-slate-800">Recruiter Scoring</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Objective 0-100 score with keyword matrix</div>
              </div>
              <div className="p-3">
                <div className="font-semibold text-xs text-slate-800">Actionable Rewrites</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Concrete bullet points tailored for interview success</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        RoleFit MVP • Powered by Google Gemini 2.5 Flash & Node.js Express
      </footer>
    </div>
  );
}

