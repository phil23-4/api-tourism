const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { User, Profile } = require('../models');
const { factoryService, profileService } = require('../services');

/**
 * @desc      Create New User Profile
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { Object } req.body - Body object data
 * @returns   { JSON } - A JSON object representing the status and user
 */
const createProfile = catchAsync(async (req, res) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (req.file) {
    req.body.photo = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  const newProfile = await profileService.createProfile(req.body);
  // Link profile to user
  await factoryService.updateDocById(User, req.user.id, { profile: newProfile._id });
  res.status(httpStatus.CREATED).json({ status: 'success', newProfile });
});

/**
 * @desc      Get Profile Using It's ID Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { String } req.params.profileId - Profile ID
 * @returns   { JSON } - A JSON object representing the status, and profile
 */
const getProfile = catchAsync(async (req, res) => {
  const profile = await factoryService.getDocById(Profile, req.params.profileId);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  res.status(httpStatus.OK).json({ status: 'success', data: profile });
});

/**
 * @desc      Update LoggedIn User Profile Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { Object } req.body - Body object data
 * @property  { Object } req.params.profileId - An object contains logged in user profile
 * @returns   { JSON } - A JSON object representing the status, and user data
 */
const updateProfile = catchAsync(async (req, res) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (req.file) {
    req.body.photo = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  // const updateData = pick(req.body, ['personal_info.firstName', 'personal_info.lastName', 'personal_info.age', 'photo']);
  const profile = await factoryService.updateDoc(Profile, req.params.profileId, req.body);
  res.status(httpStatus.OK).json({ status: 'success', data: profile });
});

/**
 * @desc      Delete Profile Using It's ID Controller
 * @param     { Object } req - Request object
 * @param     { Object } res - Response object
 * @property  { String } req.params.profileId - Profile ID
 * @returns   { JSON } - An empty JSON object
 */
const deleteProfile = catchAsync(async (req, res) => {
  await factoryService.deleteDocById(Profile, req.params.profileId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = { createProfile, getProfile, updateProfile, deleteProfile };
