import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import VendorTransactionRecord from '../models/VendorTransactionRecord.js';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use /tmp directory for Vercel (serverless environment)
// Vercel's filesystem is read-only except for /tmp
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '../uploads');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory only when needed (lazy creation)
    if (!fs.existsSync(uploadsDir)) {
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
      } catch (error) {
        console.error('Error creating uploads directory:', error);
      }
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images and PDFs only
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, JPG, PNG, GIF) and PDF files are allowed!'));
    }
  }
});

// Get all vendor transaction records
router.get('/', async (req, res) => {
  try {
    const records = await VendorTransactionRecord.find().sort({ date: 1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get records by vendor
router.get('/vendor/:vendorName', async (req, res) => {
  try {
    const { vendorName } = req.params;
    const records = await VendorTransactionRecord.find({ vendor: vendorName }).sort({ date: 1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update a vendor transaction record
router.post('/', async (req, res) => {
  try {
    const { vendor, wire, design, payablePrice, qtyOut, qtyIn, date } = req.body;

    // Check if record already exists
    let record = await VendorTransactionRecord.findOne({ vendor, wire });

    if (record) {
      // Update existing record
      record.design = design || record.design;
      record.payablePrice = payablePrice !== undefined ? payablePrice : record.payablePrice;
      record.qtyOut = qtyOut !== undefined ? qtyOut : record.qtyOut;
      record.qtyIn = qtyIn !== undefined ? qtyIn : record.qtyIn;
      record.date = date || record.date;
      await record.save();
    } else {
      // Create new record
      record = new VendorTransactionRecord({
        vendor,
        wire,
        design: design || 'N/A',
        payablePrice: payablePrice || 0,
        qtyOut: qtyOut || 0,
        qtyIn: qtyIn || 0,
        date: date || new Date()
      });
      await record.save();
    }

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload PDF file
router.post('/:id/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const record = await VendorTransactionRecord.findById(id);
    
    if (!record) {
      // Delete uploaded file if record not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Record not found' });
    }

    // Delete old file if exists
    if (record.pdfPath && fs.existsSync(record.pdfPath)) {
      fs.unlinkSync(record.pdfPath);
    }

    record.pdfFile = req.file.filename;
    record.pdfPath = req.file.path;
    await record.save();

    res.json({ 
      message: 'PDF uploaded successfully',
      record 
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// Upload image file
router.post('/:id/upload-image', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const record = await VendorTransactionRecord.findById(id);
    
    if (!record) {
      // Delete uploaded file if record not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Record not found' });
    }

    // Delete old file if exists
    if (record.imgPath && fs.existsSync(record.imgPath)) {
      fs.unlinkSync(record.imgPath);
    }

    record.imgFile = req.file.filename;
    record.imgPath = req.file.path;
    await record.save();

    res.json({ 
      message: 'Image uploaded successfully',
      record 
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete a vendor transaction record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await VendorTransactionRecord.findById(id);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Delete associated files
    if (record.pdfPath && fs.existsSync(record.pdfPath)) {
      fs.unlinkSync(record.pdfPath);
    }
    if (record.imgPath && fs.existsSync(record.imgPath)) {
      fs.unlinkSync(record.imgPath);
    }

    await VendorTransactionRecord.findByIdAndDelete(id);
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download PDF file
router.get('/:id/download-pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await VendorTransactionRecord.findById(id);

    if (!record || !record.pdfPath) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    if (!fs.existsSync(record.pdfPath)) {
      return res.status(404).json({ error: 'PDF file not found on server' });
    }

    res.download(record.pdfPath, record.pdfFile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download image file
router.get('/:id/download-image', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await VendorTransactionRecord.findById(id);

    if (!record || !record.imgPath) {
      return res.status(404).json({ error: 'Image file not found' });
    }

    if (!fs.existsSync(record.imgPath)) {
      return res.status(404).json({ error: 'Image file not found on server' });
    }

    res.download(record.imgPath, record.imgFile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
