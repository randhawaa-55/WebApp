import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import apiClient from '../api/client';
import './ToolPage.css';

const ImageToPdfPage = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFilesSelected = (selectedFiles) => {
    setFiles(selectedFiles);
    setDownloadUrl(null);
    setError(null);
  };

  const handleConvertToPdf = async () => {
    if (files.length === 0) {
      setError('Please upload at least one image file');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await apiClient.post('/api/image/image-to-pdf', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      setError('Failed to convert images to PDF. Please try again or check your files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'images-to-pdf.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>Convert Images to PDF</h1>
        <p>Create a PDF document from one or more images</p>
      </div>

      <div className="tool-container">
        <div className="tool-section">
          <h2>1. Upload Images</h2>
          <FileUploader
            accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] }}
            maxFiles={20}
            maxSize={20971520} // 20MB
            onFilesSelected={handleFilesSelected}
            title="Upload Images"
            description="Drag & drop images here, or click to select files"
          />
        </div>

        {files.length > 0 && (
          <div className="tool-section">
            <h2>2. Convert to PDF</h2>
            <p className="tool-description">
              Your images will be combined into a single PDF document in the order shown above.
            </p>
            <div className="tool-actions">
              <Button 
                onClick={handleConvertToPdf} 
                disabled={isProcessing || files.length === 0}
                variant="primary"
                size="large"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    Processing...
                  </>
                ) : 'Convert to PDF'}
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
              <p>Your images have been converted to PDF successfully!</p>
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
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageToPdfPage; 