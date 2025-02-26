const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { Tour } = require('../models');
const { factoryService, tourService, distanceService } = require('../services');

/**
 * Middleware to set default query parameters for fetching top tours.
 *
 * This middleware sets the `limit` query parameter to '5' and the `sortBy` query parameter
 * to '-ratingsAverage' to ensure that the top 5 tours sorted by their average ratings
 * are fetched.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sortBy = '-ratingsAverage';
  next();
};

/**
 * Creates a new tour.
 *
 * This function handles the creation of a new tour. It processes the main image and multiple images
 * from the request, and then creates a new tour using the provided data.
 *
 * @function createTour
 * @async
 * @param {Object} req - The request object.
 * @param {Object} req.file - The main image file.
 * @param {Object} req.files - The files object containing mainImage and images.
 * @param {Object[]} req.files.mainImage - Array containing the main image file.
 * @param {Object[]} req.files.images - Array containing multiple image files.
 * @param {Object} req.body - The body of the request containing tour data.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 */
const createTour = catchAsync(async (req, res) => {
  if (req.params.attractionId) req.body.attraction = req.params.attractionId;
  if (!req.body.attraction) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: 'fail',
      message: 'Please specify an attraction',
    });
  }
  if (req.file) {
    req.body.mainImage = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }
  // Process main image
  if (req.files.mainImage) {
    req.body.mainImage = {
      url: req.files.mainImage[0].path,
      publicId: req.files.mainImage[0].filename,
    };
  }

  // Process multiple images
  if (req.files.images) {
    req.body.images = req.files.images.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));
  }
  const tour = await factoryService.createOne(Tour, req.body);
  res.status(httpStatus.CREATED).json({ status: 'success', tour });
});

/**
 * Get tours based on query parameters or attraction ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} [req.params.attractionId] - ID of the attraction to filter tours.
 * @param {Object} req.query - Query parameters.
 * @param {string} [req.query.rating] - Rating to filter tours.
 * @param {string} [req.query.ratingsAverage] - Average rating to filter tours.
 * @param {string} [req.query.attraction] - Attraction to filter tours.
 * @param {string} [req.query.difficulty] - Difficulty level to filter tours.
 * @param {string} [req.query.duration] - Duration to filter tours.
 * @param {string} [req.query.maxGroupSize] - Maximum group size to filter tours.
 * @param {string} [req.query.price] - Price to filter tours.
 * @param {string} [req.query.name] - Name to filter tours.
 * @param {string} [req.query.sortBy] - Sorting criteria.
 * @param {number} [req.query.limit] - Limit the number of results.
 * @param {number} [req.query.page] - Page number for pagination.
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 * @throws {ApiError} - Throws an error if no tours are found.
 */
const getTours = catchAsync(async (req, res) => {
  let filter = {};
  if (req.params.attractionId) {
    filter = { attraction: req.params.attractionId };
  } else {
    filter = pick(req.query, [
      'rating',
      'ratingsAverage',
      'attraction',
      'difficulty',
      'duration',
      'maxGroupSize',
      'price',
      'name',
    ]);
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const tour = await factoryService.queryAll(Tour, filter, options);
  if (!tour || tour.results.length === 0) throw new ApiError(httpStatus.NOT_FOUND, 'No tours Found');
  res.status(httpStatus.OK).json({ message: 'success', tour });
});

const getTour = catchAsync(async (req, res) => {
  const tour = await factoryService.getDocById(Tour, req.params.tourId, [
    { path: 'reviews' },
    { path: 'tours', select: 'name imageCover' },
  ]);
  if (!tour) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tour not found');
  }
  res.status(httpStatus.OK).json({ status: 'success', tour });
});

const getTourBySlug = catchAsync(async (req, res) => {
  const tour = await factoryService.getDocBySlug(Tour, req.params.slug);
  if (!tour) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tour not found');
  }
  res.status(httpStatus.OK).json({ status: 'success', tour });
});

const updateTour = catchAsync(async (req, res) => {
  // Process main image
  if (req.files.mainImage) {
    req.body.mainImage = {
      url: req.files.mainImage[0].path,
      publicId: req.files.mainImage[0].filename,
    };
  }

  // Process multiple images
  if (req.files.images) {
    req.body.images = req.files.images.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));
  }

  const tour = await factoryService.updateDocById(Tour, req.params.tourId, req.body);
  if (!tour) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tour not found');
  }
  res.status(httpStatus.OK).json({ message: 'Tour Updated Successfully!', data: tour });
});

const deleteTour = catchAsync(async (req, res) => {
  await factoryService.deleteDocById(Tour, req.params.tourId);
  res.status(httpStatus.NO_CONTENT).json();
});

const getToursWithin = catchAsync(async (req, res) => {
  const tours = await distanceService.getPlacesWithin(Tour, req.params);
  res.status(httpStatus.OK).json({ status: 'success', results: tours.length, tours });
});

const getTourDistances = catchAsync(async (req, res) => {
  const distance = await distanceService.getDistances(Tour, req.params);
  res.status(httpStatus.OK).json({ results: distance.length, distance });
});

const tourStats = catchAsync(async (req, res) => {
  const stats = await tourService.getAttractionStats();
  res.status(httpStatus.OK).json({ stats });
});

const tourMonthlyPlan = catchAsync(async (req, res) => {
  const plan = await tourService.getMonthlyPlan();
  res.status(httpStatus.OK).json({ plan });
});

module.exports = {
  aliasTopTours,
  createTour,
  getTours,
  getTour,
  getTourBySlug,
  updateTour,
  deleteTour,
  getToursWithin,
  getTourDistances,
  tourStats,
  tourMonthlyPlan,
};
