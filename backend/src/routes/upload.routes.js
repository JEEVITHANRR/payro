// src/routes/upload.routes.js — File upload with Cloudinary support
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { ApiResponse } = require('../utils/apiResponse');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// Configure multer (memory storage, file gets sent to Cloudinary)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'application/pdf',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} not allowed.`, 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.use(authenticate);

// Upload avatar
router.post('/avatar', upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded.', 400);

  let url;

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    const cloudinary = require('cloudinary').v2;
    const streamifier = require('streamifier');

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:         'payro/avatars',
          public_id:      `avatar_${req.user.id}`,
          transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
          overwrite:      true,
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      // Pipe buffer to Cloudinary stream
      const { Readable } = require('stream');
      const readable = new Readable();
      readable.push(req.file.buffer);
      readable.push(null);
      readable.pipe(stream);
    });
    url = result.secure_url;
  } else {
    // Local fallback: return placeholder
    url = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.firstName + '+' + req.user.lastName)}&size=200&background=6750a4&color=fff`;
    logger.warn('Cloudinary not configured — using placeholder avatar URL.');
  }

  // Update user record
  const { prisma } = require('../config/database');
  const { cacheDel } = require('../config/redis');
  await prisma.user.update({ where: { id: req.user.id }, data: { avatarUrl: url } });
  await cacheDel(`user:${req.user.id}`);

  ApiResponse.success(res, { url }, 'Avatar uploaded successfully.');
}));

// Upload expense receipt
router.post('/receipt', upload.single('receipt'), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded.', 400);

  let url;

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    const cloudinary = require('cloudinary').v2;
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'payro/receipts', resource_type: 'auto' },
        (err, result) => { if (err) reject(err); else resolve(result); }
      );
      const { Readable } = require('stream');
      const readable = new Readable();
      readable.push(req.file.buffer);
      readable.push(null);
      readable.pipe(stream);
    });
    url = result.secure_url;
  } else {
    url = `https://placeholder.payro.io/receipt/${Date.now()}.pdf`;
    logger.warn('Cloudinary not configured — using placeholder receipt URL.');
  }

  ApiResponse.success(res, { url }, 'Receipt uploaded successfully.');
}));

module.exports = router;
