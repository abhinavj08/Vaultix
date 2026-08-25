import React, { useState, useEffect } from 'react';
import { Sliders, ChevronDown, ChevronUp, Loader2, Save } from 'lucide-react';
import { updateBudgets } from '../api';

const DEFAULT_CATEGORIES = [
  { category: 'Food & Dining', defaultLimit: 5000 },
  { category: 'Groceries', defaultLimit: 4000 },
  { category: 'Transportation', defaultLimit: 3000 },
  { category: 'Shopping', defaultLimit: 4000 },
  { category: 'Bills & Utilities', defaultLimit: 5000 },
  { category: 'Entertainment', defaultLimit: 2000 },
  { category: 'Health & Fitness', defaultLimit: 2000 },
  { category: 'Travel', defaultLimit: 5000 },
  { category: 'Education', defaultLimit: 3000 },
];

export default function BudgetSettings({ budgets = [], month, year, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localBudgets, setLocalBudgets] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize local budgets from props or defaults
  useEffect(() => {
    const initial = {};
    
    // Fill with defaults first
    DEFAULT_CATEGORIES.forEach(cat => {
      initial[cat.category] = cat.defaultLimit;
    });
    
    // Override with actual data
    if (budgets && budgets.length > 0) {
      budgets.forEach(b => {
        if (b.category) {
          initial[b.category] = b.limit;
        }
      });
    }
    
    setLocalBudgets(initial);
  }, [budgets]);

  const handleInputChange = (category, value) => {
    setLocalBudgets(prev => ({
      ...prev,
      [category]: Number(value)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Format array for API
      const budgetsToSave = Object.entries(localBudgets).map(([category, limit]) => ({
        category,
        limit,
        month,
        year
      }));
      
      await updateBudgets(budgetsToSave);
      if (onUpdate) onUpdate();
      
      // Optionally close after save
      // setIsExpanded(false);
    } catch (error) {
      console.error('Failed to update budgets:', error);
      alert('Failed to save budgets. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Toggle Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-xl">
            <Sliders className="w-5 h-5 text-violet-400" />
          </div>
          <span className="text-lg font-semibold text-white">Budget Settings</span>
        </div>
        <div className="text-slate-400">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 transition-transform" />
          ) : (
            <ChevronDown className="w-5 h-5 transition-transform" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/5 bg-black/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {Object.entries(localBudgets).map(([category, limit]) => (
              <div 
                key={category} 
                className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
              >
                <label className="block text-sm font-medium text-slate-300 mb-2 truncate" title={category}>
                  {category}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium">₹</span>
                  </div>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={limit}
                    onChange={(e) => handleInputChange(category, e.target.value)}
                    className="input-dark w-full pl-8 py-2"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 pt-2 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2 px-6"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Budgets
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
