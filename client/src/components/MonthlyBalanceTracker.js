import React, { useState, useEffect } from 'react';

const MonthlyBalanceTracker = ({ 
  transactions, 
  onAddCarryover, 
  onMonthChange, 
  selectedMonth: propSelectedMonth, 
  showAllMonths: propShowAllMonths 
}) => {
  // Use props for initial state or default values
  const [selectedMonth, setSelectedMonth] = useState(propSelectedMonth || new Date().toISOString().substring(0, 7));
  const [showAllMonths, setShowAllMonths] = useState(propShowAllMonths || false);
  const [previousBalance, setPreviousBalance] = useState(0);
  
  // Sync local state with props when they change
  useEffect(() => {
    if (propSelectedMonth !== undefined) {
      setSelectedMonth(propSelectedMonth);
    }
    if (propShowAllMonths !== undefined) {
      setShowAllMonths(propShowAllMonths);
    }
  }, [propSelectedMonth, propShowAllMonths]);
  
  // Generate list of months (current and previous)
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = date.toISOString().substring(0, 7); // YYYY-MM format
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      options.push({ value: monthStr, label: monthName });
    }
    return options;
  };
  
  // Calculate previous month's ending balance
  useEffect(() => {
    // Get previous month
    const current = new Date(selectedMonth + '-01');
    const previousMonth = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    const previousMonthStr = previousMonth.toISOString().substring(0, 7);
    
    // Calculate previous month's ending balance
    let balance = 0;
    transactions.forEach(t => {
      const transMonth = t.date.substring(0, 7);
      if (transMonth <= previousMonthStr) {
        balance += t.amount;
      }
    });
    
    setPreviousBalance(balance);
  }, [selectedMonth, transactions]);
  
  // Handle adding the previous month's balance as a carryover
  const handleAddCarryover = () => {
    if (previousBalance !== 0) {
      const carryoverTransaction = {
        id: Date.now(),
        date: `${selectedMonth}-01`, // First day of selected month
        description: `Balance carried forward from previous month`,
        amount: previousBalance,
        category: 'Carryover'
      };
      
      onAddCarryover(carryoverTransaction);
    }
  };

  // Handle month change
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(newMonth, showAllMonths);
    }
  };

  // Handle show all months toggle
  const handleShowAllToggle = () => {
    const newValue = !showAllMonths;
    setShowAllMonths(newValue);
    if (onMonthChange) {
      onMonthChange(selectedMonth, newValue);
    }
  };
  
  return (
    <div className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div>
          <h2 className="text-lg font-medium text-primary mb-2">Month Selection</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-64">
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="w-full input-premium"
            >
              {getMonthOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showAllMonths"
              checked={showAllMonths}
              onChange={handleShowAllToggle}
              className="h-4 w-4 rounded border-theme accent-color"
            />
            <label htmlFor="showAllMonths" className="ml-2 text-sm text-secondary">
              Show all months
            </label>
          </div>
        </div>
      </div>
      
      {previousBalance !== 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 mt-2 bg-tertiary rounded-lg border border-theme">
          <div className="mb-2 sm:mb-0">
            <span className="text-sm text-secondary">Previous month's ending balance:</span>
            <span className={`ml-2 font-medium ${previousBalance >= 0 ? 'text-income' : 'text-expense'}`}>
              ${previousBalance.toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={handleAddCarryover}
            className="btn-premium px-3 py-1 text-sm font-medium"
          >
            Add as Carryover
          </button>
        </div>
      )}
    </div>
  );
};

export default MonthlyBalanceTracker;