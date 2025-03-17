import React, { useContext } from 'react';
import Dashboard from './components/Dashboard';
import BankStatementUpload from './components/BankStatementUpload';
import TransactionList from './components/TransactionList';
import ManualTransactionEntry from './components/ManualTransactionEntry';
import MonthlyBalanceTracker from './components/MonthlyBalanceTracker';
import CreditCardTracker from './components/CreditCardTracker';
import ThemeToggle from './components/ThemeToggle';
import { ThemeContext } from './ThemeContext';
import DataBackupTools from './components/DataBackupTools';

// Custom hook for localStorage
function useLocalStorage(key, initialValue) {
  // Create state to store our value
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

const App = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  
  // Use the custom hook instead of useState and useEffect for localStorage
  const [transactions, setTransactions] = useLocalStorage('finances-transactions', []);
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().toISOString().substring(0, 7));
  const [showAllMonths, setShowAllMonths] = React.useState(false);
  
  // Filter transactions based on selected month or all months
  const filteredTransactions = showAllMonths 
    ? transactions 
    : transactions.filter(t => t.date.startsWith(selectedMonth));
  
  // Handle various transaction additions
  const handleAddTransaction = (newTransaction) => {
    setTransactions(prev => [...prev, newTransaction]);
  };
  
  const handleUploadSuccess = (newTransactions) => {
    const transactionsWithIds = newTransactions.map((transaction, index) => ({
      ...transaction,
      id: Math.max(...(transactions.length ? transactions.map(t => t.id) : [0]), 0) + index + 1,
      date: transaction.date || new Date().toISOString().split('T')[0]
    }));
    
    setTransactions(prev => [...prev, ...transactionsWithIds]);
  };
  
  const handleTransactionUpdate = (updatedTransaction) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    );
  };
  
  const handleTransactionDelete = (id) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };
  
  const handleMonthChange = (month, showAll) => {
    setSelectedMonth(month);
    setShowAllMonths(showAll);
  };
    
  return (
    <div className="min-h-screen app-bg-premium">
      {/* Header */}
      <header className="bg-secondary border-b border-theme shadow-theme backdrop-blur-sm bg-opacity-90 sticky top-0 z-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-accent-color mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-primary">Finance Tracker</h1>
          </div>
          
          {/* Theme Toggle Button */}
          <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-4 pb-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Month Selection */}
            <div className="card-premium overflow-hidden">
              <MonthlyBalanceTracker 
                transactions={transactions}
                onAddCarryover={handleAddTransaction}
                onMonthChange={handleMonthChange}
                selectedMonth={selectedMonth}
                showAllMonths={showAllMonths}
              />
            </div>
            
            {/* Dashboard Section */}
            <div className="card-premium overflow-hidden">
              <div className="border-b border-theme bg-tertiary px-4 py-2">
                <h2 className="text-lg font-medium text-primary">Financial Overview</h2>
              </div>
              <div className="p-0">
                <Dashboard 
                  transactions={filteredTransactions}
                  showAllMonths={showAllMonths}
                  selectedMonth={selectedMonth}
                />
              </div>
            </div>
            
            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Transaction Entry + Bank Statement Upload */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  <div className="card-premium overflow-hidden">
                    <ManualTransactionEntry onTransactionAdd={handleAddTransaction} />
                  </div>
                  
                  <div className="card-premium overflow-hidden">
                    <BankStatementUpload onUploadSuccess={handleUploadSuccess} />
                  </div>
                </div>
              </div>
              
              {/* Middle Column - Credit Cards */}
              <div className="lg:col-span-3">
                <div className="card-premium overflow-hidden">
                  <CreditCardTracker onAddTransaction={handleAddTransaction} />
                </div>
              </div>
              
              {/* Right Column - Transactions List + Data Backup */}
              <div className="lg:col-span-6">
                <div className="space-y-6">
                  <div className="card-premium overflow-hidden">
                    <TransactionList 
                      transactions={filteredTransactions}
                      onTransactionUpdate={handleTransactionUpdate}
                      onTransactionDelete={handleTransactionDelete}
                    />
                  </div>
                  
                  <div className="card-premium overflow-hidden">
                    <DataBackupTools 
                      transactions={transactions}
                      setTransactions={setTransactions}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-secondary shadow-theme border-t border-theme backdrop-blur-sm bg-opacity-90">
        <div className="max-w-8xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-tertiary">
            Personal Finance Tracker - Your data stays private and secure
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;