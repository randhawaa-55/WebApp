import React from 'react';
import { Link } from 'react-router-dom';
import './Card.css';

const Card = ({ 
  title, 
  description, 
  icon, 
  to, 
  onClick,
  className = '' 
}) => {
  const cardContent = (
    <>
      <div className="card-icon">{icon}</div>
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`card ${className}`}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={`card ${className}`} onClick={onClick} role="button" tabIndex={0}>
      {cardContent}
    </div>
  );
};

export default Card; 