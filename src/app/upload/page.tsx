"use client";
import React, { useState, useRef } from 'react';

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file change (when a user selects a file)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setMessage('');
    } else if (selectedFile) {
      setFile(null);
      setMessage('Please select a valid CSV file.');
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave' || e.type === 'drop') {
      setIsDragging(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const selectedFile = e.dataTransfer.files ? e.dataTransfer.files[0] : null;
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setMessage('');
    } else if (selectedFile) {
      setFile(null);
      setMessage('Please select a valid CSV file.');
    }
  };

  // Open file explorer when clicking on the dropzone area
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Handle form submission (file upload)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setMessage('Please select a CSV file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      setIsLoading(true);
      const response = await fetch('/api/player', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFile(null);
        setMessage('File uploaded and players data inserted successfully!');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('An error occurred while uploading the file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Upload Players CSV</h1>
        
        <div 
          className={`
            border-2 border-dashed rounded-lg 
            ${isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'} 
            ${file ? 'bg-green-50 border-green-300' : ''}
            transition-all duration-200 ease-in-out
            p-8 mb-6 cursor-pointer
          `}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            {file ? (
              <>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">{file.name}</span>
                <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                <button 
                  type="button" 
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  Change file
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {isDragging ? 'Drop the file here' : 'Drag & drop your CSV file here'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">or click to browse files</p>
                </div>
              </>
            )}
          </div>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
        </div>
        
        <div className="text-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file || isLoading}
            className={`
              px-6 py-3 rounded-md font-medium text-sm transition-all
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              ${!file || isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </div>
            ) : 'Upload CSV'}
          </button>
        </div>
        
        {message && (
          <div className={`mt-6 p-4 rounded-md text-sm ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-800' 
              : message.includes('successfully') 
                ? 'bg-green-50 text-green-800'
                : 'bg-yellow-50 text-yellow-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
