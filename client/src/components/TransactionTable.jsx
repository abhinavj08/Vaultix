import React, { useState, useMemo } from 'react';
import { Plus, Upload, Trash2, Receipt, Sparkles, Search, Filter, Download, ArrowUpDown } from 'lucide-react';
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
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

const formatCurrency = (val) => {
  return `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function TransactionTable({ transactions = [], onRefresh }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL'); // ALL, debit, credit
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc

  const uniqueCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesDesc = (tx.description || '').toLowerCase().includes(q);
          const matchesCat = (tx.category || '').toLowerCase().includes(q);
          if (!matchesDesc && !matchesCat) return false;
        }
        // Category filter
        if (selectedCategory !== 'ALL' && tx.category !== selectedCategory) {
          return false;
        }
        // Type filter
        if (selectedType !== 'ALL' && tx.type !== selectedType) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, selectedCategory, selectedType, sortBy]);

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

  const exportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['Date', 'Description', 'Category', 'Amount (INR)', 'Type'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toISOString().split('T')[0],
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.category || 'Other'}"`,
      t.amount,
      t.type
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vaultix_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header section */}
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Transactions</h2>
          <span className="text-xs bg-white/10 text-slate-400 px-2.5 py-0.5 rounded-full font-medium">
            {filteredTransactions.length} of {transactions.length}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={exportCSV}
            disabled={filteredTransactions.length === 0}
            className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 disabled:opacity-40"
            title="Download filtered transactions as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button 
            onClick={() => setIsCSVOpen(true)}
            className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Transaction
            <Sparkles className="w-3 h-3 ml-0.5 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white/[0.02] border-b border-white/5 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchant, notes..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Type Filter */}
          <div className="inline-flex rounded-xl bg-slate-900/80 p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all ${selectedType === 'ALL' ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('debit')}
              className={`px-2.5 py-1 rounded-lg transition-all ${selectedType === 'debit' ? 'bg-rose-500/20 text-rose-400 font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Expenses
            </button>
            <button
              onClick={() => setSelectedType('credit')}
              className={`px-2.5 py-1 rounded-lg transition-all ${selectedType === 'credit' ? 'bg-emerald-500/20 text-emerald-400 font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Income
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900/80 border border-white/10 rounded-xl text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900 text-white">
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900/80 border border-white/10 rounded-xl text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="date-desc" className="bg-slate-900 text-white">Date: Newest First</option>
            <option value="date-asc" className="bg-slate-900 text-white">Date: Oldest First</option>
            <option value="amount-desc" className="bg-slate-900 text-white">Amount: Highest First</option>
            <option value="amount-asc" className="bg-slate-900 text-white">Amount: Lowest First</option>
          </select>
        </div>
      </div>

      {/* Table section */}
      {filteredTransactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Date</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium text-right">Amount (₹)</th>
                <th className="p-4 font-medium text-center">Type</th>
                <th className="p-4 pr-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx) => {
                const categoryStyle = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS['Other'];
                const isCredit = tx.type === 'credit';
                
                return (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 pl-6 text-sm text-slate-400 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="p-4 text-sm font-medium text-white max-w-[220px] truncate">
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
          <h3 className="text-lg font-medium text-white mb-1">
            {transactions.length === 0 ? 'No transactions yet' : 'No matching transactions'}
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            {transactions.length === 0 
              ? 'Add your first transaction manually or paste raw SMS text above.' 
              : 'Try clearing your search or changing the selected category filter.'}
          </p>
          {transactions.length === 0 && (
            <button 
              onClick={() => setIsAddOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Transaction
            </button>
          )}
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
