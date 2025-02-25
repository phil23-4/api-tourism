const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { Review } = require('../models');
const { factoryService, reviewService } = require('../services');

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

module.exports = { createReview, getReviews };
