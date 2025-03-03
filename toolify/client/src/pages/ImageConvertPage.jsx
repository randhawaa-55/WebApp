import React, { useState } from 'react';
import axios from 'axios';
import FileUploader from '../components/FileUploader';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import './ToolPage.css';

const ImageConvertPage = () => {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelected = (selectedFiles) => {
    setFile(selectedFiles.length > 0 ? selectedFiles[0] : null);
    setDownloadUrl(null);
    setError(null);
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  const handleConvertImage = async () => {
    if (!file) {
      setError('Please upload an image file to convert');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    try {
      const response = await axios.post('http://localhost:5000/api/image/convert', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error converting image:', error);
      setError('Failed to convert image. Please try again or check your file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${originalName}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>Convert Images</h1>
        <p>Convert images between different formats (JPG, PNG, WebP)</p>
      </div>

      <div className="tool-container">
        <div className="tool-section">
          <h2>1. Upload Image</h2>
          <FileUploader
            accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] }}
            maxFiles={1}
            maxSize={20971520} // 20MB
            onFilesSelected={handleFileSelected}
            title="Upload Image"
            description="Drag & drop an image here, or click to select a file"
          />
        </div>

        {file && (
          <div className="tool-section">
            <h2>2. Conversion Settings</h2>
            <div className="conversion-settings">
              <label htmlFor="format-select">Convert to:</label>
              <select
                id="format-select"
                value={format}
                onChange={handleFormatChange}
                className="format-select"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
                <option value="gif">GIF</option>
              </select>
              <p className="setting-description">
                Choose the output format for your converted image
              </p>
            </div>
            <div className="tool-actions">
              <Button 
                onClick={handleConvertImage} 
                disabled={isProcessing || !file}
                variant="primary"
                size="large"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    Processing...
                  </>
                ) : 'Convert Image'}
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
              <p>Your image has been converted successfully!</p>
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
                Download Converted Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageConvertPage; 