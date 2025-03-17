import React, { useContext } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ThemeContext } from '../ThemeContext';

const Dashboard = ({ transactions = [], selectedMonth, showAllMonths }) => {
  const { darkMode } = useContext(ThemeContext);
  
  // Colors for pie chart - themed based on dark/light mode
  const COLORS = darkMode ? 
    ['#818cf8', '#34d399', '#facc15', '#f87171', '#c084fc', '#22d3ee'] :
    ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-md shadow-md ${darkMode ? 'bg-secondary border border-theme' : 'bg-white border border-gray-200'}`}>
          <p className="text-primary font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-md shadow-md ${darkMode ? 'bg-secondary border border-theme' : 'bg-white border border-gray-200'}`}>
          <p className="text-primary font-medium">{payload[0].name}</p>
          <p style={{ color: payload[0].color }}>
            ${payload[0].value.toFixed(2)} ({((payload[0].value / summary.totalExpenses) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
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
        <div className="bg-tertiary p-5 rounded-lg border border-theme h-40">
          <h2 className="text-lg font-medium text-primary mb-2">Monthly Summary</h2>
          <div className="mt-3 space-y-2">
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
        
        <div className="bg-tertiary p-5 rounded-lg border border-theme h-40">
          <h2 className="text-lg font-medium text-primary mb-2">Savings Rate</h2>
          <div className="flex items-center justify-center h-24">
            <div className="text-5xl font-bold" style={{ color: 'var(--accent-color)' }}>{summary.savingsRate}%</div>
          </div>
        </div>
        
        <div className="bg-tertiary p-5 rounded-lg border border-theme h-40">
          <h2 className="text-lg font-medium text-primary mb-2">Largest Expense</h2>
          <div className="mt-3">
            <div className="text-4xl font-bold text-expense mb-2">${summary.largestExpenseAmount.toFixed(2)}</div>
            <div className="text-secondary text-lg">{summary.largestExpense}</div>
          </div>
        </div>
      </div>
      
      {/* Charts Section - Enlarged charts with more breathing room */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
        {/* Monthly Income vs Expenses */}
        <div className="bg-tertiary p-5 rounded-lg border border-theme">
          <h2 className="text-lg font-medium text-primary mb-5">Monthly Trend</h2>
          {monthlyTrend.length > 0 ? (
            <div className="h-80"> {/* Increased height for better visualization */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#27272a" : "#e2e8f0"} />
                  <XAxis dataKey="month" stroke={darkMode ? "#a1a1aa" : "#475569"} />
                  <YAxis stroke={darkMode ? "#a1a1aa" : "#475569"} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend />
                  <Bar dataKey="income" fill={darkMode ? "#34d399" : "#10b981"} name="Income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill={darkMode ? "#f87171" : "#ef4444"} name="Expenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-tertiary">Not enough data to display monthly trends</p>
            </div>
          )}
        </div>
        
        {/* Expense Breakdown */}
        <div className="bg-tertiary p-5 rounded-lg border border-theme">
          <h2 className="text-lg font-medium text-primary mb-5">Expense Breakdown</h2>
          {categoryBreakdown.length > 0 ? (
            <div className="h-80"> {/* Increased height for better visualization */}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={130} /* Larger pie chart */
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-tertiary">No expense data to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;