import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart as PieChartIcon, 
  Settings, 
  LogOut, 
  Shield, 
  Menu, 
  X, 
  Loader2 
} from 'lucide-react';
import MonthPicker from '../components/MonthPicker';
import Dashboard from '../components/Dashboard';
import TransactionTable from '../components/TransactionTable';
import BudgetSettings from '../components/BudgetSettings';
import { getDashboard, getTransactions, getBudgets } from '../api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, transRes, budgRes] = await Promise.all([
          getDashboard(selectedMonth, selectedYear),
          getTransactions(selectedMonth, selectedYear),
          getBudgets()
        ]);
        
        setDashboardData(dashRes || {});
        setTransactions(transRes.transactions || []);
        setBudgets(budgRes.budgets || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleMonthChange = (newMonth, newYear) => {
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, tooltip: 'Dashboard' },
    { id: 'transactions', icon: Receipt, tooltip: 'Transactions' },
    { id: 'budgets', icon: PieChartIcon, tooltip: 'Budgets' },
    { id: 'settings', icon: Settings, tooltip: 'Settings' }
  ];

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col space-y-6">
          <div className="h-12 w-48 bg-white/5 animate-pulse rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl" />)}
          </div>
          <div className="h-24 bg-white/5 animate-pulse rounded-2xl w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-white/5 animate-pulse rounded-2xl" />
            <div className="h-80 bg-white/5 animate-pulse rounded-2xl" />
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="mb-8">
              <MonthPicker month={selectedMonth} year={selectedYear} onChange={handleMonthChange} />
            </div>
            <Dashboard data={dashboardData} />
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
              <TransactionTable transactions={transactions.slice(0, 5)} onRefresh={() => {}} preview={true} />
            </div>
          </>
        );
      case 'transactions':
        return (
          <>
            <div className="mb-8">
              <MonthPicker month={selectedMonth} year={selectedYear} onChange={handleMonthChange} />
            </div>
            <TransactionTable transactions={transactions} onRefresh={() => {}} />
          </>
        );
      case 'budgets':
        return (
          <BudgetSettings budgets={budgets} onRefresh={() => {}} />
        );
      case 'settings':
        return <div className="text-white p-6 glass-card">Settings coming soon...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 font-['Inter'] overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-20 flex flex-col items-center py-6
        bg-slate-900/80 backdrop-blur-xl border-r border-white/5 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mb-8 shadow-lg shadow-violet-500/20">
          <Shield className="w-6 h-6 text-white" />
        </div>

        {/* Menu Items */}
        <nav className="flex-1 w-full flex flex-col gap-2 px-3">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  relative w-full aspect-square rounded-xl flex items-center justify-center group transition-all duration-200
                  ${isActive ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                `}
                title={item.tooltip}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-violet-500 rounded-r-full" />
                )}
                <Icon className="w-6 h-6" />
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full aspect-square text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl flex items-center justify-center transition-all px-3"
          title="Log out"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col lg:pl-20 min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Good afternoon, {user?.name || 'User'} <span className="text-2xl">👋</span>
              </h1>
              <p className="text-sm text-slate-400">{currentDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <button onClick={logout} className="text-xs text-slate-500 hover:text-white transition-colors">Sign out</button>
              </div>
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/20 border border-white/10">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
