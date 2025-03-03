import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import apiClient from '../api/client';
import './ToolPage.css';

const OCRPage = () => {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('eng');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState(null);

  const handleFileSelected = (selectedFiles) => {
    setFile(selectedFiles.length > 0 ? selectedFiles[0] : null);
    setExtractedText('');
    setError(null);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleExtractText = async () => {
    if (!file) {
      setError('Please upload an image file for text extraction');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    try {
      const response = await apiClient.post('/api/convert/ocr', formData);
      setExtractedText(response.data.text);
    } catch (error) {
      console.error('Error extracting text:', error);
      setError('Failed to extract text. Please try again or check your file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText)
      .then(() => {
        alert('Text copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text:', err);
      });
  };

  const handleDownloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'extracted-text.txt');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>OCR Text Extraction</h1>
        <p>Extract text from images and scanned documents</p>
      </div>

      <div className="tool-container">
        <div className="tool-section">
          <h2>1. Upload Image</h2>
          <FileUploader
            accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.tiff', '.bmp'] }}
            maxFiles={1}
            maxSize={20971520} // 20MB
            onFilesSelected={handleFileSelected}
            title="Upload Image"
            description="Drag & drop an image here, or click to select a file"
          />
        </div>

        {file && (
          <div className="tool-section">
            <h2>2. OCR Settings</h2>
            <div className="ocr-settings">
              <label htmlFor="language-select">Language:</label>
              <select
                id="language-select"
                value={language}
                onChange={handleLanguageChange}
                className="language-select"
              >
                <option value="eng">English</option>
                <option value="spa">Spanish</option>
                <option value="fra">French</option>
                <option value="deu">German</option>
                <option value="ita">Italian</option>
                <option value="por">Portuguese</option>
                <option value="rus">Russian</option>
                <option value="chi_sim">Chinese (Simplified)</option>
                <option value="jpn">Japanese</option>
                <option value="kor">Korean</option>
              </select>
              <p className="setting-description">
                Select the language of the text in your image for better accuracy
              </p>
            </div>
            <div className="tool-actions">
              <Button 
                onClick={handleExtractText} 
                disabled={isProcessing || !file}
                variant="primary"
                size="large"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    Processing...
                  </>
                ) : 'Extract Text'}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="tool-error">
            <p>{error}</p>
          </div>
        )}

        {extractedText && (
          <div className="tool-section tool-result">
            <h2>3. Extracted Text</h2>
            <div className="extracted-text-container">
              <textarea
                className="extracted-text"
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={10}
                readOnly={false}
              />
            </div>
            <div className="tool-actions">
              <Button 
                onClick={handleCopyText} 
                variant="secondary"
                size="medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="button-icon">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Text
              </Button>
              <Button 
                onClick={handleDownloadText} 
                variant="success"
                size="medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="button-icon">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download as Text File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRPage; 