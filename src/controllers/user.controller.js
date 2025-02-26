const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { User, Profile, Review } = require('../models');
const { userService, factoryService } = require('../services');

/**
 * Creates a new user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing user data.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user is created and the response is sent.
 */
const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).json({ status: 'success', user });
});

/**
 * Get users based on query parameters.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.username] - Username to filter users
 * @param {string} [req.query.role] - Role to filter users
 * @param {string} [req.query.sortBy] - Sorting criteria
 * @param {number} [req.query.limit] - Maximum number of users to return
 * @param {number} [req.query.page] - Page number for pagination
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns a promise that resolves to void
 */
const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['username', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const users = await userService.queryUsers(filter, options);
  res.status(httpStatus.OK).json({ status: 'success', users });
});

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object attached to the request
 * @param {string} req.user.id - ID of the user to retrieve
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * @throws {ApiError} - If user is not found
 */
const getUser = catchAsync(async (req, res) => {
  const user = await factoryService.getDocById(User, req.user.id, { path: 'profile' });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.FOUND).json({ status: 'success', user });
});

/**
 * Get reviews based on query parameters.
 * If no user is specified in the query, the logged-in user's ID is used.
 * Filters reviews based on rating, user, attraction, and tour.
 * Supports sorting, pagination, and limiting the number of results.
 * Throws an error if no reviews are found.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.user] - User ID to filter reviews
 * @param {string} [req.query.rating] - Rating to filter reviews
 * @param {string} [req.query.attraction] - Attraction ID to filter reviews
 * @param {string} [req.query.tour] - Tour ID to filter reviews
 * @param {string} [req.query.sortBy] - Sorting criteria
 * @param {number} [req.query.limit] - Limit the number of results
 * @param {number} [req.query.page] - Page number for pagination
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns a promise that resolves to void
 * @throws {ApiError} - Throws an error if no reviews are found
 */
const getReviews = catchAsync(async (req, res) => {
  if (!req.query.user) req.query.user = req.user.id;
  const filter = pick(req.query, ['rating', 'user', 'attraction', 'tour']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const review = await factoryService.queryAll(Review, filter, options);
  if (review.results.length === 0) throw new ApiError(httpStatus.NOT_FOUND, 'No Reviews Found');
  res.status(httpStatus.OK).json({ message: 'success', review });
});

/**
 * Update user details.
 *
 * This function handles the updating of user details except for the password.
 * If an attempt is made to update the password, an error is thrown.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - The request body containing user details to update
 * @param {string} req.body.password - The password field which should not be updated
 * @param {Object} req.params - The request parameters
 * @param {string} req.params.userId - The ID of the user to update
 * @param {Object} res - Express response object
 *
 * @throws {ApiError} If the request body contains a password field
 *
 * @returns {Promise<void>} Sends the updated user details in the response
 */
const updateUser = catchAsync(async (req, res) => {
  // 1) Create an error if user tries to update password data
  if (req.body.password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This route is not for password updates! Please use auth/reset-password');
  }
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

/**
 * Delete a user and their associated profile.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.userId - ID of the user to delete.
 * @param {Object} req.user - Authenticated user object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A promise that resolves when the user and profile are deleted.
 */
const deleteUser = catchAsync(async (req, res) => {
  const user = await factoryService.getDocById(User, req.user.id);
  // Delete user
  await userService.deleteUserById(req.params.userId);
  // Delete associated profile
  await factoryService.deleteDocById(Profile, user.profile);

  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Deactivates the user's account and updates the profile status.
 *
 * @function deleteMyAccount
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.user - User object attached to the request.
 * @param {string} req.user.id - ID of the user.
 * @param {Object} res - Express response object.
 * @throws {ApiError} If the account does not exist.
 * @returns {void}
 */
const deleteMyAccount = catchAsync(async (req, res) => {
  // Find user document and deactivate it
  const user = await userService.updateUserById(req.user.id, { active: 'false' });
  await factoryService.updateDoc(Profile, user.profile, { profile_status: 'false' });
  if (!user.active === true) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account does not exist');
  }
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  getReviews,
  updateUser,
  deleteUser,
  deleteMyAccount,
};
