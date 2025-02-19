const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const config = require('./config');

// once you register on cloudinary you will get these three keys.
// store them in the .env file and reference them here
cloudinary.config({
  cloud_name: config.cloud.name,
  api_key: config.cloud.api_key,
  api_secret: config.cloud.api_secret,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: (req) => `${config.cloud.project}/${req.originalUrl.split('/').pop()}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
  // params: { resource_type: 'raw' }, => this is in case you want to upload other type of files, not just images
  filename(req, res, cb) {
    cb(null, res.originalname); // The file on cloudinary would have the same name as the original file name
  },
});

module.exports = { storage };
