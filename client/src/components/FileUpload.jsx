import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';

export default function FileUpload({ file, onFileSelect, onFileRemove, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState(null);
  const inputRef = useRef(null);

  const validateAndSet = (selectedFile) => {
    setLocalError(null);
    if (!selectedFile) return;

    // Check PDF extension or MIME
    const isPdf =
      selectedFile.type === 'application/pdf' ||
      selectedFile.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setLocalError('Only PDF files are supported. Please upload a .pdf document.');
      return;
    }

    // 5MB limit
    if (selectedFile.size > 5 * 1024 * 1024) {
      setLocalError('File size exceeds 5MB limit. Please upload a smaller PDF resume.');
      return;
    }

    onFileSelect(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSet(droppedFile);
  };

  const handleInputChange = (e) => {
    const chosenFile = e.target.files?.[0];
    validateAndSet(chosenFile);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-indigo-600" />
          Candidate Resume (PDF)
        </label>
        <span className="text-xs text-slate-500">Max size: 5MB</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`flex-1 min-h-[220px] rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80 bg-white'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-inner">
            <UploadCloud className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-slate-800">
            Click to upload or drag & drop your resume
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Accepts standard text-based PDF format
          </p>
          <span className="mt-4 inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Browse Files (.pdf)
          </span>
        </div>
      ) : (
        <div className="flex-1 min-h-[220px] rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">
                    {file.name}
                  </h4>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatFileSize(file.size)} • PDF Ready for Analysis
                </p>
              </div>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={() => {
                  onFileRemove();
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> File validated
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Choose different file
            </button>
          </div>
        </div>
      )}

      {localError && (
        <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{localError}</span>
        </div>
      )}
    </div>
  );
}

