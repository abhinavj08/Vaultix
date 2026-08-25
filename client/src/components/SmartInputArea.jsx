import React, { useState } from 'react';
import { Sparkles, Loader2, IndianRupee, ArrowRight, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import { addTransaction } from '../api';

export default function SmartInputArea({ onTransactionAdded }) {
  const [rawText, setRawText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('debit');
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [error, setError] = useState('');

  // Automatically try to extract numbers if user pastes something like "STARBUCKS 450"
  const handleTextChange = (e) => {
    const text = e.target.value;
    setRawText(text);
    setError('');

    // If amount is empty, try to extract last numeric part from text
    if (!amount) {
      const match = text.match(/(?:(?:rs\.?|inr|₹|\$)\s*)?([0-9]+(?:\.[0-9]{1,2})?)$/i);
      if (match && match[1]) {
        setAmount(match[1]);
      }
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setError('Please enter a transaction description or raw text.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResultMessage(null);

    try {
      const res = await addTransaction({
        date: new Date().toISOString().split('T')[0],
        description: rawText.trim(),
        amount: Number(amount),
        type: type,
      });

      const newCategory = res?.transaction?.category || 'Categorized';
      setResultMessage(`Categorized as "${newCategory}" ✨`);
      setRawText('');
      setAmount('');
      
      if (onTransactionAdded) {
        onTransactionAdded();
      }

      setTimeout(() => {
        setResultMessage(null);
      }, 4000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to categorize transaction. Please try again.');
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to categorize transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-glow rounded-2xl bg-gradient-to-br from-slate-900/90 via-violet-950/40 to-slate-900/90 border border-violet-500/30 p-6 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              Smart AI Transaction Categorizer
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Gemini 2.5
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Paste raw bank transaction text (e.g. "TST* STARBUCKS", "UPI/Swiggy/5820") and AI will categorize it instantly.
            </p>
          </div>
        </div>

        {/* Expense / Income selector */}
        <div className="inline-flex rounded-xl bg-slate-900/80 p-1 border border-white/10 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setType('debit')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              type === 'debit'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('credit')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              type === 'credit'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Income
          </button>
        </div>
      </div>

      <form onSubmit={handleQuickAdd} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Raw Text Input */}
          <div className="md:col-span-7 relative">
            <input
              type="text"
              value={rawText}
              onChange={handleTextChange}
              placeholder="e.g. TST* STARBUCKS #1940, ZOMATO ORDER, UBER RIDE..."
              className="w-full pl-4 pr-4 py-3 bg-slate-900/90 border border-violet-500/30 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-inner"
              disabled={isLoading}
            />
          </div>

          {/* Amount Input */}
          <div className="md:col-span-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IndianRupee className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (₹)"
              className="w-full pl-9 pr-3 py-3 bg-slate-900/90 border border-violet-500/30 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-inner"
              disabled={isLoading}
            />
          </div>

          {/* Action Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isLoading || !rawText.trim() || !amount}
              className="w-full h-full py-3 px-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Auto Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback / Alerts */}
        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
            {error}
          </p>
        )}

        {resultMessage && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resultMessage}</span>
          </div>
        )}
      </form>
    </div>
  );
}

