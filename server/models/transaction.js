// server/models/transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  notes: String,
  isRecurring: {
    type: Boolean,
    default: false
  },
  attachment: String, // Path to an attachment if any
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual field for transaction type
transactionSchema.virtual('type').get(function() {
  return this.amount >= 0 ? 'income' : 'expense';
});

// Pre-save hook to update the 'updatedAt' field
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
transactionSchema.index({ date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ amount: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

// server/models/category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    default: 'expense'
  },
  color: {
    type: String,
    default: '#607d8b' // Default color
  },
  icon: {
    type: String,
    default: 'receipt' // Default icon
  },
  budgetLimit: {
    type: Number,
    default: 0 // 0 means no limit
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to ensure category names are unique
categorySchema.pre('save', async function(next) {
  try {
    const existingCategory = await this.constructor.findOne({ 
      name: new RegExp(`^${this.name}$`, 'i') 
    });
    
    if (existingCategory && !existingCategory._id.equals(this._id)) {
      next(new Error('Category name already exists'));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

const Category = mongoose.model('Category', categorySchema);

// Create default categories if none exist
const createDefaultCategories = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    const defaultCategories = [
      { name: 'Groceries', type: 'expense', color: '#43a047', icon: 'shopping_cart' },
      { name: 'Dining Out', type: 'expense', color: '#e53935', icon: 'restaurant' },
      { name: 'Transportation', type: 'expense', color: '#1e88e5', icon: 'directions_car' },
      { name: 'Utilities', type: 'expense', color: '#f9a825', icon: 'bolt' },
      { name: 'Housing', type: 'expense', color: '#8e24aa', icon: 'home' },
      { name: 'Entertainment', type: 'expense', color: '#f4511e', icon: 'movie' },
      { name: 'Healthcare', type: 'expense', color: '#00acc1', icon: 'local_hospital' },
      { name: 'Shopping', type: 'expense', color: '#7cb342', icon: 'shopping_bag' },
      { name: 'Personal Care', type: 'expense', color: '#d81b60', icon: 'spa' },
      { name: 'Education', type: 'expense', color: '#6d4c41', icon: 'school' },
      { name: 'Subscriptions', type: 'expense', color: '#5e35b1', icon: 'subscriptions' },
      { name: 'Salary', type: 'income', color: '#2e7d32', icon: 'account_balance' },
      { name: 'Investments', type: 'income', color: '#1565c0', icon: 'trending_up' },
      { name: 'Gifts', type: 'income', color: '#d32f2f', icon: 'card_giftcard' },
      { name: 'Uncategorized', type: 'expense', color: '#757575', icon: 'help' }
    ];
    
    await Category.insertMany(defaultCategories);
    console.log('Default categories created');
  }
};

module.exports = { Category, createDefaultCategories };

// server/models/budget.js
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  month: {
    type: Date,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one budget per category per month
budgetSchema.index({ month: 1, category: 1 }, { unique: true });

budgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;

// server/models/index.js
const mongoose = require('mongoose');
const Transaction = require('./transaction');
const { Category, createDefaultCategories } = require('./category');
const Budget = require('./budget');

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create default categories if none exist
    await createDefaultCategories();
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  Transaction,
  Category,
  Budget
};