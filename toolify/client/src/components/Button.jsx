import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const buttonClasses = `
    button 
    button-${variant} 
    button-${size}
    ${fullWidth ? 'button-full-width' : ''}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 