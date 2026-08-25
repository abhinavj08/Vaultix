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
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file.');
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
    if (!file) return;
    
    setIsLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await uploadCSV(formData);
      // Assuming response returns the number of imported transactions
      const count = response?.data?.count || response?.count || 0;
      setSuccessCount(count);
      
      // Auto close and refresh after a delay
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to process CSV file. Please check the format and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={() => !isLoading && onClose()}></div>
      
      {/* Modal card */}
      <div className="glass-card max-w-lg w-full relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 relative">
          <h2 className="text-xl font-bold text-white mb-1">Upload Bank Statement</h2>
          <p className="text-sm text-slate-400">
            Import transactions from a CSV file
          </p>
          {!isLoading && (
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-sm">
              {error}
            </div>
          )}
          
          {successCount !== null ? (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
              <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-emerald-400 mb-2">Upload Successful!</h3>
              <p className="text-slate-300">
                {successCount} transactions imported successfully.
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
                    ? 'border-violet-500/50 bg-violet-500/5' 
                    : 'border-white/10 hover:border-violet-500/50 hover:bg-violet-500/5'
                }`}
              >
                <div className="flex justify-center mb-3">
                  <Upload className={`h-12 w-12 transition-colors ${isDragging ? 'text-violet-400' : 'text-slate-500'}`} />
                </div>
                <p className="text-slate-300 mb-1 font-medium">Drag & drop your CSV file</p>
                <p className="text-violet-400 hover:text-violet-300 text-sm">or browse files</p>
                
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
              </div>
              <p className="text-center text-xs text-slate-500">
                Supported columns: Date, Description, Amount
              </p>
            </>
          ) : (
            /* Selected File Info */
            <div className="glass bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button 
                onClick={clearFile}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {successCount === null && (
          <div className="p-6 border-t border-white/5 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="btn-ghost"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
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
