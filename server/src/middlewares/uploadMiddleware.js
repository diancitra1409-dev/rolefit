import multer from 'multer';

// Use memory storage so we can parse the PDF buffer directly without disk I/O
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdfMime || isPdfExt) {
    cb(null, true);
  } else {
    const err = new Error('Invalid file type. Only PDF files are allowed.');
    err.status = 400;
    cb(err, false);
  }
};

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
});

// Middleware to handle Multer errors gracefully
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File size exceeds the 5MB limit.' });
    }
    return res.status(400).json({ success: false, error: `File upload error: ${err.message}` });
  } else if (err) {
    return res.status(err.status || 400).json({ success: false, error: err.message });
  }
  if (typeof next === 'function') next();
};
