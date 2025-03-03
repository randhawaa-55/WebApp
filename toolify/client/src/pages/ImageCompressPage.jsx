import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import apiClient from '../api/client';
import './ToolPage.css';

const ImageCompressPage = () => {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelected = (selectedFiles) => {
    setFile(selectedFiles.length > 0 ? selectedFiles[0] : null);
    setDownloadUrl(null);
    setError(null);
  };

  const handleQualityChange = (e) => {
    setQuality(parseInt(e.target.value));
  };

  const handleCompressImage = async () => {
    if (!file) {
      setError('Please upload an image file to compress');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);

    try {
      const response = await apiClient.post('/api/image/compress', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error compressing image:', error);
      setError('Failed to compress image. Please try again or check your file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `compressed-${file.name}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>Compress Images</h1>
        <p>Reduce image file size while preserving quality</p>
      </div>

      <div className="tool-container">
        <div className="tool-section">
          <h2>1. Upload Image</h2>
          <FileUploader
            accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
            maxFiles={1}
            maxSize={20971520} // 20MB
            onFilesSelected={handleFileSelected}
            title="Upload Image"
            description="Drag & drop an image here, or click to select a file"
          />
        </div>

        {file && (
          <div className="tool-section">
            <h2>2. Compression Settings</h2>
            <div className="compression-settings">
              <label htmlFor="quality-slider">Quality: {quality}%</label>
              <input
                id="quality-slider"
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={handleQualityChange}
                className="quality-slider"
              />
              <p className="setting-description">
                Lower quality = smaller file size, higher quality = better image
              </p>
            </div>
            <div className="tool-actions">
              <Button 
                onClick={handleCompressImage} 
                disabled={isProcessing || !file}
                variant="primary"
                size="large"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    Processing...
                  </>
                ) : 'Compress Image'}
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
              <p>Your image has been compressed successfully!</p>
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
                Download Compressed Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCompressPage; 