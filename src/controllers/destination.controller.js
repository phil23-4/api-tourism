const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { Destination } = require('../models');
const { factoryService, distanceService } = require('../services');

/**
 * @desc      Create New Destination Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { Object } req.body - Body object data
 * @returns   { JSON } - A JSON object representing the status and destination
 */
const createDestination = catchAsync(async (req, res) => {
  if (req.file) req.body.cover = req.file.filename;
  const destination = await factoryService.createOne(Destination, req.body);
  res.status(httpStatus.CREATED).send(destination);
});

/**
 * @desc      Get All Destinations Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { Object } filter - Mongo filter to Select specific fields
 * @property  { Object } options - Query options
 * @property  { String } [options.sortBy] - Sort option in the format: sortField:(desc|asc) to Sort returned data
 * @property  { Number } [options.limit] - Maximum number of results per page (default = 10)
 * @property  { Number } [options.page] - Current page (default = 1)
 * @returns   { JSON } - A JSON object representing the status and destinations
 */
const getDestinations = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const destinations = await factoryService.queryAll(Destination, filter, options);
  res.status(httpStatus.OK).json(destinations);
});

/**
 * @desc      Get Destination Using It's ID Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { String } req.params.destinationId - Destination ID
 * @returns   { JSON } - A JSON object representing the status, and destination
 */
const getDestination = catchAsync(async (req, res) => {
  const destination = await factoryService.getDocById(Destination, req.params.destinationId, {
    path: 'includesAttraction',
    select: 'name summary slug -destination',
  });
  if (!destination) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Destination not found');
  }
  res.status(httpStatus.OK).json(destination);
});

/**
 * @desc      Update Destination Details Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { String } req.params.destinationId - Destination ID
 * @property  { Object } req.body - Body object data
 * @returns   { JSON } - A JSON object representing the status and the destination
 */
const updateDestination = catchAsync(async (req, res) => {
  if (req.file) req.body.cover = req.file.filename;
  const destination = await factoryService.updateDocById(Destination, req.params.destinationId, req.body);
  res.status(httpStatus.OK).json({ status: 'success', destination });
});

/**
 * @desc      Delete Destination Using It's ID Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { String } req.params.destinationId - Destination ID
 * @returns   { JSON } - An empty JSON object
 */
const deleteDestination = catchAsync(async (req, res) => {
  await factoryService.deleteDocById(Destination, req.params.destinationId);
  res.status(httpStatus.NO_CONTENT).json();
});

/**
 * @desc      Retrieve Destinations Within a specific radius Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { Number } req.params.distance - Radius Distance
 * @property  { Number } req.params.latLng - Latitude and Longitude pair of the Destination
 * @returns   { JSON } - A JSON object representing the status, number of results found and destinations
 */
const getDestinationsWithin = catchAsync(async (req, res) => {
  const destination = await distanceService.getPlacesWithin(Destination, req.params);
  res.status(httpStatus.OK).json({ status: 'success', results: destination.length, destination });
});

/**
 * @desc      Get Distances to Destinations from Point Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { Number } req.params.latLng - Latitude and Longitude pair of the Destination
 * @returns   { JSON } - A JSON object representing the status, number of results found and destinations
 */
const getDestinationDistances = catchAsync(async (req, res) => {
  const distance = await distanceService.getDistances(Destination, req.params);
  res.status(httpStatus.OK).json({ results: distance.length, distance });
});

module.exports = {
  createDestination,
  getDestinations,
  getDestination,
  updateDestination,
  deleteDestination,
  getDestinationsWithin,
  getDestinationDistances,
};
