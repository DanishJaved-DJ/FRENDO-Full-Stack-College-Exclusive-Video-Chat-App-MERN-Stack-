import multer from 'multer';
import path from 'path';

// ✅ Memory storage avoids using file system
const storage = multer.memoryStorage();

// ✅ Optional: still use file filter for images
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = ['.jpg', '.jpeg', '.png'];
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

// ✅ Export middleware
export const upload = multer({ storage, fileFilter });
