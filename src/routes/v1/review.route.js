const express = require('express');
const { reviewController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { reviewValidation } = require('../../validations');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(auth('manageUser'), validate(reviewValidation.createReview), reviewController.createReview)
  .get(auth('getUsers'), validate(reviewValidation.getReviews), reviewController.getReviews);

module.exports = router;
