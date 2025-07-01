import multer from 'multer';
import path from 'path';

// ✅ Memory storage avoids using file system
const storage = multer.memoryStorage();

// ✅ Accept images, PDFs, and common video formats
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = [
    '.jpg', '.jpeg', '.png',       // images
    '.pdf',                        // documents
    '.mp4', '.mov', '.avi', '.mkv' // videos
  ];
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only images, PDF, and video files are allowed'), false);
};

// ✅ Export middleware
export const upload = multer({ storage, fileFilter });