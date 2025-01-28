// Packages
const multer = require('multer');
const ApiError = require('./ApiError');

const storage = multer.memoryStorage();

const limits = {
  fileSize: 1024 * 1024,
};

const fileFilter = (req, file, cb) => {
  // if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|WEBP|webp)$/)) {
  if (!file.mimetype.startsWith('image/')) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new ApiError('Not an image! Please upload only images', 400), false);
  }
  cb(null, true);
};

/**
 * Upload single image
 * @param {String} name
 */
exports.singleFile = (name) => (req, res, next) => {
  const upload = multer({
    storage,
    limits,
    fileFilter,
  }).single(name);

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new ApiError(`Cannot Upload More Than 1 Image`, 500));
      }
    }

    if (err) return next(new ApiError(err, 500));
    next();
  });
};

/**
 * Upload any number of images with any name
 */
exports.anyMulter = () => (req, res, next) => {
  const upload = multer({
    storage,
    limits,
    fileFilter,
  }).any();

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return next(new ApiError(`A Multer error occurred when uploading`, 500));
    }
    // An unknown error occurred when uploading.
    if (err) return next(new ApiError(err, 500));
    next();
  });
};
/**
 * Accept a mix of files, specified by fields. An object with arrays of files will be stored in req.files.
 */
exports.multipleFiles = () => (req, res, next) => {
  const upload = multer({
    storage,
    limits,
    fileFilter,
  }).fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'images', maxCount: 3 },
  ]);

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return next(new ApiError(`A Multer error occurred when uploading`, 500));
    }
    // An unknown error occurred when uploading.
    if (err) return next(new ApiError(err, 500));
    next();
  });
};
