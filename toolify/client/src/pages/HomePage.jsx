import React from 'react';
import Card from '../components/Card';
import './HomePage.css';

const HomePage = () => {
  const tools = [
    {
      id: 'pdf-merge',
      title: 'Merge PDFs',
      description: 'Combine multiple PDF files into a single document',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
          <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
          <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ),
      to: '/pdf-tools/merge'
    },
    {
      id: 'pdf-split',
      title: 'Split PDF',
      description: 'Extract pages or split a PDF into multiple files',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      ),
      to: '/pdf-tools/split'
    },
    {
      id: 'image-compress',
      title: 'Compress Images',
      description: 'Reduce image file size while preserving quality',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      ),
      to: '/image-tools/compress'
    },
    {
      id: 'image-convert',
      title: 'Convert Images',
      description: 'Convert images between different formats (JPG, PNG, WebP)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
      ),
      to: '/image-tools/convert'
    },
    {
      id: 'doc-convert',
      title: 'Document Conversion',
      description: 'Convert between document formats (PDF, DOCX, TXT)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      to: '/conversion-tools/documents'
    },
    {
      id: 'ocr',
      title: 'OCR Text Extraction',
      description: 'Extract text from images and scanned documents',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 7 4 4 20 4 20 7"></polyline>
          <line x1="9" y1="20" x2="15" y2="20"></line>
          <line x1="12" y1="4" x2="12" y2="20"></line>
        </svg>
      ),
      to: '/conversion-tools/ocr'
    }
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Your All-in-One Document Processing Toolkit</h1>
        <p>
          Toolify provides powerful tools to work with PDFs, images, and documents.
          All processing happens on your device for maximum privacy and security.
        </p>
      </section>

      <section className="tools-grid">
        {tools.map(tool => (
          <Card
            key={tool.id}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            to={tool.to}
          />
        ))}
      </section>

      <section className="features">
        <h2>Why Choose Toolify?</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3>Privacy First</h3>
            <p>Your files are processed locally on your device. We never store or access your data.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="16 12 12 8 8 12"></polyline>
                <line x1="12" y1="16" x2="12" y2="8"></line>
              </svg>
            </div>
            <h3>Easy to Use</h3>
            <p>Simple, intuitive interface designed for users of all technical levels.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>High Quality</h3>
            <p>Advanced algorithms ensure the highest quality output for all your documents.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 