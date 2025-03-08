import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="layout">
      <header className="header">
        <div className="logo-container">
          <img src="/logo .png" alt="Toolify Logo" />
          <div className='logo-text'>
            <h1>Toolifye</h1>
            <p>Your Ultimate Toolkit</p>
          </div>
          <button 
            className="hamburger" 
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <nav className={`nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/pdf-tools">PDF Tools</Link></li>
            <li><Link to="/image-tools">Image Tools</Link></li>
            <li><Link to="/conversion-tools">Conversion Tools</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </nav>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Toolify - Your Document Processing Toolkit</p>
      </footer>
    </div>
  );
};

export default Layout; 