import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary', className = '' }) => {
  const spinnerClasses = `spinner spinner-${size} spinner-${color} ${className}`;
  
  return (
    <div className={spinnerClasses}>
      <div className="spinner-circle"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner; 