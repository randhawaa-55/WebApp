import React, { useState } from 'react';
import axios from 'axios';
import FileUploader from '../components/FileUploader';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import './ToolPage.css';

const PDFSplitPage = () => {
  const [file, setFile] = useState(null);
  const [splitType, setSplitType] = useState('range');
  const [pageRanges, setPageRanges] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelected = (selectedFiles) => {
    setFile(selectedFiles.length > 0 ? selectedFiles[0] : null);
    setDownloadUrl(null);
    setError(null);
  };

  const handleSplitTypeChange = (e) => {
    setSplitType(e.target.value);
  };

  const handlePageRangesChange = (e) => {
    setPageRanges(e.target.value);
  };

  const handleSplitPDF = async () => {
    if (!file) {
      setError('Please upload a PDF file to split');
      return;
    }

    if (splitType === 'range' && !pageRanges.trim()) {
      setError('Please enter page ranges (e.g., "1-3,5,7-10")');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('splitType', splitType);
    
    if (splitType === 'range') {
      formData.append('pageRanges', pageRanges);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/pdf/split', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      setError('Failed to split PDF. Please try again or check your file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'split-pdf.zip');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>Split PDF</h1>
        <p>Extract pages or split a PDF into multiple files</p>
      </div>

      <div className="tool-container">
        <div className="tool-section">
          <h2>1. Upload PDF File</h2>
          <FileUploader
            accept={{ 'application/pdf': ['.pdf'] }}
            maxFiles={1}
            maxSize={20971520} // 20MB
            onFilesSelected={handleFileSelected}
            title="Upload PDF File"
            description="Drag & drop a PDF file here, or click to select a file"
          />
        </div>

        {file && (
          <div className="tool-section">
            <h2>2. Split Options</h2>
            <div className="split-options">
              <div className="radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="split-all"
                    name="splitType"
                    value="all"
                    checked={splitType === 'all'}
                    onChange={handleSplitTypeChange}
                  />
                  <label htmlFor="split-all">Split all pages (one PDF per page)</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="split-range"
                    name="splitType"
                    value="range"
                    checked={splitType === 'range'}
                    onChange={handleSplitTypeChange}
                  />
                  <label htmlFor="split-range">Extract specific pages or ranges</label>
                </div>
              </div>

              {splitType === 'range' && (
                <div className="page-ranges">
                  <label htmlFor="page-ranges-input">Page Ranges:</label>
                  <input
                    id="page-ranges-input"
                    type="text"
                    value={pageRanges}
                    onChange={handlePageRangesChange}
                    placeholder="e.g., 1-3,5,7-10"
                    className="page-ranges-input"
                  />
                  <p className="setting-description">
                    Specify page numbers and/or ranges separated by commas (e.g., "1-3,5,7-10")
                  </p>
                </div>
              )}
            </div>
            <div className="tool-actions">
              <Button 
                onClick={handleSplitPDF} 
                disabled={isProcessing || !file || (splitType === 'range' && !pageRanges.trim())}
                variant="primary"
                size="large"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    Processing...
                  </>
                ) : 'Split PDF'}
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
              <p>Your PDF has been split successfully!</p>
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
                Download Split PDF Files
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFSplitPage; 