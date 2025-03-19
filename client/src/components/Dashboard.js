import React, { useContext, useMemo } from 'react';
import { ThemeContext } from '../ThemeContext';
import D3MonthlyTrendChart from './D3MonthlyTrendChart';
import D3PieChart from './D3PieChart';

const Dashboard = ({ transactions = [], selectedMonth, showAllMonths }) => {
  const { darkMode } = useContext(ThemeContext);
  
  // Colors for pie chart - themed based on dark/light mode, memoized for performance
  const COLORS = useMemo(() => {
    return darkMode ? 
      ['#818cf8', '#34d399', '#facc15', '#f87171', '#c084fc', '#22d3ee'] :
      ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  }, [darkMode]);

  // Format month name properly
  const monthName = showAllMonths
    ? 'All Time'
    : (() => {
        // Use day 15 to avoid potential month shifts due to timezone
        const date = new Date(`${selectedMonth}-15T12:00:00`);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
      })();

  // Calculate summary data from transactions
  const calculateSummary = () => {
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const netCashflow = totalIncome - totalExpenses;
    
    const savingsRate = totalIncome > 0 
      ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) 
      : 0;
      
    // Find largest expense
    let largestExpense = { category: 'None', amount: 0 };
    if (transactions.length > 0) {
      const expensesByCategory = {};
      transactions
        .filter(t => t.amount < 0)
        .forEach(t => {
          const category = t.category || 'Uncategorized';
          expensesByCategory[category] = (expensesByCategory[category] || 0) + Math.abs(t.amount);
        });
        
      Object.entries(expensesByCategory).forEach(([category, amount]) => {
        if (amount > largestExpense.amount) {
          largestExpense = { category, amount };
        }
      });
    }
    
    return {
      totalIncome,
      totalExpenses,
      netCashflow,
      savingsRate,
      largestExpense: largestExpense.category,
      largestExpenseAmount: largestExpense.amount,
      upcomingBills: 0 // Future feature
    };
  };
  
  // Prepare category breakdown data
  const prepareCategoryBreakdown = () => {
    const categories = {};
    
    transactions
      .filter(t => t.amount < 0)
      .forEach(t => {
        const category = t.category || 'Uncategorized';
        categories[category] = (categories[category] || 0) + Math.abs(t.amount);
      });
      
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };
  
  // Prepare monthly trend data
  const prepareMonthlyTrend = () => {
    const months = {};
    
    transactions.forEach(t => {
      // Parse date safely with day 15 to avoid timezone issues
      const dateParts = t.date.split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
      
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      const date = new Date(year, month, 15); // Use day 15 to avoid timezone issues
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      if (!months[monthKey]) {
        months[monthKey] = { month: monthName, income: 0, expenses: 0 };
      }
      
      if (t.amount > 0) {
        months[monthKey].income += t.amount;
      } else {
        months[monthKey].expenses += Math.abs(t.amount);
      }
    });
    
    return Object.values(months).sort((a, b) => {
      // Sort by month (assuming month names)
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });
  };
  
  const summary = calculateSummary();
  const categoryBreakdown = prepareCategoryBreakdown();
  const monthlyTrend = prepareMonthlyTrend();

  // For empty state
  if (transactions.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-primary mb-4">Welcome to Your Financial Dashboard</h2>
        <p className="text-secondary mb-6">
          Add your first transaction to see your financial data visualized here.
        </p>
        <div className="border-2 border-dashed border-theme rounded-lg p-12">
          <svg className="mx-auto h-12 w-12 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-4 text-tertiary">Your charts and insights will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-primary">{monthName} Overview</h1>
      
      {/* Summary Cards - Made more spacious with better height */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Monthly Summary Card */}
        <div className="bg-tertiary rounded-lg border border-theme h-40 overflow-hidden">
          <div className="bg-tertiary border-b border-theme px-5 py-2">
            <h2 className="text-lg font-medium text-primary">Monthly Summary</h2>
          </div>
          <div className="p-4 flex flex-col justify-center h-[calc(100%-40px)]">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-secondary">Income:</span>
                <span className="font-medium text-income">${summary.totalIncome.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Expenses:</span>
                <span className="font-medium text-expense">${Math.abs(summary.totalExpenses).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-theme mt-2">
                <span className="text-primary font-medium">Net:</span>
                <span className={`font-medium ${summary.netCashflow >= 0 ? 'text-income' : 'text-expense'}`}>
                  ${summary.netCashflow.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Savings Rate Card */}
        <div className="bg-tertiary rounded-lg border border-theme h-40 overflow-hidden">
          <div className="bg-tertiary border-b border-theme px-5 py-2">
            <h2 className="text-lg font-medium text-primary">Savings Rate</h2>
          </div>
          <div className="flex items-center justify-center h-[calc(100%-40px)]">
            <div className="text-5xl font-bold" style={{ color: 'var(--accent-color)' }}>{summary.savingsRate}%</div>
          </div>
        </div>
        
        {/* Largest Expense Card */}
        <div className="bg-tertiary rounded-lg border border-theme h-40 overflow-hidden">
          <div className="bg-tertiary border-b border-theme px-5 py-2">
            <h2 className="text-lg font-medium text-primary">Largest Expense</h2>
          </div>
          <div className="flex flex-col justify-center px-5 h-[calc(100%-40px)]">
            <div className="text-4xl font-bold text-expense mb-1">${summary.largestExpenseAmount.toFixed(2)}</div>
            <div className="text-secondary text-lg">{summary.largestExpense}</div>
          </div>
        </div>
      </div>
      
      {/* Charts Section - Enlarged charts with more breathing room */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
        {/* Monthly Income vs Expenses */}
        <div className="bg-tertiary rounded-lg border border-theme overflow-hidden">
          <div className="bg-tertiary border-b border-theme px-5 py-2">
            <h2 className="text-lg font-medium text-primary">Monthly Trend</h2>
          </div>
          {monthlyTrend.length > 0 ? (
            <div className="p-5 h-96">
              <D3MonthlyTrendChart
                data={monthlyTrend}
                darkMode={darkMode}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 p-5">
              <p className="text-tertiary">Not enough data to display monthly trends</p>
            </div>
          )}
        </div>
        
        {/* Expense Breakdown */}
        <div className="bg-tertiary rounded-lg border border-theme overflow-hidden">
          <div className="bg-tertiary border-b border-theme px-5 py-2">
            <h2 className="text-lg font-medium text-primary">Expense Breakdown</h2>
          </div>
          {categoryBreakdown.length > 0 ? (
            <div className="p-5 h-96">
              <D3PieChart
                data={categoryBreakdown}
                colorScale={COLORS}
                darkMode={darkMode}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 p-5">
              <p className="text-tertiary">No expense data to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;