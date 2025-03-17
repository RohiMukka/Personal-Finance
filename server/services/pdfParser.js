// server/services/pdfParser.js
const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Service to extract transaction data from PDF bank statements
 */
class PDFParserService {
  /**
   * Extract transactions from a PDF bank statement
   * 
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<Array>} - Array of extracted transactions
   */
  async extractTransactionsFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      // Parse the text content - this will need to be customized based on your bank's PDF format
      return this.parseTransactions(data.text);
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to extract data from PDF');
    }
  }

  /**
   * Parse raw text from PDF into structured transaction data
   * This implementation needs to be customized for specific bank statement formats
   * 
   * @param {string} text - Raw text from PDF
   * @returns {Array} - Array of transaction objects
   */
  parseTransactions(text) {
    const transactions = [];
    
    // Split text into lines
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Example pattern matching for transactions
    // This is a simplified example - you'll need to customize this based on your bank's format
    let inTransactionSection = false;
    
    for (const line of lines) {
      // Detect start of transaction section (customize based on your statement format)
      if (line.includes('TRANSACTION HISTORY') || line.includes('ACCOUNT ACTIVITY')) {
        inTransactionSection = true;
        continue;
      }
      
      // Detect end of transaction section
      if (inTransactionSection && (line.includes('SUMMARY') || line.includes('BALANCE'))) {
        inTransactionSection = false;
        continue;
      }
      
      // Process transaction lines
      if (inTransactionSection) {
        // Look for patterns like date followed by description and amount
        // This regex tries to match date patterns, but will need customization
        const dateRegex = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/;
        const amountRegex = /[-+]?\$?\s*[\d,]+\.\d{2}/;
        
        const dateMatch = line.match(dateRegex);
        const amountMatch = line.match(amountRegex);
        
        if (dateMatch && amountMatch) {
          // Extract and clean description (text between date and amount)
          let description = line
            .substring(
              dateMatch.index + dateMatch[0].length,
              amountMatch.index
            )
            .trim()
            .replace(/\s+/g, ' ');
            
          // Clean and convert amount to number
          let amount = amountMatch[0]
            .replace(/[\$,\s]/g, '')
            .trim();
            
          // Determine transaction type (debit/credit)
          const isDebit = amount.includes('-') || line.includes('DEBIT') || line.includes('WITHDRAWAL');
          amount = parseFloat(amount.replace('-', ''));
          
          transactions.push({
            date: dateMatch[0],
            description: description,
            amount: isDebit ? -Math.abs(amount) : Math.abs(amount),
            category: this.suggestCategory(description)
          });
        }
      }
    }
    
    return transactions;
  }
  
  /**
   * Suggest a category based on transaction description
   * This is a simple implementation - could be replaced with ML-based categorization
   * 
   * @param {string} description - Transaction description
   * @returns {string} - Suggested category
   */
  suggestCategory(description) {
    description = description.toLowerCase();
    
    // Simple keyword matching
    if (description.includes('grocery') || description.includes('market') || 
        description.includes('food') || description.includes('supermarket')) {
      return 'Groceries';
    }
    
    if (description.includes('restaurant') || description.includes('cafe') || 
        description.includes('bar') || description.includes('dining')) {
      return 'Dining Out';
    }
    
    if (description.includes('amazon') || description.includes('walmart') || 
        description.includes('target') || description.includes('shop')) {
      return 'Shopping';
    }
    
    if (description.includes('uber') || description.includes('lyft') || 
        description.includes('transit') || description.includes('transport')) {
      return 'Transportation';
    }
    
    if (description.includes('netflix') || description.includes('spotify') || 
        description.includes('subscription') || description.includes('monthly')) {
      return 'Subscriptions';
    }
    
    if (description.includes('salary') || description.includes('payroll') || 
        description.includes('deposit') || description.includes('income')) {
      return 'Income';
    }
    
    return 'Uncategorized';
  }
}

module.exports = new PDFParserService();