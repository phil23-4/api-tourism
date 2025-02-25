const express = require('express');
const { reviewController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { reviewValidation } = require('../../validations');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(auth('createReview'), validate(reviewValidation.createReview), reviewController.createReview)
  .get(auth('manageReviews'), validate(reviewValidation.getReviews), reviewController.getReviews);

router
  .route('/:reviewId')
  .get(auth('manageReviews'), validate(reviewValidation.getReview), reviewController.getReview)
  .patch(auth('manageReviews'), validate(reviewValidation.updateReview), reviewController.updateReview)
  .delete(auth('deleteReview'), validate(reviewValidation.deleteReview), reviewController.deleteReview);
module.exports = router;
