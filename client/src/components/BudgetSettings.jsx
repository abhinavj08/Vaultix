import React, { useState, useEffect } from 'react';
import { Settings, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { updateBudgets } from '../api';

const BudgetSettings = ({ budgets, month, year, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localBudgets, setLocalBudgets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (budgets && budgets.length > 0) {
      setLocalBudgets(budgets.map(b => ({
        category: b.category,
        limit: b.limit !== undefined ? b.limit : (b.amount || 0)
      })));
    } else {
      setLocalBudgets([
        { category: 'Groceries', limit: 5000 },
        { category: 'Food & Dining', limit: 4000 },
        { category: 'Transportation', limit: 2000 },
        { category: 'Entertainment', limit: 1500 },
        { category: 'Bills & Utilities', limit: 3000 },
        { category: 'Shopping', limit: 2500 }
      ]);
    }
  }, [budgets]);

  const handleAmountChange = (index, value) => {
    const newBudgets = [...localBudgets];
    newBudgets[index].limit = Number(value);
    setLocalBudgets(newBudgets);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateBudgets(localBudgets, month, year);
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save budgets", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors focus:outline-none"
      >
        <div className="flex items-center text-lg font-semibold text-gray-800">
          <Settings className="h-5 w-5 mr-2 text-indigo-600" />
          Budget Settings
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {localBudgets.map((b, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">{b.category}</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={b.limit !== undefined ? b.limit : ''}
                    onChange={(e) => handleAmountChange(index, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Budgets
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetSettings;
