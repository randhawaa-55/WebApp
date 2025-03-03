const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const imageToPdf = require('image-to-pdf');
const sharp = require('sharp');

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

// Image to PDF conversion
router.post('/image-to-pdf', upload.array('files', 20), async (req, res) => {
  const outputPath = path.join(__dirname, '../uploads', `converted-${Date.now()}.pdf`);
  const uploadedFiles = req.files || [];
  
  try {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one image file' });
    }
    
    // Check if files are images
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validFiles = uploadedFiles.filter(file => validImageTypes.includes(file.mimetype));
    
    if (validFiles.length === 0) {
      return res.status(400).json({ error: 'Please upload valid image files (JPEG, PNG, GIF, WEBP)' });
    }
    
    // Using image-to-pdf library
    
    // Get paths of all uploaded images
    const imagePaths = validFiles.map(file => file.path);
    
    // Convert images to PDF
    await new Promise((resolve, reject) => {
      imageToPdf(imagePaths, {
        imgSize: "A4",
        quality: 0.8,
      })
      .pipe(fs.createWriteStream(outputPath))
      .on('finish', resolve)
      .on('error', reject);
    });
    
    // Send the file as a download
    res.download(outputPath, 'converted.pdf', () => {
      // Clean up files after download
      safeDeleteFile(outputPath);
      validFiles.forEach(file => safeDeleteFile(file.path));
    });
  } catch (error) {
    console.error('Error converting images to PDF:', error);
    res.status(500).json({ error: 'Failed to convert images to PDF' });
    
    // Clean up files in case of error
    safeDeleteFile(outputPath);
    uploadedFiles.forEach(file => safeDeleteFile(file.path));
  }
});

// Image compression
router.post('/compress', upload.single('file'), async (req, res) => {
  const outputPath = path.join(__dirname, '../uploads', `compressed-${Date.now()}${req.file ? path.extname(req.file.originalname) : '.jpg'}`);
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file' });
    }
    
    // Check if file is an image
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Please upload a valid image file (JPEG, PNG, WEBP)' });
    }
    
    const quality = parseInt(req.body.quality) || 80; // Default to 80% quality
    
    // Using sharp for image compression
    
    // Compress the image
    await sharp(req.file.path)
      .jpeg({ quality: quality })
      .toFile(outputPath);
    
    // Send the file as a download
    res.download(outputPath, `compressed-${req.file.originalname}`, () => {
      // Clean up files after download
      safeDeleteFile(outputPath);
      safeDeleteFile(req.file.path);
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    res.status(500).json({ error: 'Failed to compress image' });
    
    // Clean up files in case of error
    safeDeleteFile(outputPath);
    if (req.file) safeDeleteFile(req.file.path);
  }
});

// Image format conversion
router.post('/convert', upload.single('file'), async (req, res) => {
  const format = req.body.format || 'png'; // Default to PNG
  const outputPath = path.join(__dirname, '../uploads', `converted-${Date.now()}.${format}`);
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file' });
    }
    
    // Check if file is an image
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Please upload a valid image file (JPEG, PNG, GIF, WEBP)' });
    }
    
    // Validate format
    const validFormats = ['jpeg', 'png', 'webp', 'gif'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Supported formats: jpeg, png, webp, gif' });
    }
    
    // Using sharp for image conversion
    
    // Convert the image
    const sharpInstance = sharp(req.file.path);
    
    // Apply the appropriate format conversion
    if (format === 'jpeg') {
      await sharpInstance.jpeg({ quality: 90 }).toFile(outputPath);
    } else if (format === 'png') {
      await sharpInstance.png().toFile(outputPath);
    } else if (format === 'webp') {
      await sharpInstance.webp({ quality: 90 }).toFile(outputPath);
    } else if (format === 'gif') {
      await sharpInstance.gif().toFile(outputPath);
    }
    
    // Send the file as a download
    const originalName = path.basename(req.file.originalname, path.extname(req.file.originalname));
    res.download(outputPath, `${originalName}.${format}`, () => {
      // Clean up files after download
      safeDeleteFile(outputPath);
      safeDeleteFile(req.file.path);
    });
  } catch (error) {
    console.error('Error converting image:', error);
    res.status(500).json({ error: 'Failed to convert image' });
    
    // Clean up files in case of error
    safeDeleteFile(outputPath);
    if (req.file) safeDeleteFile(req.file.path);
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

module.exports = router;
