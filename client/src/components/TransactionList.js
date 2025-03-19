import React, { useState, useEffect } from 'react';

const TransactionList = ({ transactions = [], onTransactionUpdate, onTransactionDelete }) => {
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    date: '',
    description: '',
    amount: 0,
    category: ''
  });

  // Get unique categories from transactions
  const getCategories = () => {
    const categories = new Set();
    transactions.forEach(transaction => {
      if (transaction.category) {
        categories.add(transaction.category);
      }
    });
    return ['all', ...Array.from(categories).sort()];
  };

  // Initialize filtered transactions when the transactions prop changes
  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, categoryFilter, dateRange, sortConfig]);

  // Apply all filters and sorting
  const applyFilters = () => {
    let result = [...transactions];

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        transaction => 
          transaction.description.toLowerCase().includes(lowerCaseSearch) ||
          (transaction.category && transaction.category.toLowerCase().includes(lowerCaseSearch))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(transaction => 
        transaction.category === categoryFilter
      );
    }

    // Apply date range filter
    if (dateRange.start) {
      // Parse the date string to ensure consistent comparison
      const [year, month, day] = dateRange.start.split('-').map(num => parseInt(num, 10));
      const startDate = new Date(year, month - 1, day);
      
      result = result.filter(transaction => {
        const [tYear, tMonth, tDay] = transaction.date.split('-').map(num => parseInt(num, 10));
        const transDate = new Date(tYear, tMonth - 1, tDay);
        return transDate >= startDate;
      });
    }
    
    if (dateRange.end) {
      // Parse the date string and set to end of day
      const [year, month, day] = dateRange.end.split('-').map(num => parseInt(num, 10));
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      
      result = result.filter(transaction => {
        const [tYear, tMonth, tDay] = transaction.date.split('-').map(num => parseInt(num, 10));
        const transDate = new Date(tYear, tMonth - 1, tDay);
        return transDate <= endDate;
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredTransactions(result);
  };

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle edit start
  const handleEditClick = (transaction) => {
    setEditingId(transaction.id);
    setEditFormData({
      date: transaction.date,
      description: transaction.description,
      amount: Math.abs(transaction.amount),
      category: transaction.category || '',
      isExpense: transaction.amount < 0
    });
  };

  // Handle edit form changes
  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleEditFormSubmit = (e) => {
    e.preventDefault();
    
    const updatedTransaction = {
      id: editingId,
      date: editFormData.date, // Keep date as YYYY-MM-DD string
      description: editFormData.description,
      amount: editFormData.isExpense ? -Math.abs(parseFloat(editFormData.amount)) : Math.abs(parseFloat(editFormData.amount)),
      category: editFormData.category
    };
    
    if (onTransactionUpdate) {
      onTransactionUpdate(updatedTransaction);
    }
    
    setEditingId(null);
  };

  // Handle delete
  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      if (onTransactionDelete) {
        onTransactionDelete(id);
      }
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  // Format date - using a safe approach to avoid timezone issues
  const formatDate = (dateString) => {
    // Parse the YYYY-MM-DD string directly
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    
    // Create a new date using local time constructor
    const date = new Date(year, month - 1, day);
    
    // Format with browser's locale settings
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="p-4 border-b border-theme">
        <h2 className="text-lg font-medium text-primary">Transactions</h2>
        
        {/* Search and Filter Controls */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-secondary">Search</label>
            <input
              type="text"
              id="search"
              className="mt-1 block w-full input-premium"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-secondary">Category</label>
            <select
              id="category"
              className="mt-1 block w-full input-premium"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {getCategories().map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dateStart" className="block text-sm font-medium text-secondary">From Date</label>
            <input
              type="date"
              id="dateStart"
              className="mt-1 block w-full input-premium"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          
          <div>
            <label htmlFor="dateEnd" className="block text-sm font-medium text-secondary">To Date</label>
            <input
              type="date"
              id="dateEnd"
              className="mt-1 block w-full input-premium"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </div>
      
            {/* Transaction Summary */}
            <div className="px-6 py-4 bg-tertiary border-t border-theme">
        <div className="flex flex-wrap justify-between text-sm gap-4">
          <div>
            <span className="font-medium text-secondary">Total Income:</span>
            <span className="ml-2 text-income font-medium">
              {formatCurrency(
                filteredTransactions
                  .filter(t => t.amount > 0)
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </span>
          </div>
          <div>
            <span className="font-medium text-secondary">Total Expenses:</span>
            <span className="ml-2 text-expense font-medium">
              {formatCurrency(
                filteredTransactions
                  .filter(t => t.amount < 0)
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
              )}
            </span>
          </div>
          <div>
            <span className="font-medium text-secondary">Net:</span>
            <span className={`ml-2 font-medium ${
              filteredTransactions.reduce((sum, t) => sum + t.amount, 0) >= 0
                ? 'text-income'
                : 'text-expense'
            }`}>
              {formatCurrency(
                filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[200px]">
        <table className="table-premium">
          <thead className="sticky top-0 bg-tertiary z-10">
            <tr>
              <th 
                className="cursor-pointer"
                onClick={() => requestSort('date')}
              >
                <div className="flex items-center">
                  <span>Date</span>
                  {sortConfig.key === 'date' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="cursor-pointer"
                onClick={() => requestSort('description')}
              >
                <div className="flex items-center">
                  <span>Description</span>
                  {sortConfig.key === 'description' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="cursor-pointer"
                onClick={() => requestSort('category')}
              >
                <div className="flex items-center">
                  <span>Category</span>
                  {sortConfig.key === 'category' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="text-right cursor-pointer"
                onClick={() => requestSort('amount')}
              >
                <div className="flex items-center justify-end">
                  <span>Amount</span>
                  {sortConfig.key === 'amount' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-tertiary">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  {editingId === transaction.id ? (
                    // Edit form row
                    <td colSpan="5">
                      <form onSubmit={handleEditFormSubmit} className="space-y-4 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-secondary">Date</label>
                            <input
                              type="date"
                              name="date"
                              required
                              className="mt-1 block w-full input-premium"
                              value={editFormData.date}
                              onChange={handleEditFormChange}
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-secondary">Description</label>
                            <input
                              type="text"
                              name="description"
                              required
                              className="mt-1 block w-full input-premium"
                              value={editFormData.description}
                              onChange={handleEditFormChange}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-secondary">Category</label>
                            <select
                              name="category"
                              className="mt-1 block w-full input-premium"
                              value={editFormData.category}
                              onChange={handleEditFormChange}
                            >
                              <option value="">Select a category</option>
                              {getCategories().filter(c => c !== 'all').map((category) => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-secondary">Amount</label>
                            <div className="mt-1 flex items-center">
                              <input
                                type="number"
                                name="amount"
                                step="0.01"
                                required
                                className="block w-full input-premium"
                                value={editFormData.amount}
                                onChange={handleEditFormChange}
                              />
                              <div className="ml-2">
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    name="isExpense"
                                    className="rounded border-theme accent-color"
                                    checked={editFormData.isExpense}
                                    onChange={handleEditFormChange}
                                  />
                                  <span className="ml-2 text-sm text-secondary">Expense</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            className="px-3 py-1 text-sm font-medium text-primary bg-tertiary rounded-md hover:bg-opacity-80 transition-all"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn-premium px-3 py-1 text-sm"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    // Regular row
                    <>
                      <td className="text-secondary">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="text-primary truncate max-w-xs">
                        {transaction.description}
                      </td>
                      <td className="text-secondary">
                        {transaction.category || 'Uncategorized'}
                      </td>
                      <td className={`font-medium text-right ${
                        transaction.amount >= 0 ? 'text-income' : 'text-expense'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={() => handleEditClick(transaction)}
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(transaction.id)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Transaction Summary */}
      <div className="px-6 py-4 bg-tertiary border-t border-theme">
        <div className="flex flex-wrap justify-between text-sm gap-4">
          <div>
            <span className="font-medium text-secondary">Total Income:</span>
            <span className="ml-2 text-income font-medium">
              {formatCurrency(
                filteredTransactions
                  .filter(t => t.amount > 0)
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </span>
          </div>
          <div>
            <span className="font-medium text-secondary">Total Expenses:</span>
            <span className="ml-2 text-expense font-medium">
              {formatCurrency(
                filteredTransactions
                  .filter(t => t.amount < 0)
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
              )}
            </span>
          </div>
          <div>
            <span className="font-medium text-secondary">Net:</span>
            <span className={`ml-2 font-medium ${
              filteredTransactions.reduce((sum, t) => sum + t.amount, 0) >= 0
                ? 'text-income'
                : 'text-expense'
            }`}>
              {formatCurrency(
                filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;