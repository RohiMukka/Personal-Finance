import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import BankStatementUpload from './components/BankStatementUpload';
import TransactionList from './components/TransactionList';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    // In a real app, you would fetch data from your backend
    // For now, we'll use mock data
    const loadMockData = () => {
      const currentDate = new Date();
      const mockTransactions = [
        { 
          id: 1, 
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5).toISOString().split('T')[0], 
          description: 'Salary', 
          amount: 3000, 
          category: 'Income' 
        },
        { 
          id: 2, 
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0], 
          description: 'Rent', 
          amount: -1200, 
          category: 'Housing' 
        },
        { 
          id: 3, 
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8).toISOString().split('T')[0], 
          description: 'Grocery Store', 
          amount: -150.75, 
          category: 'Food' 
        },
        { 
          id: 4, 
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10).toISOString().split('T')[0], 
          description: 'Gas Station', 
          amount: -45.20, 
          category: 'Transportation' 
        },
        { 
          id: 5, 
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15).toISOString().split('T')[0], 
          description: 'Internet Bill', 
          amount: -65.99, 
          category: 'Utilities' 
        }
      ];

      setTransactions(mockTransactions);
      setIsLoading(false);
    };

    // Simulate API delay
    setTimeout(loadMockData, 1000);
  }, []);

  // Handle new transactions from PDF upload
  const handleUploadSuccess = (newTransactions) => {
    // In a real app, these would have IDs from the backend
    const transactionsWithIds = newTransactions.map((transaction, index) => ({
      ...transaction,
      id: Math.max(...transactions.map(t => t.id), 0) + index + 1,
      date: transaction.date || new Date().toISOString().split('T')[0]
    }));

    setTransactions(prev => [...prev, ...transactionsWithIds]);
  };

  // Handle transaction update
  const handleTransactionUpdate = (updatedTransaction) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    );
  };

  // Handle transaction delete
  const handleTransactionDelete = (id) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Personal Finance Tracker</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 text-lg">Loading your financial data...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Dashboard Section */}
              <div>
                <Dashboard />
              </div>
              
              {/* Two Column Layout for Upload and Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Upload Section */}
                <div className="lg:col-span-1">
                  <BankStatementUpload onUploadSuccess={handleUploadSuccess} />
                  
                  {/* Add Transaction Form - Future Enhancement */}
                  <div className="mt-6 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Add Transaction</h2>
                    <p className="text-sm text-gray-600">
                      This feature will be implemented in the next version. Stay tuned!
                    </p>
                  </div>
                </div>
                
                {/* Right Column - Transactions List */}
                <div className="lg:col-span-2">
                  <TransactionList 
                    transactions={transactions}
                    onTransactionUpdate={handleTransactionUpdate}
                    onTransactionDelete={handleTransactionDelete}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white shadow-inner mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Personal Finance Tracker - Your data stays private and secure
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;