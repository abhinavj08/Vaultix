import React, { useState } from 'react';
import { Plus, Upload, Trash2, Receipt, Sparkles } from 'lucide-react';
import { deleteTransaction } from '../api';
import AddTransactionModal from './AddTransactionModal';
import CSVUploadModal from './CSVUploadModal';

const CATEGORY_COLORS = {
  'Food & Dining': { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  'Shopping': { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30' },
  'Transportation': { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Bills & Utilities': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Entertainment': { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  'Health & Fitness': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Travel': { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'Income': { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
  'Groceries': { bg: 'bg-lime-500/15', text: 'text-lime-400', border: 'border-lime-500/30' },
  'Education': { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  'Other': { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
};

const formatDate = (dateString) => {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};

const formatCurrency = (val) => {
  return `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function TransactionTable({ transactions = [], onRefresh }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    setIsDeleting(id);
    try {
      await deleteTransaction(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header section */}
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Transactions</h2>
          <span className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded-full">
            {transactions.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCSVOpen(true)}
            className="btn-ghost text-sm py-2 px-3 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="btn-primary text-sm py-2 px-3 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
            <Sparkles className="w-3 h-3 ml-1 text-violet-300" />
          </button>
        </div>
      </div>

      {/* Table section */}
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Date</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium text-right">Amount</th>
                <th className="p-4 font-medium text-center">Type</th>
                <th className="p-4 pr-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => {
                const categoryStyle = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS['Other'];
                const isCredit = tx.type === 'credit';
                
                return (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 pl-6 text-sm text-slate-400 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="p-4 text-sm font-medium text-white max-w-[200px] truncate">
                      {tx.description}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                        {tx.category || 'Other'}
                      </span>
                    </td>
                    <td className={`p-4 text-sm font-semibold text-right whitespace-nowrap ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        isCredit 
                          ? 'bg-emerald-500/15 text-emerald-400' 
                          : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button 
                        onClick={() => handleDelete(tx.id)}
                        disabled={isDeleting === tx.id}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors inline-flex disabled:opacity-50"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
            <Receipt className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">No transactions yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            Add your first transaction manually or import a CSV file to start tracking your finances.
          </p>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Transaction
          </button>
        </div>
      )}

      {/* Modals */}
      {isAddOpen && (
        <AddTransactionModal 
          isOpen={isAddOpen} 
          onClose={() => setIsAddOpen(false)} 
          onSuccess={() => {
            setIsAddOpen(false);
            onRefresh();
          }} 
        />
      )}
      {isCSVOpen && (
        <CSVUploadModal 
          isOpen={isCSVOpen} 
          onClose={() => setIsCSVOpen(false)} 
          onSuccess={() => {
            setIsCSVOpen(false);
            onRefresh();
          }} 
        />
      )}
    </div>
  );
}
