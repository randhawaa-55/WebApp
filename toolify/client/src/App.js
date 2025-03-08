import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PDFMergePage from './pages/PDFMergePage';
import PDFSplitPage from './pages/PDFSplitPage';
import ImageCompressPage from './pages/ImageCompressPage';
import ImageConvertPage from './pages/ImageConvertPage';
import ImageToPdfPage from './pages/ImageToPdfPage';
import DocConversionPage from './pages/DocConversionPage';
import OCRPage from './pages/OCRPage';
import ContactUs from './pages/ContactUs';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import './App.css';

// Create a PDF Tools category page
const PDFToolsPage = () => (
  <div className="category-page">
    <h1>PDF Tools</h1>
    <div className="tools-grid">
      <div className="tool-card" onClick={() => window.location.href = '/pdf-tools/merge'}>
        <h3>Merge PDFs</h3>
        <p>Combine multiple PDF files into a single document</p>
      </div>
      <div className="tool-card" onClick={() => window.location.href = '/pdf-tools/split'}>
        <h3>Split PDF</h3>
        <p>Extract pages or split a PDF into multiple files</p>
      </div>
      {/* Add more PDF tools here as they are implemented */}
    </div>
  </div>
);

// Create an Image Tools category page
const ImageToolsPage = () => (
  <div className="category-page">
    <h1>Image Tools</h1>
    <div className="tools-grid">
      <div className="tool-card" onClick={() => window.location.href = '/image-tools/compress'}>
        <h3>Compress Images</h3>
        <p>Reduce image file size while preserving quality</p>
      </div>
      <div className="tool-card" onClick={() => window.location.href = '/image-tools/convert'}>
        <h3>Convert Images</h3>
        <p>Convert images between different formats (JPG, PNG, WebP)</p>
      </div>
      <div className="tool-card" onClick={() => window.location.href = '/image-tools/to-pdf'}>
        <h3>Images to PDF</h3>
        <p>Create a PDF document from one or more images</p>
      </div>
      {/* Add more image tools here as they are implemented */}
    </div>
  </div>
);

// Create a Conversion Tools category page
const ConversionToolsPage = () => (
  <div className="category-page">
    <h1>Conversion Tools</h1>
    <div className="tools-grid">
      <div className="tool-card" onClick={() => window.location.href = '/conversion-tools/documents'}>
        <h3>Document Conversion</h3>
        <p>Convert between document formats (PDF, DOCX, TXT)</p>
      </div>
      <div className="tool-card" onClick={() => window.location.href = '/conversion-tools/ocr'}>
        <h3>OCR Text Extraction</h3>
        <p>Extract text from images and scanned documents</p>
      </div>
      {/* Add more conversion tools here as they are implemented */}
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pdf-tools" element={<PDFToolsPage />} />
          <Route path="/pdf-tools/merge" element={<PDFMergePage />} />
          <Route path="/pdf-tools/split" element={<PDFSplitPage />} />
          <Route path="/image-tools" element={<ImageToolsPage />} />
          <Route path="/image-tools/compress" element={<ImageCompressPage />} />
          <Route path="/image-tools/convert" element={<ImageConvertPage />} />
          <Route path="/image-tools/to-pdf" element={<ImageToPdfPage />} />
          <Route path="/conversion-tools" element={<ConversionToolsPage />} />
          <Route path="/conversion-tools/documents" element={<DocConversionPage />} />
          <Route path="/conversion-tools/ocr" element={<OCRPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/about" element={<About />} />

          {/* Add more routes for other tools as they are implemented */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

// Simple NotFound component
const NotFound = () => (
  <div className="not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  </div>
);

export default App; 