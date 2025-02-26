// Utils
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

// Models
const { Review } = require('../models');

/**
 * @desc    Create New Review
 * @param   { Object } body - Body object data
 * @param   { String } attraction - Attraction ID
 * @param   { Object } user - An object contains logged in user data
 * @returns { Promise<review> }
 */
const createReview = async (reviewBody) => {
  const checkUser = await Review.find({ user: reviewBody.user, attraction: reviewBody.attraction });

  // 1) Check if the user make a review before on that attraction
  if (checkUser.length !== 0)
    throw new ApiError(httpStatus.FORBIDDEN, `You've already reviewed this attraction!  Use update instead.`);

  // 2) Create review
  const newReview = await Review.create(reviewBody);

  return newReview;
};

/**
 * @desc    Update Review Using It's ID
 * @param   { String } userId - userId
 * @param   { String } reviewId - Review ID
 * @param   { Object } body - Body object data
 * @returns { Object<updatedReview> }
 */
const updateReview = async (userId, reviewId, updateBody) => {
  // const { review, rating } = updateBody;

  const review = await Review.findById(reviewId);

  // 1) Check if review exists
  if (!review) throw new ApiError(httpStatus.NOT_FOUND, 'Review does not exist!');

  // 2) Check if the one who want to update review is the review creator
  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, `You're not the original reviewer`);
  }
  Object.assign(review, updateBody);
  await review.save();
  return review;
};

/**
 * @desc    Delete Review Using It's ID
 * @param   { String } reviewId - Review ID
 * @param   { String } userId - User ID
 * @returns { Object<message> }
 */
const deleteReview = async (userId, reviewId) => {
  const review = await Review.findById(reviewId);
  // 1) Check if review exists
  if (!review) throw new ApiError(httpStatus.NOT_FOUND, 'Review not found!');
  // 2) Check if the one who want to update review is the review creator
  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, `Only the original reviewer can delete review!`);
  }
  await review.remove();
  return null;
};

module.exports = { createReview, updateReview, deleteReview };
