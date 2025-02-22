const express = require('express');
const profileController = require('../../controllers/profile.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const profileValidation = require('../../validations/profile.validation');
const { singleFile } = require('../../utils/multer');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(auth('manageUser'), validate(profileValidation.getProfile), profileController.getProfile)
  .post(
    auth('manageUser'),
    validate(profileValidation.createProfile),
    singleFile('tourism/users', 'photo'),
    profileController.createProfile
  )
  .patch(
    auth('manageUser'),
    validate(profileValidation.updateProfile),
    singleFile('tourism/users', 'photo'),
    profileController.updateProfile
  )
  .delete(auth('manageUser'), validate(profileValidation.deleteProfile), profileController.deleteProfile);

module.exports = router;
