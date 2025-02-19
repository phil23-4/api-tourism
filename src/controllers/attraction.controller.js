const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { Attraction } = require('../models');
const { factoryService, attractionService, distanceService } = require('../services');

/**
 * @desc    Get Top 5 Attractions Controller
 * @param   { Object } req - Request object
 * @param   { Object } res - Response object
 * @param   { Object } next - Next function
 */
const aliasTopAttractions = (req, res, next) => {
  req.query.limit = '5';
  req.query.sortBy = '-ratingsAverage';
  next();
};

/**
 * @desc      Create New Attraction Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { Object } req.body - Body object data
 * @returns   { JSON } - A JSON object representing the status and attraction
 */
const createAttraction = catchAsync(async (req, res) => {
  if (req.file) req.body.mainImage = req.file.filename;
  const attraction = await factoryService.createOne(Attraction, req.body);
  res.status(httpStatus.CREATED).json({ status: 'success', attraction });
});

/**
 * @desc      Get All Attractions Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { Object } filter - Mongo filter to Select specific fields
 * @property  { Object } options - Query options
 * @property  { String } [options.sortBy] - Sort option in the format: sortField:(desc|asc) to Sort returned data
 * @property  { Number } [options.limit] - Maximum number of results per page (default = 10)
 * @property  { Number } [options.page] - Current page (default = 1)
 * @returns   { JSON } - A JSON object representing the status and attractions
 */
const getAttractions = catchAsync(async (req, res) => {
  // To Allow for nested GET reviews on attraction (Hack)
  // let filter = {};
  // if (req.params.attractionId) filter = pick(req.query, ['name', 'ratingsAverage'], { attraction: req.params.attractionId });
  const filter = pick(req.query, ['ratingsAverage', 'name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const attractions = await factoryService.queryAll(Attraction, filter, options);
  if (attractions.results.length === 0) {
    res.status(httpStatus.OK).json({ status: 'success', data: 'Attractions list is empty' });
  } else {
    res.status(httpStatus.OK).json({ status: 'success', attractions });
  }
});

/**
 * @desc      Get Attraction Using It's ID Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { String } req.params.AttractionId - Attraction ID
 * @returns   { JSON } - A JSON object representing the status, and Attraction
 */
const getAttraction = catchAsync(async (req, res) => {
  const attraction = await factoryService.getOne(Attraction, req.params.attractionId, [
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
 * @desc      Update Attraction Details Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { String } req.params.attractionId - Attraction ID
 * @property  { Object } req.body - Body object data
 * @returns   { JSON } - A JSON object representing the message and the attraction
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
  const attraction = await factoryService.updateDoc(Attraction, req.params.attractionId, req.body);
  if (!attraction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Attraction not found');
  }
  res.status(httpStatus.OK).json({ message: 'Attraction Updated Successfully!', data: attraction });
});
/**
 * @desc      Delete Attraction Using It's ID Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { String } req.params.attractionId - Attraction ID
 * @returns   { JSON } - An empty JSON object
 */
const deleteAttraction = catchAsync(async (req, res) => {
  await factoryService.deleteDocById(Attraction, req.params.attractionId);
  res.status(httpStatus.NO_CONTENT).json();
});

/**
 * @desc      Retrieve Attractions Within a specific radius Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { Number } req.params.distance - Radius Distance
 * @property  { Number } req.params.latLng - Latitude and Longitude pair of the Attraction
 * @returns   { JSON } - A JSON object representing the status, number of results found and Attractions
 */
const getAttractionsWithin = catchAsync(async (req, res) => {
  const attraction = await distanceService.getPlacesWithin(Attraction, req.params);
  res.status(httpStatus.OK).json({ status: 'success', results: Attraction.length, attraction });
});

/**
 * @desc      Get Distances to Attractions from Point Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { Number } req.params.latLng - Latitude and Longitude pair of the Attraction
 * @returns   { JSON } - A JSON object representing the status, number of results found and Attractions
 */
const getAttractionDistances = catchAsync(async (req, res) => {
  const distance = await distanceService.getDistances(Attraction, req.params);
  res.status(httpStatus.OK).json({ results: distance.length, distance });
});

/**
 * @desc   Controller to Calculate the attraction statistics
 * @param   { Object } req - request object
 * @param   { Object } res - response object
 * @returns  { JSON } - A JSON object representing the status,and specific statistics about the attraction
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
