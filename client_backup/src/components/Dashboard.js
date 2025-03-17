import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#F44336', '#3F51B5', '#4CAF50', '#FFC107'];

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call to get dashboard data
    setTimeout(() => {
      // Mock data
      setSummary({
        totalIncome: 5250.00,
        totalExpenses: 3120.75,
        netCashflow: 2129.25,
        savingsRate: 40.6,
        largestExpense: 'Housing',
        largestExpenseAmount: 1200.00,
        upcomingBills: 3
      });

      setTransactionHistory([
        { id: 1, date: '2023-03-10', description: 'Salary', amount: 3500, category: 'Income' },
        { id: 2, date: '2023-03-02', description: 'Rent Payment', amount: -1200, category: 'Housing' },
        { id: 3, date: '2023-03-05', description: 'Grocery Store', amount: -145.67, category: 'Groceries' },
        { id: 4, date: '2023-03-07', description: 'Restaurant', amount: -58.20, category: 'Dining Out' },
        { id: 5, date: '2023-03-09', description: 'Gas Station', amount: -45.00, category: 'Transportation' }
      ]);

      setCategoryBreakdown([
        { name: 'Housing', value: 1200 },
        { name: 'Groceries', value: 450 },
        { name: 'Dining Out', value: 320 },
        { name: 'Transportation', value: 275 },
        { name: 'Utilities', value: 180 },
        { name: 'Entertainment', value: 150 },
        { name: 'Other', value: 545.75 }
      ]);

      setMonthlyTrend([
        { month: 'Jan', income: 5100, expenses: 3000 },
        { month: 'Feb', income: 5200, expenses: 3050 },
        { month: 'Mar', income: 5250, expenses: 3120 }
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadResult(null);
    
    // In a real app, you would call your API here
    // For now, we'll simulate a successful upload with a timeout
    setTimeout(() => {
      setIsUploading(false);
      setUploadResult({
        success: true,
        message: 'File uploaded successfully',
        transactionsFound: 15
      });
      setSelectedFile(null);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg font-medium text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Financial Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700">Monthly Summary</h2>
          <div className="mt-2">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Income:</span>
              <span className="font-medium text-green-600">${summary.totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Expenses:</span>
              <span className="font-medium text-red-600">${Math.abs(summary.totalExpenses).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-t mt-1 pt-1">
              <span className="text-gray-800 font-medium">Net:</span>
              <span className={`font-medium ${summary.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${summary.netCashflow.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700">Savings Rate</h2>
          <div className="flex items-center justify-center h-24">
            <div className="text-4xl font-bold text-blue-600">{summary.savingsRate}%</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700">Largest Expense</h2>
          <div className="mt-2">
            <div className="text-3xl font-bold text-red-600 mb-1">${summary.largestExpenseAmount.toFixed(2)}</div>
            <div className="text-gray-600">{summary.largestExpense}</div>
          </div>
        </div>
      </div>
      
      {/* PDF Upload Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-medium text-gray-700 mb-2">Upload Bank Statement</h2>
        <div className="flex items-center">
          <input
            type="file"
            onChange={handleFileChange}
            accept="application/pdf"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={`ml-4 px-4 py-2 text-sm font-medium rounded ${
              !selectedFile || isUploading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        
        {uploadResult && (
          <div className={`mt-2 p-3 rounded text-sm ${
            uploadResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {uploadResult.message}
            {uploadResult.success && (
              <span className="block mt-1">Found {uploadResult.transactionsFound} transactions.</span>
            )}
          </div>
        )}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Income vs Expenses */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Monthly Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#4CAF50" name="Income" />
              <Bar dataKey="expenses" fill="#F44336" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Expense Breakdown */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Expense Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactionHistory.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;