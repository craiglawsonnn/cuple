const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');

const router = express.Router();
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// Set up Multer storage
const upload = multer({ dest: 'uploads/' });

router.post('/parse', upload.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }  
  const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);

  console.log("🖼️ Processing file:", imagePath);

  try {
    const result = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => console.log(m) // shows OCR progress
    });

    const text = result.data.text;
    fs.unlinkSync(imagePath); // delete image after OCR
    res.json({ text });
  } catch (err) {
    console.error("OCR error:", err);
    fs.unlinkSync(imagePath);
    res.status(500).json({ message: 'Failed to extract text from receipt.' });
  }
});

module.exports = router;
