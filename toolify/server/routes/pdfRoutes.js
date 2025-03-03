const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const archiver = require('archiver');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter to ensure only PDFs are uploaded
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
    files: 20 // Max 20 files at once
  }
});

// Helper function to safely delete files
function safeDeleteFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error(`Warning: Could not delete file ${filePath}:`, error.message);
      // Continue execution even if file deletion fails
    }
  }
}

// Helper function to safely delete directory
function safeDeleteDir(dirPath) {
  if (dirPath && fs.existsSync(dirPath)) {
    try {
      fs.rmdirSync(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Warning: Could not delete directory ${dirPath}:`, error.message);
      // Continue execution even if directory deletion fails
    }
  }
}

// Merge PDFs
router.post('/merge', upload.array('files', 20), async (req, res) => {
  const outputPath = path.join(__dirname, '../uploads', `merged-${Date.now()}.pdf`);
  const uploadedFiles = req.files || [];
  
  try {
    if (!uploadedFiles || uploadedFiles.length < 2) {
      return res.status(400).json({ error: 'Please upload at least 2 PDF files' });
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    
    // Process each uploaded PDF
    for (const file of uploadedFiles) {
      try {
        const pdfBytes = fs.readFileSync(file.path);
        const pdf = await PDFDocument.load(pdfBytes, { 
          ignoreEncryption: true,
          updateMetadata: false
        });
        
        // Copy all pages from the source PDF
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Continue with other files even if one fails
      }
    }
    
    // If no pages were added, return an error
    if (mergedPdf.getPageCount() === 0) {
      return res.status(400).json({ error: 'Failed to merge PDFs. No valid pages found.' });
    }
    
    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);
    
    // Send the file as a download
    res.download(outputPath, 'merged.pdf', () => {
      // Clean up files after download
      try {
        safeDeleteFile(outputPath);
        uploadedFiles.forEach(file => safeDeleteFile(file.path));
      } catch (cleanupError) {
        console.error('Error cleaning up files:', cleanupError);
      }
    });
  } catch (error) {
    console.error('Error merging PDFs:', error);
    res.status(500).json({ error: 'Failed to merge PDFs', details: error.message });
    
    // Clean up files in case of error
    safeDeleteFile(outputPath);
    if (uploadedFiles) {
      uploadedFiles.forEach(file => safeDeleteFile(file.path));
    }
  }
});

// Split PDF
router.post('/split', upload.single('file'), async (req, res) => {
  let outputDir = null;
  const splitFiles = [];
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }
    
    const splitType = req.body.splitType || 'all';
    let pageRanges = [];
    
    if (splitType === 'range') {
      if (!req.body.pageRanges || !req.body.pageRanges.trim()) {
        return res.status(400).json({ error: 'Please specify page ranges to split' });
      }
      
      // Parse page ranges from string like "1-3,5,7-10"
      const rangesStr = req.body.pageRanges.trim();
      pageRanges = rangesStr.split(',').map(range => {
        const parts = range.trim().split('-');
        if (parts.length === 1) {
          const page = parseInt(parts[0]);
          return { start: page, end: page };
        } else {
          return {
            start: parseInt(parts[0]),
            end: parseInt(parts[1])
          };
        }
      });
    }
    
    const pdfBytes = fs.readFileSync(req.file.path);
    const pdf = await PDFDocument.load(pdfBytes, { 
      ignoreEncryption: true,
      updateMetadata: false
    });
    const totalPages = pdf.getPageCount();
    
    // Create a directory to store all split PDFs
    outputDir = path.join(__dirname, '../uploads', `split-${Date.now()}`);
    fs.mkdirSync(outputDir, { recursive: true });
    
    if (splitType === 'all') {
      // Split each page into a separate PDF
      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(copiedPage);
        
        const newPdfBytes = await newPdf.save();
        const outputPath = path.join(outputDir, `page-${i + 1}.pdf`);
        fs.writeFileSync(outputPath, newPdfBytes);
        
        splitFiles.push(outputPath);
      }
    } else if (splitType === 'range' && pageRanges.length > 0) {
      // Split by specified ranges
      for (let i = 0; i < pageRanges.length; i++) {
        const range = pageRanges[i];
        const start = range.start - 1; // Convert to 0-indexed
        const end = range.end - 1; // Convert to 0-indexed
        
        if (start < 0 || end >= totalPages || start > end) {
          continue; // Skip invalid ranges
        }
        
        const newPdf = await PDFDocument.create();
        const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        const copiedPages = await newPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const newPdfBytes = await newPdf.save();
        const outputPath = path.join(outputDir, `pages-${range.start}-${range.end}.pdf`);
        fs.writeFileSync(outputPath, newPdfBytes);
        
        splitFiles.push(outputPath);
      }
    }
    
    if (splitFiles.length === 0) {
      return res.status(400).json({ error: 'Failed to split PDF with the provided options' });
    }
    
    // Create a zip file containing all split PDFs
    const zipPath = path.join(__dirname, '../uploads', `split-${Date.now()}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      // Send the zip file as a download
      res.download(zipPath, 'split-pdf.zip', () => {
        // Clean up files after download
        safeDeleteFile(zipPath);
        safeDeleteFile(req.file.path);
        splitFiles.forEach(file => safeDeleteFile(file));
        safeDeleteDir(outputDir);
      });
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    
    // Add each split PDF to the zip
    splitFiles.forEach((file, index) => {
      const filename = path.basename(file);
      archive.file(file, { name: filename });
    });
    
    await archive.finalize();
  } catch (error) {
    console.error('Error splitting PDF:', error);
    res.status(500).json({ error: 'Failed to split PDF', details: error.message });
    
    // Clean up files in case of error
    if (req.file) safeDeleteFile(req.file.path);
    splitFiles.forEach(file => safeDeleteFile(file));
    if (outputDir) safeDeleteDir(outputDir);
  }
});

module.exports = router;
