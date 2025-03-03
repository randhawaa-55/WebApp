import React, { useState } from 'react';
import axios from 'axios';
import FileUploader from '../components/FileUploader';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import './ToolPage.css';

const PDFMergePage = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFilesSelected = (selectedFiles) => {
    setFiles(selectedFiles);
    setDownloadUrl(null);
    setError(null);
  };

  const handleMergePDFs = async () => {
    if (files.length < 2) {
      setError('Please upload at least 2 PDF files to merge');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('http://localhost:5000/api/pdf/merge', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      setError('Failed to merge PDFs. Please try again or check your files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'merged.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>Merge PDF Files</h1>
        <p>Combine multiple PDF files into a single document</p>
      </div>

      <div className="tool-container">
        <div className="tool-section">
          <h2>1. Upload PDF Files</h2>
          <FileUploader
            accept={{ 'application/pdf': ['.pdf'] }}
            maxFiles={20}
            maxSize={20971520} // 20MB
            onFilesSelected={handleFilesSelected}
            title="Upload PDF Files"
            description="Drag & drop PDF files here, or click to select files"
          />
        </div>

        {files.length > 0 && (
          <div className="tool-section">
            <h2>2. Merge Files</h2>
            <p className="tool-description">
              Your files will be combined in the order shown above. You can remove files or clear the list to start over.
            </p>
            <div className="tool-actions">
              <Button 
                onClick={handleMergePDFs} 
                disabled={isProcessing || files.length < 2}
                variant="primary"
                size="large"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    Processing...
                  </>
                ) : 'Merge PDFs'}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="tool-error">
            <p>{error}</p>
          </div>
        )}

        {downloadUrl && (
          <div className="tool-section tool-result">
            <h2>3. Download Result</h2>
            <div className="success-message">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <p>Your PDFs have been merged successfully!</p>
            </div>
            <div className="tool-actions">
              <Button 
                onClick={handleDownload} 
                variant="success"
                size="large"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Merged PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFMergePage; 