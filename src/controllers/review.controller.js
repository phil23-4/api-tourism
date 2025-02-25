const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { Review } = require('../models');
const { factoryService, reviewService } = require('../services');

/**
 * Create a new review.
 *
 * This function handles the creation of a new review for a tour or an attraction.
 * It checks if the `tourId` or `attractionId` is provided in the request parameters
 * and assigns them to the request body. It also assigns the user ID from the request
 * to the request body. If neither `tourId` nor `attractionId` is provided, it returns
 * a bad request response.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} [req.params.tourId] - The ID of the tour.
 * @param {string} [req.params.attractionId] - The ID of the attraction.
 * @param {Object} req.body - The request body.
 * @param {Object} req.user - The authenticated user.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
const createReview = catchAsync(async (req, res) => {
  if (req.params.tourId) req.body.tour = req.params.tourId;
  if (req.params.attractionId) req.body.attraction = req.params.attractionId;
  req.body.user = req.user.id;
  if (!req.body.tour && !req.body.attraction) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: 'fail',
      message: 'Please specify either a tour or attraction',
    });
  }

  const review = await reviewService.createReview(req.body);
  res.status(httpStatus.CREATED).json({ status: 'success', review });
});

/**
 * Get reviews based on filters and options.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.params - URL parameters.
 * @param {string} [req.params.attractionId] - ID of the attraction to filter reviews.
 * @param {Object} req.query - Query parameters.
 * @param {string} [req.query.rating] - Rating to filter reviews.
 * @param {string} [req.query.user] - User ID to filter reviews.
 * @param {string} [req.query.sortBy] - Field to sort reviews by.
 * @param {number} [req.query.limit] - Maximum number of reviews to return.
 * @param {number} [req.query.page] - Page number for pagination.
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 *
 * @throws {ApiError} - Throws an error if no reviews are found.
 */
const getReviews = catchAsync(async (req, res) => {
  let filter = {};
  if (req.params.attractionId) {
    filter = { attraction: req.params.attractionId };
  } else if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  } else {
    filter = pick(req.query, ['rating', 'user', 'attraction', 'tour']);
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const review = await factoryService.queryAll(Review, filter, options);
  if (!review || review.results.length === 0) throw new ApiError(httpStatus.NOT_FOUND, 'No Reviews Found');
  res.status(httpStatus.OK).json({ message: 'success', review });
});

/**
 * Get a review by ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.reviewId - ID of the review to retrieve.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 * @throws {ApiError} - Throws an error if the review is not found.
 */
const getReview = catchAsync(async (req, res) => {
  const review = await factoryService.getDocById(Review, req.params.reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }
  res.status(httpStatus.OK).json({ status: 'success', review });
});

/**
 * Updates a review based on the provided tour or attraction ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.tourId - ID of the tour.
 * @param {string} req.params.attractionId - ID of the attraction.
 * @param {string} req.params.reviewId - ID of the review to be updated.
 * @param {Object} req.body - Request body.
 * @param {Object} req.user - Authenticated user.
 * @param {string} req.user.id - ID of the authenticated user.
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 *
 * @throws {Error} - Throws an error if the review update fails.
 */
const updateReview = catchAsync(async (req, res) => {
  if (req.params.tourId) req.body.tour = req.params.tourId;
  if (req.params.attractionId) req.body.attraction = req.params.attractionId;
  req.body.user = req.user.id;
  if (!req.body.tour && !req.body.attraction) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: 'fail',
      message: 'Please specify either a tour or attraction',
    });
  }
  const review = await reviewService.updateReview(req.user.id, req.params.reviewId, req.body);
  res.status(httpStatus.OK).json({ message: 'success', review });
});

/**
 * Delete a review
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object
 * @param {string} req.user.id - ID of the user
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.reviewId - ID of the review to be deleted
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const deleteReview = catchAsync(async (req, res) => {
  await reviewService.deleteReview(req.user.id, req.params.reviewId);
  res.status(httpStatus.OK).json({ message: 'review deleted successfully' });
});

module.exports = { createReview, getReviews, getReview, updateReview, deleteReview };
