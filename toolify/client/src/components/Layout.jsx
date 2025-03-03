import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <header className="header">
        <div className="logo">
          <h1>Toolify</h1>
        </div>
        <nav className="nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/pdf-tools">PDF Tools</Link></li>
            <li><Link to="/image-tools">Image Tools</Link></li>
            <li><Link to="/conversion-tools">Conversion Tools</Link></li>
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