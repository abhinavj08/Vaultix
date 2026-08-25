import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function MonthPicker({ month, year, onChange }) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrev = () => {
    if (month === 1) {
      onChange(12, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onChange(1, year + 1);
    } else {
      onChange(month + 1, year);
    }
  };

  return (
    <div className="glass-card inline-flex items-center p-1.5 border-white/10 shadow-lg">
      <button 
        onClick={handlePrev}
        className="btn-ghost p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="flex items-center gap-2 px-4 min-w-[160px] justify-center">
        <Calendar className="w-4 h-4 text-violet-400" />
        <span className="text-white font-semibold whitespace-nowrap">
          {months[month - 1]} {year}
        </span>
      </div>

      <button 
        onClick={handleNext}
        className="btn-ghost p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
