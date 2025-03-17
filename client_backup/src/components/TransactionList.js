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

  // List of available categories (would come from your backend in a real app)
  const categories = [
    'Income',
    'Housing',
    'Transportation',
    'Food',
    'Utilities',
    'Insurance',
    'Healthcare',
    'Saving',
    'Personal',
    'Entertainment',
    'Other'
  ];

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
      const startDate = new Date(dateRange.start);
      result = result.filter(transaction => 
        new Date(transaction.date) >= startDate
      );
    }
    
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of the day
      result = result.filter(transaction => 
        new Date(transaction.date) <= endDate
      );
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
      date: editFormData.date,
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

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Transactions</h2>
        
        {/* Search and Filter Controls */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              id="search"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dateStart" className="block text-sm font-medium text-gray-700">From Date</label>
            <input
              type="date"
              id="dateStart"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          
          <div>
            <label htmlFor="dateEnd" className="block text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              id="dateEnd"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('date')}
              >
                Date
                {sortConfig.key === 'date' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('description')}
              >
                Description
                {sortConfig.key === 'description' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('category')}
              >
                Category
                {sortConfig.key === 'category' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('amount')}
              >
                Amount
                {sortConfig.key === 'amount' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  {editingId === transaction.id ? (
                    // Edit form row
                    <td colSpan="5" className="px-6 py-4">
                      <form onSubmit={handleEditFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                              type="date"
                              name="date"
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                              value={editFormData.date}
                              onChange={handleEditFormChange}
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <input
                              type="text"
                              name="description"
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                              value={editFormData.description}
                              onChange={handleEditFormChange}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                              name="category"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                              value={editFormData.category}
                              onChange={handleEditFormChange}
                            >
                              <option value="">Select a category</option>
                              {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <div className="mt-1 flex items-center">
                              <input
                                type="number"
                                name="amount"
                                step="0.01"
                                required
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                value={editFormData.amount}
                                onChange={handleEditFormChange}
                              />
                              <div className="ml-2">
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    name="isExpense"
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    checked={editFormData.isExpense}
                                    onChange={handleEditFormChange}
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Expense</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    // Regular row
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.category || 'Uncategorized'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEditClick(transaction)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
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
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex justify-between text-sm">
          <div>
            <span className="font-medium text-gray-700">Total Income:</span>
            <span className="ml-2 text-green-600 font-medium">
              {formatCurrency(
                filteredTransactions
                  .filter(t => t.amount > 0)
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Total Expenses:</span>
            <span className="ml-2 text-red-600 font-medium">
              {formatCurrency(
                filteredTransactions
                  .filter(t => t.amount < 0)
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
              )}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Net:</span>
            <span className={`ml-2 font-medium ${
              filteredTransactions.reduce((sum, t) => sum + t.amount, 0) >= 0
                ? 'text-green-600'
                : 'text-red-600'
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