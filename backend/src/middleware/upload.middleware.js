const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const MIME_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/csv': '.csv',
};

const resolveExtension = (file) => {
  const fromMime = MIME_EXTENSIONS[file.mimetype];
  if (fromMime) return fromMime;
  const fromName = path.extname(file.originalname || '').toLowerCase();
  return fromName || '';
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = path.join(uploadDir, file.fieldname || 'files');
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${resolveExtension(file)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv|webp)$/i;
  const ext = resolveExtension(file) || path.extname(file.originalname || '');
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type', 400), false);
  }
};

const maxSize = (parseInt(process.env.UPLOAD_MAX_SIZE_MB, 10) || 10) * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});

const imageMemoryFilter = (req, file, cb) => {
  if (/^image\/(png|jpe?g|webp)$/i.test(file.mimetype || '')) {
    cb(null, true);
    return;
  }
  cb(new AppError('Receipt image must be PNG, JPG, or WEBP', 400), false);
};

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageMemoryFilter,
  limits: { fileSize: maxSize },
});

const pdfMemoryFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
    return;
  }
  cb(new AppError('Invoice file must be PDF', 400), false);
};

const pdfMemoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: pdfMemoryFilter,
  limits: { fileSize: maxSize },
});

module.exports = upload;
module.exports.memoryUpload = memoryUpload;
module.exports.pdfMemoryUpload = pdfMemoryUpload;
