import React, { useState } from 'react';

const CreditCardTracker = ({ onAddTransaction }) => {
  const [activeTab, setActiveTab] = useState('purchase');
  const [formData, setFormData] = useState({
    card: 'card1', // Default to first card
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: ''
  });
  
  // You can customize these with your actual card details
  const creditCards = [
    { id: 'card1', name: 'American Express', dueDate: 15, limit: 1000 },
    { id: 'card2', name: 'Deserve', dueDate: 22, limit: 1500 }
  ];
  
  const categories = [
    'Food',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Travel',
    'Other'
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Determine if it's a purchase or payment
    const isPurchase = activeTab === 'purchase';
    const card = creditCards.find(c => c.id === formData.card);
    
    const transaction = {
      id: Date.now(),
      date: formData.date,
      description: isPurchase 
        ? `${card.name}: ${formData.description}`
        : `Payment to ${card.name}`,
      amount: isPurchase 
        ? -Math.abs(parseFloat(formData.amount)) // Negative for purchases
        : Math.abs(parseFloat(formData.amount)), // Positive for payments
      category: isPurchase 
        ? `CC: ${formData.category}` 
        : 'Credit Card Payment',
      creditCard: formData.card
    };
    
    onAddTransaction(transaction);
    
    // Reset form but keep card selection
    setFormData(prev => ({
      ...prev,
      description: '',
      amount: '',
      category: ''
    }));
  };
  
  // Calculate days until payment due for selected card
  const getPaymentDueInfo = () => {
    const selectedCard = creditCards.find(c => c.id === formData.card);
    if (!selectedCard) return null;
    
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    // Create due date for this month
    let dueDate = new Date(thisYear, thisMonth, selectedCard.dueDate);
    
    // If due date has passed, show next month's due date
    if (today > dueDate) {
      dueDate = new Date(thisYear, thisMonth + 1, selectedCard.dueDate);
    }
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      date: dueDate.toLocaleDateString(),
      daysRemaining: diffDays
    };
  };
  
  const dueInfo = getPaymentDueInfo();
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
        <svg className="h-5 w-5 mr-2" style={{ color: 'var(--accent-color)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Credit Card Tracker
      </h2>
      
      {/* Tabs */}
      <div className="flex border-b border-theme mb-6">
        <button
          className={`py-2 px-4 font-medium transition-colors ${
            activeTab === 'purchase'
              ? 'text-accent-color border-b-2 border-accent-color'
              : 'text-secondary hover:text-primary'
          }`}
          onClick={() => setActiveTab('purchase')}
        >
          Record Purchase
        </button>
        <button
          className={`py-2 px-4 font-medium transition-colors ${
            activeTab === 'payment'
              ? 'text-accent-color border-b-2 border-accent-color'
              : 'text-secondary hover:text-primary'
          }`}
          onClick={() => setActiveTab('payment')}
        >
          Make Payment
        </button>
      </div>
      
      {/* Card selection and payment due info */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Select Credit Card
            </label>
            <select
              name="card"
              value={formData.card}
              onChange={handleChange}
              className="input-premium"
            >
              {creditCards.map(card => (
                <option key={card.id} value={card.id}>{card.name}</option>
              ))}
            </select>
          </div>
          
          {dueInfo && (
            <div className="text-right">
              <p className="text-sm text-secondary">Payment due: {dueInfo.date}</p>
              <p className={`text-sm font-medium ${
                dueInfo.daysRemaining <= 7 ? 'text-expense' : 'text-primary'
              }`}>
                {dueInfo.daysRemaining} days remaining
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit}>
        {activeTab === 'purchase' && (
          <>
            <div className="mb-4">
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
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="What did you purchase?"
                className="w-full input-premium"
              />
            </div>
            
            <div className="mb-4">
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
          </>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary mb-1">
            {activeTab === 'purchase' ? 'Amount' : 'Payment Amount'}
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
              min="0"
              placeholder="  0.00"
              className="w-full pl-7 input-premium"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full btn-premium accent-glow py-2 text-sm font-medium"
        >
          {activeTab === 'purchase' ? 'Add Purchase' : 'Record Payment'}
        </button>
      </form>
    </div>
  );
};

export default CreditCardTracker;