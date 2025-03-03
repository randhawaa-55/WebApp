import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import apiClient from '../api/client';
import './ToolPage.css';

const DocConversionPage = () => {
  const [file, setFile] = useState(null);
  const [conversionType, setConversionType] = useState('word-to-pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelected = (selectedFiles) => {
    setFile(selectedFiles.length > 0 ? selectedFiles[0] : null);
    setDownloadUrl(null);
    setError(null);
  };

  const handleConversionTypeChange = (e) => {
    setConversionType(e.target.value);
  };

  const getAcceptedFileTypes = () => {
    switch (conversionType) {
      case 'word-to-pdf':
        return { 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] };
      case 'excel-to-pdf':
        return { 'application/vnd.ms-excel': ['.xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] };
      case 'pdf-to-image':
        return { 'application/pdf': ['.pdf'] };
      default:
        return {};
    }
  };

  const getFileDescription = () => {
    switch (conversionType) {
      case 'word-to-pdf':
        return 'Word document (.doc, .docx)';
      case 'excel-to-pdf':
        return 'Excel spreadsheet (.xls, .xlsx)';
      case 'pdf-to-image':
        return 'PDF file (.pdf)';
      default:
        return 'file';
    }
  };

  const handleConvertDocument = async () => {
    if (!file) {
      setError(`Please upload a ${getFileDescription()} to convert`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post(`/api/convert/${conversionType}`, formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error converting document:', error);
      setError('Failed to convert document. Please try again or check your file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getOutputFileName = () => {
    const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    switch (conversionType) {
      case 'word-to-pdf':
      case 'excel-to-pdf':
        return `${originalName}.pdf`;
      case 'pdf-to-image':
        return `${originalName}.png`;
      default:
        return 'converted-document';
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', getOutputFileName());
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>Document Conversion</h1>
        <p>Convert between document formats (PDF, DOCX, Excel)</p>
      </div>

      <div className="tool-container">
        <div className="tool-section">
          <h2>1. Select Conversion Type</h2>
          <div className="conversion-options">
            <div className="radio-group">
              <div className="radio-option">
                <input
                  type="radio"
                  id="word-to-pdf"
                  name="conversionType"
                  value="word-to-pdf"
                  checked={conversionType === 'word-to-pdf'}
                  onChange={handleConversionTypeChange}
                />
                <label htmlFor="word-to-pdf">Word to PDF</label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="excel-to-pdf"
                  name="conversionType"
                  value="excel-to-pdf"
                  checked={conversionType === 'excel-to-pdf'}
                  onChange={handleConversionTypeChange}
                />
                <label htmlFor="excel-to-pdf">Excel to PDF</label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="pdf-to-image"
                  name="conversionType"
                  value="pdf-to-image"
                  checked={conversionType === 'pdf-to-image'}
                  onChange={handleConversionTypeChange}
                />
                <label htmlFor="pdf-to-image">PDF to Image</label>
              </div>
            </div>
          </div>
        </div>

        <div className="tool-section">
          <h2>2. Upload Document</h2>
          <FileUploader
            accept={getAcceptedFileTypes()}
            maxFiles={1}
            maxSize={20971520} // 20MB
            onFilesSelected={handleFileSelected}
            title={`Upload ${getFileDescription()}`}
            description={`Drag & drop a ${getFileDescription()} here, or click to select a file`}
          />
        </div>

        {file && (
          <div className="tool-section">
            <h2>3. Convert Document</h2>
            <div className="tool-actions">
              <Button 
                onClick={handleConvertDocument} 
                disabled={isProcessing || !file}
                variant="primary"
                size="large"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    Processing...
                  </>
                ) : 'Convert Document'}
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
            <h2>4. Download Result</h2>
            <div className="success-message">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <p>Your document has been converted successfully!</p>
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
                Download Converted Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocConversionPage; 