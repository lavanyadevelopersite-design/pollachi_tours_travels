const fs = require('fs');
const path = require('path');
const AppError = require('../utils/AppError');

const IMAGE_SIGNATURES = [
  {
    mime: 'image/webp',
    ext: '.webp',
    check: (buf) =>
      buf.length >= 12 &&
      buf.toString('ascii', 0, 4) === 'RIFF' &&
      buf.toString('ascii', 8, 12) === 'WEBP',
  },
  {
    mime: 'image/png',
    ext: '.png',
    check: (buf) => buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47,
  },
  {
    mime: 'image/jpeg',
    ext: '.jpg',
    check: (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  {
    mime: 'image/gif',
    ext: '.gif',
    check: (buf) => buf.length >= 3 && buf.toString('ascii', 0, 3) === 'GIF',
  },
];

const getFileUrl = (file) => {
  if (!file) return null;
  return `/uploads/${file.fieldname || 'files'}/${file.filename}`;
};

const readFileHeader = (fullPath) => {
  const fd = fs.openSync(fullPath, 'r');
  try {
    const buf = Buffer.alloc(16);
    fs.readSync(fd, buf, 0, 16, 0);
    return buf;
  } finally {
    fs.closeSync(fd);
  }
};

/**
 * If the saved file extension/mimetype doesn't match real content (e.g. WebP named .jpg),
 * rename it so express.static serves the correct Content-Type.
 */
const normalizeUploadedImage = (file) => {
  if (!file?.path || !file.filename) return getFileUrl(file);

  const header = readFileHeader(file.path);
  const detected = IMAGE_SIGNATURES.find((s) => s.check(header));
  if (!detected) return getFileUrl(file);

  const currentExt = path.extname(file.filename).toLowerCase();
  if (currentExt === detected.ext) {
    file.mimetype = detected.mime;
    return getFileUrl(file);
  }

  const baseName = currentExt
    ? file.filename.slice(0, -currentExt.length)
    : file.filename;
  const newFilename = `${baseName}${detected.ext}`;
  const newPath = path.join(path.dirname(file.path), newFilename);

  fs.renameSync(file.path, newPath);
  file.filename = newFilename;
  file.path = newPath;
  file.mimetype = detected.mime;

  return getFileUrl(file);
};

const deleteFile = async (relativePath) => {
  if (!relativePath) return false;
  const fullPath = path.join(__dirname, '../../', relativePath.replace(/^\//, ''));
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
};

const ensureUpload = (file) => {
  if (!file) throw new AppError('No file uploaded', 400);
  const url = normalizeUploadedImage(file);
  return {
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url,
  };
};

module.exports = { getFileUrl, deleteFile, ensureUpload, normalizeUploadedImage };
