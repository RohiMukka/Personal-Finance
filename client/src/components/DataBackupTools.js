import React, { useState, useRef } from 'react';

const DataBackupTools = ({ transactions, setTransactions }) => {
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Export all transaction data as a JSON file
  const handleExport = () => {
    try {
      // Create JSON data
      const data = JSON.stringify(transactions, null, 2); // Pretty print with 2 spaces
      
      // Create a blob and download link
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success message
      setImportStatus({
        success: true,
        message: 'Data exported successfully!'
      });
      
      // Clear status after 3 seconds
      setTimeout(() => setImportStatus(null), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setImportStatus({
        success: false,
        message: `Error exporting data: ${error.message}`
      });
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection and import
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Validate the imported data
        if (!Array.isArray(importedData)) {
          throw new Error('Invalid data format. Expected an array of transactions.');
        }
        
        // Check if each item has required fields
        const isValid = importedData.every(item => 
          typeof item === 'object' && 
          item !== null &&
          'id' in item && 
          'date' in item && 
          'description' in item && 
          'amount' in item
        );
        
        if (!isValid) {
          throw new Error('Invalid transaction data. Some required fields are missing.');
        }
        
        // Update transactions
        setTransactions(importedData);
        
        // Show success message
        setImportStatus({
          success: true,
          message: `Successfully imported ${importedData.length} transactions!`
        });
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Import error:', error);
        setImportStatus({
          success: false,
          message: `Error importing data: ${error.message}`
        });
      }
    };
    
    reader.onerror = () => {
      setImportStatus({
        success: false,
        message: 'Error reading file'
      });
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" style={{ color: 'var(--accent-color)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        <h2 className="text-xl font-semibold text-primary">Backup & Restore</h2>
      </div>
      
      <p className="mb-4 text-secondary">
        Your financial data is stored locally in your browser. To prevent data loss, export your data regularly and keep the file in a safe place.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <button
            onClick={handleExport}
            className="w-full btn-premium py-2 text-sm font-medium"
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Data
            </span>
          </button>
        </div>
        
        <div>
          <button
            onClick={triggerFileInput}
            className="w-full btn-premium py-2 text-sm font-medium"
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Data
            </span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>
      
      {importStatus && (
        <div className={`p-4 rounded-lg ${
          importStatus.success 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex">
            {importStatus.success ? (
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <p>{importStatus.message}</p>
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 border border-theme rounded-lg bg-tertiary">
        <h3 className="text-primary font-medium mb-2">Important Notes:</h3>
        <ul className="list-disc pl-5 text-secondary text-sm space-y-1">
          <li>Your data is stored in your browser's local storage only.</li>
          <li>If you clear browser data or switch browsers, your financial data will be lost.</li>
          <li>Export your data regularly as a backup.</li>
          <li>The exported file contains all your financial information - keep it secure.</li>
        </ul>
      </div>
    </div>
  );
};

export default DataBackupTools;