import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUploader.css';

const FileUploader = ({ 
  accept, 
  maxFiles = 10, 
  maxSize = 10485760, // 10MB
  onFilesSelected,
  title = 'Upload Files',
  description = 'Drag & drop files here, or click to select files'
}) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles && rejectedFiles.length > 0) {
      const errorMessages = rejectedFiles.map(file => {
        const errors = file.errors.map(e => e.message).join(', ');
        return `${file.file.name}: ${errors}`;
      });
      setError(errorMessages.join('\n'));
      return;
    }

    setError(null);
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
    onFilesSelected(newFiles);
  }, [files, onFilesSelected]);

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const clearFiles = () => {
    setFiles([]);
    onFilesSelected([]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  });

  return (
    <div className="file-uploader">
      <h3 className="uploader-title">{title}</h3>
      
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p>{description}</p>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="clear-error">Dismiss</button>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <h4>Selected Files ({files.length})</h4>
            <button onClick={clearFiles} className="clear-files">Clear All</button>
          </div>
          <ul>
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="file-item">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button 
                  onClick={() => removeFile(index)} 
                  className="remove-file"
                  aria-label="Remove file"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 