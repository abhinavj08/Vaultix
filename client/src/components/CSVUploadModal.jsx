import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { uploadCSV } from '../api';

export default function CSVUploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState(null);
  const fileInputRef = useRef(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setIsDragging(false);
      setIsLoading(false);
      setError('');
      setSuccessCount(null);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, isLoading]);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    setError('');
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file (.csv).');
      return;
    }
    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!file || isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await uploadCSV(file);
      const count = response?.count || response?.data?.count || 0;
      setSuccessCount(count);
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || err.response?.data?.message;
      setError(msg || 'Failed to process CSV file. Please check format and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={() => !isLoading && onClose()} />
      
      {/* Modal card */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Upload Bank Statement</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Import transactions in bulk from a CSV file
            </p>
          </div>
          {!isLoading && (
            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 bg-slate-900">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-xs leading-relaxed">
              {error}
            </div>
          )}
          
          {successCount !== null ? (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
              <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-emerald-400 mb-1">Import Successful!</h3>
              <p className="text-sm text-slate-300">
                {successCount} transactions imported & categorized by AI.
              </p>
            </div>
          ) : !file ? (
            <>
              {/* Drag & Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-violet-500 bg-violet-500/10' 
                    : 'border-white/10 hover:border-violet-500/50 hover:bg-violet-500/5 bg-slate-950/50'
                }`}
              >
                <div className="flex justify-center mb-3">
                  <Upload className={`h-10 w-10 transition-colors ${isDragging ? 'text-violet-400' : 'text-slate-500'}`} />
                </div>
                <p className="text-slate-200 mb-1 font-medium text-sm">Drag & drop your CSV bank statement</p>
                <p className="text-violet-400 hover:text-violet-300 text-xs">or click to browse from device</p>
                
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
              </div>
              <p className="text-center text-[11px] text-slate-500">
                Auto-detects columns: Date, Description, Amount, Debit/Credit
              </p>
            </>
          ) : (
            /* Selected File Info */
            <div className="bg-slate-950 rounded-xl p-4 flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={clearFile}
                disabled={isLoading}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {successCount === null && (
          <div className="p-4 bg-slate-950/60 border-t border-white/10 flex items-center justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing & Categorizing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload & Process
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
