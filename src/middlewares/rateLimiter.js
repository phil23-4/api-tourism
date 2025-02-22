const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  skipSuccessfulRequests: true,
  message: 'Too many upload requests from this IP, please try again later',
});

module.exports = {
  authLimiter,
  uploadLimiter,
};
