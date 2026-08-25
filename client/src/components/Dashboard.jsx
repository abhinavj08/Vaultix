import React from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Wallet, Percent, Sparkles, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function Dashboard({ data }) {
  const { 
    totalIncome = 0, 
    totalExpenses = 0, 
    netBalance = 0, 
    tip: aiTip = 'Analyze your spending patterns to get personalized insights.', 
    spendingByCategory = [], 
    budgetVsActual = [] 
  } = data || {};

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
  
  const formatCurrency = (val) => `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const COLORS = ['#8b5cf6', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185', '#f97316', '#facc15', '#34d399', '#22d3ee', '#64748b'];

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800/90 backdrop-blur border border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-white font-medium mb-1">{data.name}</p>
          <p className="text-slate-300 text-sm">{formatCurrency(data.value)}</p>
          <p className="text-slate-400 text-xs">{(payload[0].percent * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/90 backdrop-blur border border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2 mb-1" style={{ color: entry.fill }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }}></span>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Total Income */}
        <div className="glass-card-hover p-6 relative overflow-hidden">
          <div className="flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">{formatCurrency(totalIncome)}</p>
              <p className="text-sm text-slate-400">Total Income</p>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
        </div>

        {/* Total Expenses */}
        <div className="glass-card-hover p-6 relative overflow-hidden">
          <div className="flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">{formatCurrency(totalExpenses)}</p>
              <p className="text-sm text-slate-400">Total Expenses</p>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1 rounded-full bg-gradient-to-b from-rose-400 to-rose-600" />
        </div>

        {/* Net Balance */}
        <div className="glass-card-hover p-6 relative overflow-hidden">
          <div className="flex flex-col gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${netBalance >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
              <Wallet className={`w-5 h-5 ${netBalance >= 0 ? 'text-blue-400' : 'text-orange-400'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">{formatCurrency(netBalance)}</p>
              <p className="text-sm text-slate-400">Net Balance</p>
            </div>
          </div>
          <div className={`absolute right-0 top-0 h-full w-1 rounded-full bg-gradient-to-b ${netBalance >= 0 ? 'from-blue-400 to-blue-600' : 'from-orange-400 to-orange-600'}`} />
        </div>

        {/* Savings Rate */}
        <div className="glass-card-hover p-6 relative overflow-hidden">
          <div className="flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Percent className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">{savingsRate.toFixed(1)}%</p>
              <p className="text-sm text-slate-400">Savings Rate</p>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1 rounded-full bg-gradient-to-b from-violet-400 to-violet-600" />
        </div>
      </div>

      {/* AI Financial Tip */}
      <div className="ai-glow rounded-2xl bg-gradient-to-r from-violet-900/50 via-purple-900/30 to-fuchsia-900/50 border border-violet-500/30 p-6 relative overflow-hidden flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-violet-400 animate-pulse-slow" />
        </div>
        <div className="flex-1">
          <div className="inline-block px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
            AI Insight
          </div>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            {aiTip}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 h-[1px] w-full shimmer-bg" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Spending Breakdown */}
        <div className="glass-card p-6 h-96 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Spending Breakdown</h3>
          <div className="flex-1 w-full min-h-0 relative">
            {spendingByCategory && spendingByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingByCategory}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {spendingByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <PieChartIcon className="w-12 h-12 mb-3 text-slate-600" />
                <p>No spending data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Budget vs Actual */}
        <div className="glass-card p-6 h-96 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Budget vs Actual</h3>
          <div className="flex-1 w-full min-h-0 relative">
            {budgetVsActual && budgetVsActual.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsActual} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#ffffff0a' }} />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '20px' }}
                    formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                  />
                  <Bar dataKey="budget" name="Budget" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar 
                    dataKey="actual" 
                    name="Actual"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    {
                      budgetVsActual.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.actual > entry.budget ? '#ef4444' : '#f59e0b'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <BarChart3 className="w-12 h-12 mb-3 text-slate-600" />
                <p>Set budgets to compare</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
