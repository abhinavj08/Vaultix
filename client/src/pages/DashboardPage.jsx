import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import MonthPicker from '../components/MonthPicker';
import Dashboard from '../components/Dashboard';
import TransactionTable from '../components/TransactionTable';
import BudgetSettings from '../components/BudgetSettings';
import { getDashboard, getTransactions, getBudgets } from '../api';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const date = new Date();
  const [selectedMonth, setSelectedMonth] = useState(date.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(date.getFullYear());
  
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, transRes, budgRes] = await Promise.all([
        getDashboard(selectedMonth, selectedYear),
        getTransactions(selectedMonth, selectedYear),
        getBudgets(selectedMonth, selectedYear)
      ]);
      setDashboardData(dashRes);
      setTransactions(transRes.data || []);
      setBudgets(budgRes.data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMonthChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <MonthPicker 
          month={selectedMonth} 
          year={selectedYear} 
          onChange={handleMonthChange} 
        />
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            <Dashboard data={dashboardData} />
            <TransactionTable transactions={transactions} onRefresh={handleRefresh} />
            <BudgetSettings budgets={budgets} month={selectedMonth} year={selectedYear} onUpdate={handleRefresh} />
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
