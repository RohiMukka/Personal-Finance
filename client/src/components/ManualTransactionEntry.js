import React, { useState } from 'react';

const ManualTransactionEntry = ({ onTransactionAdd }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: '',
    isExpense: true
  });

  const categories = [
    'Income',
    'Housing',
    'Transportation',
    'Food',
    'Utilities',
    'Insurance',
    'Healthcare',
    'Remittance', // For sending money home
    'SoFi Loan', // For SoFi loan payments
    'Credit Card', // For credit card debt payments
    'Saving',
    'Personal',
    'Entertainment',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate amount is a number
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than zero');
      return;
    }
    
    // Create new transaction object
    const newTransaction = {
      id: Date.now(), // temporary ID, would be replaced by database ID
      date: formData.date,
      description: formData.description,
      amount: formData.isExpense 
        ? -Math.abs(amount) 
        : Math.abs(amount),
      category: formData.category
    };
    
    // Pass to parent component
    if (onTransactionAdd) {
      onTransactionAdd(newTransaction);
    }
    
    // Reset form except for date and isExpense
    setFormData(prev => ({
      ...prev,
      description: '',
      amount: '',
      category: ''
    }));
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-semibold text-primary mb-4">Add Transaction</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full input-premium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full input-premium"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-secondary mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="e.g., Grocery shopping, Rent payment"
              className="w-full input-premium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-secondary sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                step="0.01"
                min="0.01"
                placeholder="  0.00"
                className="w-full pl-7 input-premium"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                name="isExpense"
                checked={formData.isExpense}
                onChange={handleChange}
                className="h-4 w-4 rounded border-theme accent-color"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-primary">This is an expense</label>
              <p className="text-tertiary">Uncheck for income, refunds, or received remittances</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full btn-premium accent-glow py-2 text-sm font-medium"
          >
            Add Transaction
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualTransactionEntry;