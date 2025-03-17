import React, { useState } from 'react';

const BankStatementUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setUploadStatus(null);
    } else {
      setFile(null);
      setUploadStatus({
        success: false,
        message: 'Please select a valid PDF file.'
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('pdfFile', file);

    try {
      // For development/testing - simulate upload with setTimeout
      // In production, replace this with a real API call
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 300);

      // Simulate API call - replace with real fetch in production
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        
        // Simulate successful response
        const data = {
          success: true,
          message: 'Bank statement processed successfully',
          transactions: [
            { date: '2023-03-01', description: 'GROCERY STORE', amount: -75.42 },
            { date: '2023-03-03', description: 'SALARY DEPOSIT', amount: 2500.00 },
            { date: '2023-03-05', description: 'INTERNET BILL', amount: -89.99 }
          ]
        };

        setUploadStatus({
          success: true,
          message: data.message,
          transactions: data.transactions
        });

        if (onUploadSuccess && typeof onUploadSuccess === 'function') {
          onUploadSuccess(data.transactions);
        }

        setIsUploading(false);
        setFile(null);
      }, 3000); 

      // Real API implementation would look like this:
      
      /*const response = await fetch('http://localhost:5001/api/upload/bank-statement', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const data = await response.json();
      
      setUploadStatus({
        success: true,
        message: data.message,
        transactions: data.transactions
      });

      if (onUploadSuccess && typeof onUploadSuccess === 'function') {
        onUploadSuccess(data.transactions);
      }
      
      setIsUploading(false);
      setFile(null);
    */
    } catch (error) {
      setUploadStatus({
        success: false,
        message: error.message || 'Failed to upload the file'
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <svg className="h-5 w-5 mr-2" style={{ color: 'var(--accent-color)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <h2 className="text-xl font-semibold text-primary">Upload Bank Statement</h2>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-secondary mb-2">
          Select a PDF bank statement
        </label>
        <div className="relative border-2 border-dashed border-theme rounded-lg p-6 transition-colors hover:border-accent-color">
          <input
            type="file"
            onChange={handleFileChange}
            accept="application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <div className="text-center">
            <svg className="mx-auto h-10 w-10 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-1 text-sm text-secondary">
              {file ? file.name : 'Drag your PDF here or click to browse'}
            </p>
            <p className="mt-1 text-xs text-tertiary">
              Upload your bank statement in PDF format
            </p>
          </div>
        </div>
      </div>

      {file && (
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-primary">{file.name}</span>
          <span className="ml-2 text-sm text-tertiary">({(file.size / 1024).toFixed(2)} KB)</span>
        </div>
      )}

      {isUploading && (
        <div className="mb-4">
          <div className="w-full bg-tertiary rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${progress}%`,
                background: `linear-gradient(90deg, var(--accent-color), var(--accent-hover))`
              }}
            ></div>
          </div>
          <p className="mt-1 text-sm text-secondary">Processing... {progress}%</p>
        </div>
      )}

      {uploadStatus && (
        <div className={`p-4 mb-4 rounded-lg ${
          uploadStatus.success 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex">
            {uploadStatus.success ? (
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <div>
              <p className="font-medium">{uploadStatus.message}</p>
              {uploadStatus.success && uploadStatus.transactions && (
                <p className="mt-1">Found {uploadStatus.transactions.length} transactions</p>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`w-full py-2 px-4 rounded-md font-medium text-white transition-all ${
          !file || isUploading
            ? 'bg-tertiary text-tertiary cursor-not-allowed'
            : 'btn-premium accent-glow'
        }`}
      >
        {isUploading ? 'Processing...' : 'Upload & Process Statement'}
      </button>
    </div>
  );
};

export default BankStatementUpload;

/*import React, { useState } from 'react';

const BankStatementUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setUploadStatus(null);
    } else {
      setFile(null);
      setUploadStatus({
        success: false,
        message: 'Please select a valid PDF file.'
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('pdfFile', file);

    try {
      // For development/testing - simulate upload with setTimeout
      // In production, replace this with a real API call
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 300);

      // Simulate API call - replace with real fetch in production
      //setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        
        // Simulate successful response
        const data = {
          success: true,
          message: 'Bank statement processed successfully',
          transactions: [
            { date: '2023-03-01', description: 'GROCERY STORE', amount: -75.42 },
            { date: '2023-03-03', description: 'SALARY DEPOSIT', amount: 2500.00 },
            { date: '2023-03-05', description: 'INTERNET BILL', amount: -89.99 }
          ]
        };

        setUploadStatus({
          success: true,
          message: data.message,
          transactions: data.transactions
        });

        if (onUploadSuccess && typeof onUploadSuccess === 'function') {
          onUploadSuccess(data.transactions);
        }

        setIsUploading(false);
        setFile(null);
      // }, 3000); 

      // Real API implementation would look like this:
      
      const response = await fetch('http://localhost:5001/api/upload/bank-statement', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const data = await response.json();
      
      setUploadStatus({
        success: true,
        message: data.message,
        transactions: data.transactions
      });

      if (onUploadSuccess && typeof onUploadSuccess === 'function') {
        onUploadSuccess(data.transactions);
      }
      
      setIsUploading(false);
      setFile(null);
      
    } catch (error) {
      setUploadStatus({
        success: false,
        message: error.message || 'Failed to upload the file'
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Bank Statement</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a PDF bank statement
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          accept="application/pdf"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={isUploading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Upload your bank statement in PDF format. We'll extract transactions automatically.
        </p>
      </div>

      {file && (
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-gray-700">{file.name}</span>
          <span className="ml-2 text-sm text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
        </div>
      )}

      {isUploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-1 text-sm text-gray-600">Processing... {progress}%</p>
        </div>
      )}

      {uploadStatus && (
        <div className={`p-3 mb-4 rounded ${
          uploadStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex">
            {uploadStatus.success ? (
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <div>
              <p className="font-medium">{uploadStatus.message}</p>
              {uploadStatus.success && uploadStatus.transactions && (
                <p className="mt-1">Found {uploadStatus.transactions.length} transactions</p>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`w-full py-2 px-4 rounded font-medium text-white ${
          !file || isUploading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUploading ? 'Processing...' : 'Upload & Process Statement'}
      </button>
    </div>
  );
};

export default BankStatementUpload;*/

// import React, { useState } from 'react';

// const BankStatementUpload = ({ onUploadSuccess }) => {
//   const [file, setFile] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState(null);
//   const [progress, setProgress] = useState(0);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile && selectedFile.type === 'application/pdf') {
//       setFile(selectedFile);
//       setUploadStatus(null);
//     } else {
//       setFile(null);
//       setUploadStatus({
//         success: false,
//         message: 'Please select a valid PDF file.'
//       });
//     }
//   };

//   const handleUpload = async () => {
//     if (!file) return;

//     setIsUploading(true);
//     setProgress(0);
//     setUploadStatus(null);

//     const formData = new FormData();
//     formData.append('pdfFile', file);

//     try {
//       // Simulate upload progress
//       const progressInterval = setInterval(() => {
//         setProgress(prev => {
//           const newProgress = prev + 10;
//           if (newProgress >= 100) {
//             clearInterval(progressInterval);
//             return 100;
//           }
//           return newProgress;
//         });
//       }, 300);

//       // In a real implementation, we would use fetch to send the file to our backend
//       /*
//       const response = await fetch('/api/upload/bank-statement', {
//         method: 'POST',
//         body: formData
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to upload file');
//       }
      
//       const data = await response.json();
//       */
      
//       // For demonstration, we'll simulate the API response
//       setTimeout(() => {
//         clearInterval(progressInterval);
//         setProgress(100);
        
//         // Simulate successful response
//         const data = {
//           success: true,
//           message: 'Bank statement processed successfully',
//           transactions: [
//             { date: '2023-03-01', description: 'GROCERY STORE', amount: -75.42 },
//             { date: '2023-03-03', description: 'SALARY DEPOSIT', amount: 2500.00 },
//             { date: '2023-03-05', description: 'INTERNET BILL', amount: -89.99 }
//           ]
//         };

//         setUploadStatus({
//           success: true,
//           message: data.message,
//           transactions: data.transactions
//         });

//         if (onUploadSuccess && typeof onUploadSuccess === 'function') {
//           onUploadSuccess(data.transactions);
//         }

//         setIsUploading(false);
//         setFile(null);
//       }, 3000);
//     } catch (error) {
//       setUploadStatus({
//         success: false,
//         message: error.message || 'Failed to upload the file'
//       });
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow">
//       <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Bank Statement</h2>
      
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Select a PDF bank statement
//         </label>
//         <input
//           type="file"
//           onChange={handleFileChange}
//           accept="application/pdf"
//           className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//           disabled={isUploading}
//         />
//         <p className="mt-1 text-sm text-gray-500">
//           Upload your bank statement in PDF format. We'll extract transactions automatically.
//         </p>
//       </div>

//       {file && (
//         <div className="flex items-center mb-4">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
//           </svg>
//           <span className="text-sm font-medium text-gray-700">{file.name}</span>
//           <span className="ml-2 text-sm text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
//         </div>
//       )}

//       {isUploading && (
//         <div className="mb-4">
//           <div className="w-full bg-gray-200 rounded-full h-2.5">
//             <div 
//               className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
//               style={{ width: `${progress}%` }}
//             ></div>
//           </div>
//           <p className="mt-1 text-sm text-gray-600">Processing... {progress}%</p>
//         </div>
//       )}

//       {uploadStatus && (
//         <div className={`p-3 mb-4 rounded ${
//           uploadStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
//         }`}>
//           <div className="flex">
//             {uploadStatus.success ? (
//               <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//               </svg>
//             ) : (
//               <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//               </svg>
//             )}
//             <div>
//               <p className="font-medium">{uploadStatus.message}</p>
//               {uploadStatus.success && uploadStatus.transactions && (
//                 <p className="mt-1">Found {uploadStatus.transactions.length} transactions</p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       <button
//         onClick={handleUpload}
//         disabled={!file || isUploading}
//         className={`w-full py-2 px-4 rounded font-medium text-white ${
//           !file || isUploading
//             ? 'bg-gray-300 cursor-not-allowed'
//             : 'bg-blue-600 hover:bg-blue-700'
//         }`}
//       >
//         {isUploading ? 'Processing...' : 'Upload & Process Statement'}
//       </button>
//     </div>
//   );
// };

// export default BankStatementUpload;