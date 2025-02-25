// Packages
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const httpStatus = require('http-status');
const ApiError = require('./ApiError');
const { storage } = require('../config/cloudinary.config');

// Default configuration
const uploadConfig = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10, // Maximum 4 files (1 main + 3 array images)
  },
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

// Centralized error handler
const handleMulterError = (err, res) => {
  const errorMap = {
    LIMIT_FILE_SIZE: {
      status: 413,
      message: `File too large. Maximum size is ${uploadConfig.limits.fileSize / 1024 / 1024}MB`,
    },
    LIMIT_FILE_TYPE: {
      status: httpStatus.UNSUPPORTED_MEDIA_TYPE,
      message: `Invalid file type. Allowed types: ${uploadConfig.allowedMimeTypes.join(', ')}`,
    },
    LIMIT_FILE_COUNT: {
      status: 413,
      message: `Maximum ${uploadConfig.limits.files} files allowed`,
    },
    ECONNRESET: {
      status: 499,
      message: 'Connection closed by client',
    },
    ETIMEDOUT: {
      status: 504,
      message: 'Connection timed out',
    },
  };

  const error = errorMap[err.code] || {
    status: httpStatus.BAD_REQUEST,
    message: 'File upload error',
  };

  res.status(error.status).json({ error: error.message });
};
// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_FILE_TYPE'), false);
  }
};

/**
 * Upload single image
 * @param {String} name
 */
exports.singleFile = (folder, name) => (req, res, next) => {
  const upload = multer({
    storage: storage(folder),
    limits: { fileSize: uploadConfig.limits.fileSize },
    fileFilter,
  }).single(name);

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return handleMulterError(err, res);
    }
    if (err) return next(new ApiError(err.message, httpStatus.INTERNAL_SERVER_ERROR));

    next();
  });
};

/**
 * Upload any number of images with any name
 */
exports.anyMulter = () => (req, res, next) => {
  const upload = multer({
    storage,
    limits: { fileSize: uploadConfig.limits.fileSize },
    fileFilter,
  }).any();

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return handleMulterError(err, res);
    }
    // An unknown error occurred when uploading.
    if (err) return next(new ApiError(err.message, httpStatus.INTERNAL_SERVER_ERROR));
    next();
  });
};
/**
 * Accept a mix of files, specified by fields. An object with arrays of files will be stored in req.files.
 */
exports.multipleFiles = (folder, fields) => (req, res, next) => {
  const upload = multer({
    storage: storage(folder),
    limits: {
      fileSize: uploadConfig.limits.fileSize,
      files: uploadConfig.limits.files,
    },
    fileFilter,
  }).fields(fields);

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return handleMulterError(err, res);
    }
    // An unknown error occurred when uploading.
    if (err) return next(new ApiError(err.message, httpStatus.INTERNAL_SERVER_ERROR));
    next();
  });
};

exports.destroyFile = (PublicID) => cloudinary.v2.uploader.destroy(PublicID, (err, des) => des);
