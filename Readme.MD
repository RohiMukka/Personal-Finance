# Personal Finance Tracker

A self-hosted web application to track and manage your personal finances, featuring PDF bank statement parsing, transaction management, and financial insights.

## Features

- **Dashboard**: Visualize your financial health with graphs and summary statistics
- **Bank Statement Parsing**: Upload PDF bank statements and automatically extract transactions
- **Transaction Management**: Add, edit, categorize, filter, and search transactions
- **Financial Analysis**: Track spending patterns, budgets, and savings goals
- **Privacy-First**: All your data stays on your own device/server

## Tech Stack

- **Frontend**: React, TailwindCSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **PDF Processing**: pdf-parse

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/RohiMukka/Personal-Finance.git
cd Personal-Finance
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
MONGODB_URI=mongodb://localhost:27017/finance-tracker
PORT=5000
```

4. Start the development server
```bash
npm run dev
```

This will start both the backend server and the frontend development server concurrently.

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Deployment

1. Build the frontend
```bash
npm run build
```

2. Start the production server
```bash
npm run server
```

The application will be served at http://localhost:5000

## PDF Bank Statement Parsing

The application can parse PDF bank statements to extract transactions. The current implementation needs to be customized for your specific bank's statement format:

1. Examine your bank's PDF statement structure
2. Modify the `server/services/pdfParser.js` file to match your bank's format
3. Test with sample statements to ensure accurate extraction

## Future Enhancements

- **Bank API Integration**: Direct connection to banks via Plaid or similar services
- **Budgeting Tools**: Set and track budgets for different categories
- **Investment Tracking**: Monitor investment portfolio performance
- **Financial Goals**: Set and track savings goals
- **Data Export**: Export financial data in various formats (CSV, Excel)
- **Mobile App**: Native mobile application for on-the-go tracking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.