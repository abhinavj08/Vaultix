import React, { useState, useEffect } from 'react';
import { Sliders, ChevronDown, ChevronUp, Loader2, Save, CheckCircle2 } from 'lucide-react';
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
  { category: 'Other', defaultLimit: 1000 },
];

export default function BudgetSettings({ budgets = [], month, year, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localBudgets, setLocalBudgets] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState('');

  const targetMonth = month || new Date().getMonth() + 1;
  const targetYear = year || new Date().getFullYear();

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
          initial[b.category] = b.limit !== undefined ? b.limit : (b.amount || 0);
        }
      });
    }
    
    setLocalBudgets(initial);
  }, [budgets]);

  const handleInputChange = (category, value) => {
    const num = parseFloat(value);
    setLocalBudgets(prev => ({
      ...prev,
      [category]: isNaN(num) ? '' : num
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMessage(null);

    try {
      // Format array for API
      const budgetsToSave = Object.entries(localBudgets).map(([category, limit]) => ({
        category,
        limit: Number(limit) || 0
      }));
      
      await updateBudgets(budgetsToSave, targetMonth, targetYear);
      
      setSuccessMessage('Budgets saved successfully! ✨');
      if (onUpdate) {
        onUpdate();
      }

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to update budgets:', err);
      const serverErr = err.response?.data?.error || err.response?.data?.message;
      setError(serverErr || 'Failed to save budgets. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Toggle Header */}
      <button 
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/20 border border-violet-500/30 rounded-xl">
            <Sliders className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <span className="text-lg font-bold text-white block">Budget Settings</span>
            <span className="text-xs text-slate-400">Set monthly spending limits for each category in ₹</span>
          </div>
        </div>
        <div className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 transition-transform" />
          ) : (
            <ChevronDown className="w-5 h-5 transition-transform" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/10 bg-slate-950/60 p-6 space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(localBudgets).map(([category, limit]) => (
              <div 
                key={category} 
                className="bg-slate-900 p-4 rounded-xl border border-white/10 hover:border-violet-500/30 transition-colors shadow-sm"
              >
                <label className="block text-xs font-semibold text-slate-300 mb-2 truncate" title={category}>
                  {category}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold text-xs">₹</span>
                  </div>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={limit}
                    onChange={(e) => handleInputChange(category, e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-400">
              Budgets are linked to {new Date(targetYear, targetMonth - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Budgets...
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
