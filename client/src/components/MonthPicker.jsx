import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MonthPicker = ({ month, year, onChange }) => {
  const date = new Date(year, month - 1);
  const monthName = date.toLocaleString('default', { month: 'long' });

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
    <div className="flex items-center justify-center space-x-4 mb-6">
      <button 
        onClick={handlePrev}
        className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors focus:outline-none"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="px-6 py-2 bg-white rounded-full shadow-sm border border-gray-100 font-semibold text-gray-800 min-w-[160px] text-center">
        {monthName} {year}
      </div>
      <button 
        onClick={handleNext}
        className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors focus:outline-none"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default MonthPicker;
