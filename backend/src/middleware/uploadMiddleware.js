const multer = require('multer');
const path = require('path');

// Store files in memory buffer for stream parsing and SHA-256 hash calculation
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'text/plain',
    'application/csv',
    'text/x-csv',
  ];

  if (ext === '.csv' || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only CSV files (.csv) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
  },
  fileFilter,
});

module.exports = upload;

