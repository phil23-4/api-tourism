const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { Attraction } = require('../models');
const { factoryService, attractionService, distanceService } = require('../services');

/**
 * Middleware to set default query parameters for fetching top attractions.
 *
 * This middleware sets the `limit` query parameter to '5' and the `sortBy` query parameter
 * to '-ratingsAverage' to ensure that the top 5 attractions sorted by their average ratings
 * are fetched.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const aliasTopAttractions = (req, res, next) => {
  req.query.limit = '5';
  req.query.sortBy = '-ratingsAverage';
  next();
};

/**
 * Creates a new attraction.
 *
 * This function handles the creation of a new attraction. It processes the main image and multiple images
 * from the request, and then creates a new attraction using the provided data.
 *
 * @function createAttraction
 * @async
 * @param {Object} req - The request object.
 * @param {Object} req.file - The main image file.
 * @param {Object} req.files - The files object containing mainImage and images.
 * @param {Object[]} req.files.mainImage - Array containing the main image file.
 * @param {Object[]} req.files.images - Array containing multiple image files.
 * @param {Object} req.body - The body of the request containing attraction data.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 */
const createAttraction = catchAsync(async (req, res) => {
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
  const attraction = await factoryService.createOne(Attraction, req.body);
  res.status(httpStatus.CREATED).json({ status: 'success', attraction });
});

/**
 * Get a list of attractions based on query parameters.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Query parameters for filtering and pagination.
 * @param {string} [req.query.ratingsAverage] - Filter attractions by average ratings.
 * @param {string} [req.query.name] - Filter attractions by name.
 * @param {string} [req.query.sortBy] - Sort results by specified field (sortField:(desc|asc) to Sort returned data).
 * @param {number} [req.query.limit] - Limit the number of results returned (default = 10).
 * @param {number} [req.query.page] - Specify the page of results to return (default = 1).
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 */
const getAttractions = catchAsync(async (req, res) => {
  // To Allow for nested GET reviews on attraction (Hack)
  // let filter = {};
  // if (req.params.attractionId) filter = pick(req.query, ['name', 'ratingsAverage'], { attraction: req.params.attractionId });
  const filter = pick(req.query, ['ratingsAverage', 'name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const attractions = await factoryService.queryAll(Attraction, filter, options);
  if (!attractions || attractions.results.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Attractions Found');
  }
  res.status(httpStatus.OK).json({ status: 'success', attractions });
});

/**
 * Get an attraction by ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.attractionId - ID of the attraction to retrieve.
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @throws {ApiError} - Throws an error if the attraction is not found.
 */
const getAttraction = catchAsync(async (req, res) => {
  const attraction = await factoryService.getDocById(Attraction, req.params.attractionId, [
    { path: 'reviews' },
    { path: 'tours', select: 'name imageCover' },
  ]);
  if (!attraction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Attraction not found');
  }
  res.status(httpStatus.OK).json({ status: 'success', attraction });
});

/**
 * @desc      Get Attraction Using It's Slug Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { String } req.params.slug - Attraction slug
 * @returns   { JSON } - A JSON object representing the status, and Attraction
 */
const getAttractionBySlug = catchAsync(async (req, res) => {
  const attraction = await factoryService.getDocBySlug(Attraction, req.params.slug);
  if (!attraction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Attraction not found');
  }
  res.status(httpStatus.OK).json({ status: 'success', attraction });
});

/**
 * Update an attraction.
 *
 * This function handles the updating of an attraction's details. It processes the main image and multiple images
 * if they are provided in the request files. The processed images are then added to the request body before
 * updating the attraction document in the database.
 *
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The request body containing the attraction details to be updated.
 * @param {Object} req.files - The files uploaded in the request.
 * @param {Object} req.files.mainImage - The main image file uploaded.
 * @param {Object[]} req.files.images - The multiple image files uploaded.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.attractionId - The ID of the attraction to be updated.
 * @param {Object} res - Express response object.
 * @throws {ApiError} If the attraction is not found.
 * @returns {Promise<void>} A promise that resolves to void.
 */
const updateAttraction = catchAsync(async (req, res) => {
  // const updateData = pick(req.body, ['name', 'altName', 'mainImage', 'openingHours']);
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
  // if (req.files.image) {
  //   req.body.highlightSpots.forEach((spot, i) => {
  //     spot.image = req.files.image.map((file) => ({
  //       url: file[i].path,
  //       publicId: file[i].filename,
  //     }));
  //   });
  // }
  const attraction = await factoryService.updateDocById(Attraction, req.params.attractionId, req.body);
  if (!attraction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Attraction not found');
  }
  res.status(httpStatus.OK).json({ message: 'Attraction Updated Successfully!', data: attraction });
});

/**
 * Deletes an attraction by its ID.
 *
 * This function is an asynchronous handler that deletes an attraction document
 * from the database using the provided attraction ID from the request parameters.
 * It sends a response with HTTP status 204 (No Content) upon successful deletion.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.attractionId - ID of the attraction to be deleted
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - A promise that resolves when the attraction is deleted
 */
const deleteAttraction = catchAsync(async (req, res) => {
  await factoryService.deleteDocById(Attraction, req.params.attractionId);
  res.status(httpStatus.NO_CONTENT).json();
});

/**
 * Get attractions within a specified distance.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @property  { Number } req.params.distance - Radius Distance
 * @property  { Number } req.params.latLng - Latitude and Longitude pair of the Attraction
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
const getAttractionsWithin = catchAsync(async (req, res) => {
  const attraction = await distanceService.getPlacesWithin(Attraction, req.params);
  res.status(httpStatus.OK).json({ status: 'success', results: attraction.length, attraction });
});

/**
 * Controller to get distances of attractions from a specified point.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @property  { Number } req.params.latLng - Latitude and Longitude pair of the Attraction
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns a promise that resolves to void
 */
const getAttractionDistances = catchAsync(async (req, res) => {
  const distance = await distanceService.getDistances(Attraction, req.params);
  res.status(httpStatus.OK).json({ results: distance.length, distance });
});

/**
 * Controller function to get attraction statistics.
 *
 * This function is an asynchronous handler that retrieves attraction statistics
 * from the attractionService and sends them in the response.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const attractionStats = catchAsync(async (req, res) => {
  const stats = await attractionService.getAttractionStats();
  res.status(httpStatus.OK).json({ stats });
});

module.exports = {
  aliasTopAttractions,
  createAttraction,
  getAttractions,
  getAttraction,
  getAttractionBySlug,
  updateAttraction,
  deleteAttraction,
  getAttractionsWithin,
  getAttractionDistances,
  attractionStats,
};
