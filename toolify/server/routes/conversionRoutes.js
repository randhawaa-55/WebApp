const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { fromPath } = require('pdf2pic');
const { toPdf } = require('office-to-pdf');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Import Tesseract.js for OCR
const { createWorker } = require('tesseract.js');

// Development mode flag - set to true to skip external tool checks
// In production, set this to false or remove it
const DEVELOPMENT_MODE = process.env.NODE_ENV !== 'production';

// PRODUCTION CONFIGURATION NOTES:
// 1. For Word/Excel to PDF conversion:
//    - Install LibreOffice: sudo apt install -y libreoffice
//    - Verify installation: libreoffice --version
//    - Ensure soffice is in PATH: which soffice
//
// 2. For PDF to Image conversion:
//    - Install required dependencies: sudo apt install -y ghostscript
//    - Verify installation: gs --version
//
// 3. For OCR:
//    - Install Tesseract: sudo apt install -y tesseract-ocr libtesseract-dev
//    - Install language packs: sudo apt install -y tesseract-ocr-eng tesseract-ocr-fra tesseract-ocr-deu
//    - Verify installation: tesseract --version
//    - Language packs location: /usr/share/tesseract-ocr/4.00/tessdata/

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// PDF to Image conversion
router.post('/pdf-to-image', upload.single('file'), async (req, res) => {
  let filePath = null;
  let outputPath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }
    
    filePath = req.file.path;
    
    // Check if file is a PDF
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Please upload a valid PDF file' });
    }
    
    // Set output path
    const outputFilename = `output-${Date.now()}.png`;
    outputPath = path.join(__dirname, '../uploads', outputFilename);
    
    // Method 1: Try using pdf2pic (primary method)
    try {
      const options = {
        density: 300,
        saveFilename: path.basename(outputPath, '.png'),
        savePath: path.dirname(outputPath),
        format: "png",
        width: 800,
        height: 1200
      };
      
      const convert = fromPath(filePath, options);
      const pageToConvert = 1; // Convert only first page
      
      const result = await convert(pageToConvert, { responseType: "buffer" });
      
      if (result && result.buffer) {
        // Save the image
        fs.writeFileSync(outputPath, result.buffer);
        console.log('Successfully converted PDF to image using pdf2pic');
      } else {
        throw new Error('pdf2pic conversion failed to produce a valid buffer');
      }
    } catch (pdf2picError) {
      console.error('pdf2pic conversion error:', pdf2picError);
      
      // Method 2: Try using Ghostscript directly (fallback method)
      try {
        // Check if Ghostscript is installed
        await exec('which gs');
        
        // Use Ghostscript to convert PDF to PNG
        const cmd = `gs -sDEVICE=png16m -dTextAlphaBits=4 -r300 -dGraphicsAlphaBits=4 -dFirstPage=1 -dLastPage=1 -o "${outputPath}" "${filePath}"`;
        await exec(cmd);
        
        if (fs.existsSync(outputPath)) {
          console.log('Successfully converted PDF to image using Ghostscript');
        } else {
          throw new Error('Ghostscript did not produce an output file');
        }
      } catch (gsError) {
        console.error('Ghostscript conversion error:', gsError);
        
        // Method 3: Create a fallback PDF with an error message
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        
        page.drawText('PDF to Image Conversion', {
          x: 50,
          y: 700,
          size: 20
        });
        
        page.drawText(`Original file: ${req.file.originalname}`, {
          x: 50,
          y: 650,
          size: 12
        });
        
        page.drawText('PDF to image conversion requires additional setup in production.', {
          x: 50,
          y: 600,
          size: 12
        });
        
        page.drawText('Please install Ghostscript or configure pdf2pic properly.', {
          x: 50,
          y: 570,
          size: 12
        });
        
        const pdfBytes = await pdfDoc.save();
        outputPath = path.join(__dirname, '../uploads', `conversion-note-${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, pdfBytes);
        
        console.log('Created fallback PDF with error message');
      }
    }
    
    // Send the file as a download
    const downloadFilename = path.extname(outputPath) === '.pdf' ? 'conversion-note.pdf' : 'converted.png';
    res.download(outputPath, downloadFilename, () => {
      // Clean up files after download
      safeDeleteFile(outputPath);
      safeDeleteFile(filePath);
    });
  } catch (error) {
    console.error('Error converting PDF to image:', error);
    res.status(500).json({ error: 'Failed to convert PDF to image' });
    
    // Clean up files in case of error
    safeDeleteFile(outputPath);
    safeDeleteFile(filePath);
  }
});

// Word to PDF conversion
router.post('/word-to-pdf', upload.single('file'), async (req, res) => {
  let filePath = null;
  let outputPath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a Word document' });
    }
    
    filePath = req.file.path;
    
    // Check if file is a Word document
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (fileExt !== '.docx' && fileExt !== '.doc') {
      return res.status(400).json({ error: 'Please upload a valid Word document (.docx or .doc)' });
    }
    
    // Set output path
    outputPath = path.join(__dirname, '../uploads', `converted-${Date.now()}.pdf`);
    
    // Skip LibreOffice check in development mode
    if (!DEVELOPMENT_MODE) {
      // Try using LibreOffice for conversion (production method)
      try {
        // Check if LibreOffice is installed
        const whichResult = await exec('which soffice');
        console.log('LibreOffice path:', whichResult.stdout.trim());
        
        // Use LibreOffice for conversion
        const cmd = `soffice --headless --convert-to pdf --outdir "${path.dirname(outputPath)}" "${filePath}"`;
        console.log('Running LibreOffice command:', cmd);
        
        const { stdout, stderr } = await exec(cmd);
        
        if (stdout) console.log('LibreOffice stdout:', stdout);
        if (stderr) console.error('LibreOffice stderr:', stderr);
        
        // LibreOffice saves with the same name but .pdf extension
        const libreOfficePath = path.join(
          path.dirname(outputPath),
          path.basename(filePath, path.extname(filePath)) + '.pdf'
        );
        
        console.log('Expected output path:', libreOfficePath);
        console.log('File exists?', fs.existsSync(libreOfficePath));
        
        // Rename to our desired output path if needed
        if (libreOfficePath !== outputPath && fs.existsSync(libreOfficePath)) {
          fs.renameSync(libreOfficePath, outputPath);
        } else {
          outputPath = libreOfficePath;
        }
        
        console.log('Successfully converted Word to PDF using LibreOffice');
        
        // Send the file as a download
        return res.download(outputPath, 'converted.pdf', () => {
          // Clean up files after download
          safeDeleteFile(outputPath);
          safeDeleteFile(filePath);
        });
      } catch (libreOfficeError) {
        console.error('LibreOffice not available or conversion failed:', libreOfficeError.message);
        // Continue to fallback methods
      }
    } else {
      console.log('Development mode: Skipping LibreOffice conversion');
    }
    
    // Try using office-to-pdf as fallback (works in both dev and prod)
    try {
      const docxBuffer = fs.readFileSync(filePath);
      const pdfBuffer = await toPdf(docxBuffer);
      fs.writeFileSync(outputPath, pdfBuffer);
      console.log('Successfully converted Word to PDF using office-to-pdf');
      
      // Send the file as a download
      return res.download(outputPath, 'converted.pdf', () => {
        // Clean up files after download
        safeDeleteFile(outputPath);
        safeDeleteFile(filePath);
      });
    } catch (officeToPdfError) {
      console.log('office-to-pdf conversion failed:', officeToPdfError.message);
      
      // Final fallback: Create a placeholder PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      
      page.drawText('Document Conversion Placeholder', {
        x: 50,
        y: 700,
        size: 20
      });
      
      page.drawText(`Original file: ${req.file.originalname}`, {
        x: 50,
        y: 650,
        size: 12
      });
      
      const modeText = DEVELOPMENT_MODE ? 
        'Development mode: Using placeholder PDF' : 
        'For production use, install LibreOffice or use a conversion API';
      
      page.drawText(modeText, {
        x: 50,
        y: 600,
        size: 12
      });
      
      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(outputPath, pdfBytes);
      console.log('Created placeholder PDF as final fallback');
      
      // Send the file as a download
      return res.download(outputPath, 'converted.pdf', () => {
        // Clean up files after download
        safeDeleteFile(outputPath);
        safeDeleteFile(filePath);
      });
    }
  } catch (error) {
    console.error('Error converting Word to PDF:', error);
    res.status(500).json({ error: 'Failed to convert Word to PDF' });
    
    // Clean up files in case of error
    safeDeleteFile(outputPath);
    safeDeleteFile(filePath);
  }
});

// Excel to PDF conversion
router.post('/excel-to-pdf', upload.single('file'), async (req, res) => {
  let filePath = null;
  let outputPath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an Excel file' });
    }
    
    filePath = req.file.path;
    
    // Check if file is an Excel document
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (fileExt !== '.xlsx' && fileExt !== '.xls') {
      return res.status(400).json({ error: 'Please upload a valid Excel file (.xlsx or .xls)' });
    }
    
    // Set output path
    outputPath = path.join(__dirname, '../uploads', `converted-${Date.now()}.pdf`);
    
    // Try using LibreOffice for conversion (production method)
    try {
      // Check if LibreOffice is installed
      await exec('which soffice');
      
      // Use LibreOffice for conversion
      const cmd = `soffice --headless --convert-to pdf --outdir "${path.dirname(outputPath)}" "${filePath}"`;
      await exec(cmd);
      
      // LibreOffice saves with the same name but .pdf extension
      const libreOfficePath = path.join(
        path.dirname(outputPath),
        path.basename(filePath, path.extname(filePath)) + '.pdf'
      );
      
      // Rename to our desired output path if needed
      if (libreOfficePath !== outputPath && fs.existsSync(libreOfficePath)) {
        fs.renameSync(libreOfficePath, outputPath);
      } else {
        outputPath = libreOfficePath;
      }
      
      console.log('Successfully converted Excel to PDF using LibreOffice');
    } catch (libreOfficeError) {
      console.error('LibreOffice not available or conversion failed:', libreOfficeError.message);
      
      // Create a placeholder PDF as fallback
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      
      page.drawText('Excel to PDF Conversion Placeholder', {
        x: 50,
        y: 700,
        size: 20
      });
      
      page.drawText(`Original file: ${req.file.originalname}`, {
        x: 50,
        y: 650,
        size: 12
      });
      
      page.drawText('For production use, install LibreOffice or use a conversion API', {
        x: 50,
        y: 600,
        size: 12
      });
      
      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(outputPath, pdfBytes);
      console.log('Created placeholder PDF as fallback');
    }
    
    // Send the file as a download
    res.download(outputPath, 'converted.pdf', () => {
      // Clean up files after download
      safeDeleteFile(outputPath);
      safeDeleteFile(filePath);
    });
  } catch (error) {
    console.error('Error converting Excel to PDF:', error);
    res.status(500).json({ error: 'Failed to convert Excel to PDF' });
    
    // Clean up files in case of error
    safeDeleteFile(outputPath);
    safeDeleteFile(filePath);
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

// OCR (Optical Character Recognition)
router.post('/ocr', upload.single('file'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file' });
    }
    
    filePath = req.file.path;
    
    // Check if file is an image
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff', 'image/bmp'];
    if (!validImageTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Please upload a valid image file' });
    }
    
    const language = req.body.language || 'eng'; // Default to English
    
    // Create a new worker with the specified language
    const worker = await createWorker(language);
    
    try {
      // Recognize text in the image
      const { data } = await worker.recognize(filePath);
      
      // Terminate the worker to free up resources
      await worker.terminate();
      
      // Return the extracted text
      res.json({ text: data.text });
    } catch (ocrError) {
      console.error('OCR processing error:', ocrError);
      
      // Terminate the worker in case of error
      await worker.terminate();
      
      res.status(500).json({ 
        error: 'Failed to extract text from the image',
        details: ocrError.message
      });
    }
  } catch (error) {
    console.error('Error performing OCR:', error);
    res.status(500).json({ error: 'Failed to perform OCR' });
  } finally {
    // Clean up the uploaded file in a try-catch block to prevent crashes
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Warning: Could not delete temporary file:', cleanupError.message);
        // Continue execution even if file deletion fails
      }
    }
  }
});

module.exports = router;
